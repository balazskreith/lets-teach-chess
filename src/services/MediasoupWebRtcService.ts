import { Device, types as mediasoup } from 'mediasoup-client';
import { tomaszChessService } from './CloudSfuService';
import { config } from '../config';
import {
  RouterConfig,
  RouterSnapshot,
  WebRtcTransportConfig,
  MediaProducerConfig,
  MediaConsumerConfig,
  WebRtcTransportSnapshot,
  MediaProducerSnapshot,
  MediaConsumerSnapshot,
  DataProducerSnapshot,
  DataConsumerSnapshot
} from '../types/cloudsfu-api';
import { EventEmitter } from 'events';
import { ClientMonitor } from '@observertc/client-monitor-js';

export interface CreateProducerOptions {
  track: MediaStreamTrack;
  encodings?: RTCRtpEncodingParameters[];
  codecOptions?: any;
  appData?: any;
}

export interface MediasoupServiceOptions {
  routerConfig: RouterConfig;
  allowedProtocols: ('udp' | 'tcp')[];
}

export type MediasoupServiceEventMap = {
    'connected': [RouterSnapshot, mediasoup.Device];
}

class MediasoupService extends EventEmitter {
    public device: Device;
    public monitor: ClientMonitor;
    public router: RouterSnapshot | null = null;
    public sendTransport: Promise<mediasoup.Transport<WebRtcTransportSnapshot>> | null = null;
    public recvTransport: Promise<mediasoup.Transport<WebRtcTransportSnapshot>> | null = null;
    public readonly producers: Map<string, mediasoup.Producer<MediaProducerSnapshot>> = new Map();
    public readonly consumers: Map<string, mediasoup.Consumer<MediaConsumerSnapshot>> = new Map();
    public readonly dataProducers: Map<string, mediasoup.DataProducer<DataProducerSnapshot>> = new Map();
    public readonly dataConsumers: Map<string, mediasoup.DataConsumer<DataConsumerSnapshot>> = new Map();
    public isLoading: boolean = false;
    public error: string | null = null;

    public constructor(
        public readonly options: MediasoupServiceOptions
    ) {
        super();
        // Initialize device
        this.device = new Device();
        this.monitor = new ClientMonitor();

        this.monitor.addSource(this.device);
    }

    // Create router and initialize device
    public async createRouter(routerConfig?: RouterConfig): Promise<RouterSnapshot> {
        if (this.router) throw new Error('Router already exists and connected');
        if (this.device.loaded) throw new Error('Device already loaded');
        // Initialize device if not exists
        let device = this.device;

        // Create router
        const routerSnapshot = await tomaszChessService.createRouter(routerConfig || this.options.routerConfig);

        if (this.device.loaded) throw new Error('Device got loaded meanwhile router creation');

        // Load device with RTP capabilities
        await device.load({ routerRtpCapabilities: routerSnapshot.rtpCapabilities as any });

        if (config.enableDebugLogs) {
            console.log('MediasoupService: Router created:', routerSnapshot.id);
        }

        this.router = routerSnapshot;

        this.emit('connected', routerSnapshot, this.device);
        return routerSnapshot
    }

    public async connectToRouter(routerId: string): Promise<RouterSnapshot> {
        if (this.router) {
            if (this.router.id !== routerId) throw new Error('Router already exists and connected');
            return this.router;
        }
        if (this.device.loaded) throw new Error('Device already loaded');

        const routerSnapshot = await tomaszChessService.getRouter(routerId);

        if (this.device.loaded) throw new Error('Device got loaded meanwhile router creation');

        await this.device.load({ routerRtpCapabilities: routerSnapshot.rtpCapabilities as any });

        if (config.enableDebugLogs) {
            console.log('MediasoupService: Router connected:', routerSnapshot.id);
        }

        this.router = routerSnapshot;

        return routerSnapshot;
    }

    public async createSendTransport(transportConfig?: WebRtcTransportConfig): Promise<mediasoup.Transport> {
        if (this.sendTransport) {
            return this.sendTransport;
        }

        this.sendTransport = this.createTransport('createSendTransport', transportConfig ?? {
            allowedProtocols: this.options.allowedProtocols,

        });

        const routerId = this.router!.id;
        const transport = await this.sendTransport;

        transport.on('produce', async (parameters: any, callback: any, errback: any) => {
            try {
                const producerConfig: MediaProducerConfig = {
                    rtpParameters: parameters.rtpParameters,
                    kind: parameters.kind,
                    transportId: transport.id,
                    paused: false
                };

                const producerSnapshot = await tomaszChessService.createMediaProducer(
                    routerId,
                    producerConfig
                );

                callback({ id: producerSnapshot.id });
            } catch (error) {
                errback(new Error(`${error}`));
            }
        });

        transport.observer.once('close', () => {
            if (config.enableDebugLogs) {
                console.log('MediasoupService: Send transport closed');
            }
            this.sendTransport = null;
        });

        return transport;
    }

    public async createRecvTransport(transportConfig?: WebRtcTransportConfig): Promise<mediasoup.Transport> {
        if (this.recvTransport) {
            return this.recvTransport;
        }

        this.recvTransport = this.createTransport('createRecvTransport', transportConfig ?? {
            allowedProtocols: this.options.allowedProtocols,
        });

        const transport = await this.recvTransport;

        transport.observer.once('close', () => {
            if (config.enableDebugLogs) {
                console.log('MediasoupService: Receive transport closed');
            }
            this.recvTransport = null;
        });

        return transport;
    }

    public async createMediaProducer(options: CreateProducerOptions): Promise<mediasoup.Producer> {
        if (!this.router || !this.device) {
            throw new Error('Router not connected or device not initialized');
        } else if (!this.sendTransport) {
            throw new Error('Send transport not created. Call createSendTransport first.');
        }
        
        const routerId = this.router.id;
        const sendTransport = await this.sendTransport;
        const producer = await sendTransport.produce({
            track: options.track,
            encodings: options.encodings,
            codecOptions: options.codecOptions,
            stopTracks: false,
            appData: {} as any,
        });

        producer.observer.once('close', () => {
            tomaszChessService.deleteMediaProducer(routerId, producer.id).catch(err => console.error('Failed to delete media producer:', err));
            this.producers.delete(producer.id);
        });
        this.producers.set(producer.id, producer);  

        producer.appData = await tomaszChessService.getMediaProducer(routerId, producer.id);

        return producer;
    }

    public async createMediaConsumer(mediaProducerId: string): Promise<mediasoup.Consumer<MediaConsumerSnapshot>> {
        if (!this.router || !this.device) {
           throw new Error('Router not connected or device not initialized');
        } else if (!this.recvTransport) {
           throw new Error('Receive transport not created. Call createRecvTransport first.');
        }

        const routerId = this.router.id;
        const recvTransport = await this.recvTransport;
        const config: MediaConsumerConfig = {
            mediaProducerId,
            transportId: recvTransport.id,
        };
        const consumerSnapshot = await tomaszChessService.createMediaConsumer(
            routerId,
            config
        );

        const consumer = await recvTransport.consume({
            id: consumerSnapshot.id,
            producerId: consumerSnapshot.mediaProducerId,
            kind: consumerSnapshot.kind,
            rtpParameters: consumerSnapshot.rtpParameters as any,
            appData: consumerSnapshot,
        });

        consumer.observer.once('close', () => {
            tomaszChessService.deleteMediaConsumer(routerId, consumer.id).catch(err => console.error('Failed to delete media consumer:', err));
            this.consumers.delete(consumer.id);
        });
        this.consumers.set(consumer.id, consumer);

        return consumer;
    }


    // Cleanup function
    public cleanup(): void {
        // we delete the router which will delete everything related to it
        // Close all producers
        this.producers.forEach(p => p.close());
        this.producers.clear();
        // Close all consumers
        this.consumers.forEach(c => c.close());
        this.consumers.clear();
        // Close transports
        const routerId = this.router?.id;

        if (routerId) {
            (async () => {
                try {
                    if (this.sendTransport) {
                        const transport = await this.sendTransport;
                        await tomaszChessService.deleteWebRTCTransport(routerId, transport.id);
                    }

                    if (this.recvTransport) {
                        const transport = await this.recvTransport;
                        await tomaszChessService.deleteWebRTCTransport(routerId, transport.id);
                    }

                    await tomaszChessService.deleteRouter(routerId);
                } catch (err) {
                    console.error('Failed to clean up MediasoupService:', err);
                }
            })();
        }
        
        this.sendTransport?.then(t => t.close()).catch(err => console.error('Failed to close send transport:', err));
        this.recvTransport?.then(t => t.close()).catch(err => console.error('Failed to close receive transport:', err));
        this.router = null;
        this.device = new Device(); // Reset device to a new instance
        if (config.enableDebugLogs) {
            console.log('MediasoupService: Cleaned up');
        }
    }


    private async createTransport(method: 'createSendTransport' | 'createRecvTransport', transportConfig: WebRtcTransportConfig): Promise<mediasoup.Transport<WebRtcTransportSnapshot>> {
        if (!this.router || !this.device) {
            throw new Error('Router not connected or device not initialized');
        }   

        const transportSnapshot = await tomaszChessService.createWebRTCTransport(
            this.router.id,
            transportConfig
        );

        const routerId = this.router.id;
        const transport = this.device[method]({
            id: transportSnapshot.id,
            iceParameters: transportSnapshot.iceParameters,
            iceCandidates: transportSnapshot.iceCandidates,
            dtlsParameters: transportSnapshot.dtlsParameters,
            sctpParameters: transportSnapshot.sctpParameters,
            iceServers: transportSnapshot.iceServers,
            iceTransportPolicy: 'relay',
            appData: transportSnapshot,
        });

        transport.on('connect', async ({ dtlsParameters }: any, callback: any, errback: any) => {
            try {
                await tomaszChessService.connectWebRTCTransport(
                    this.router!.id,
                    transportSnapshot.id,
                    { dtlsParameters }
                );
                callback();
            } catch (error) {
                errback(error);
            }
        });

        transport.on('connectionstatechange', (state: string) => {
            if (config.enableDebugLogs) {
                console.log(`MediasoupService: Transport state changed to ${state}`);
            }
        });

        if (config.enableDebugLogs) {
            console.log('MediasoupService: Transport created:', transportSnapshot.id);
        }

        return transport;
    }
}

export { MediasoupService };

export const mediasoupWebRtcService = new MediasoupService({
    routerConfig: {
        
    },
    allowedProtocols: ['udp', 'tcp']
});