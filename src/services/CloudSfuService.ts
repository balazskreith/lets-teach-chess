import { 
  RouterConfig,
  RouterSnapshot,
  WebRtcTransportConfig,
  WebRtcTransportSnapshot,
  ConnectWebRtcTransportParams,
  MediaProducerConfig,
  MediaProducerSnapshot,
  MediaConsumerConfig,
  MediaConsumerSnapshot,
} from '../types/cloudsfu-api';
import { config } from '../config';

export class CloudSfuService {
  private serverUrl: string;
  private enableDebugLogs: boolean;

  constructor(serverUrl?: string, enableDebugLogs?: boolean) {
    this.serverUrl = serverUrl || config.controllerUrl;
    this.enableDebugLogs = enableDebugLogs ?? config.enableDebugLogs;
  }

  // API Endpoints
  private get apiEndpoints() {
    return {
      // client samples
      clientSamples: '/client-samples',
      // Router management
      createRouter: '/routers',
      getRouter: (routerId: string) => `/routers/${routerId}`,
      deleteRouter: (routerId: string) => `/routers/${routerId}`,
      
      // Transport management
      createWebRTCTransport: (routerId: string) => `/routers/${routerId}/webrtc-transports`,
      getWebRTCTransport: (routerId: string, transportId: string) => `/routers/${routerId}/webrtc-transports/${transportId}`,
      connectWebRTCTransport: (routerId: string, transportId: string) => `/routers/${routerId}/webrtc-transports/${transportId}/connect`,
      deleteWebRTCTransport: (routerId: string, transportId: string) => `/routers/${routerId}/webrtc-transports/${transportId}`,
      
      // Media management
      createMediaProducer: (routerId: string) => `/routers/${routerId}/media-producers`,
      getMediaProducer: (routerId: string, producerId: string) => `/routers/${routerId}/media-producers/${producerId}`,
      getMediaProducerIds: (routerId: string) => `/routers/${routerId}/media-producers`,
      deleteMediaProducer: (routerId: string, producerId: string) => `/routers/${routerId}/media-producers/${producerId}`,
      pauseMediaProducer: (routerId: string, producerId: string) => `/routers/${routerId}/media-producers/${producerId}/pause`,
      resumeMediaProducer: (routerId: string, producerId: string) => `/routers/${routerId}/media-producers/${producerId}/resume`,
      
      createMediaConsumer: (routerId: string) => `/routers/${routerId}/media-consumers`,
      getMediaConsumer: (routerId: string, consumerId: string) => `/routers/${routerId}/media-consumers/${consumerId}`,
      getMediaConsumerIds: (routerId: string) => `/routers/${routerId}/media-consumers`,
      deleteMediaConsumer: (routerId: string, consumerId: string) => `/routers/${routerId}/media-consumers/${consumerId}`,
      pauseMediaConsumer: (routerId: string, consumerId: string) => `/routers/${routerId}/media-consumers/${consumerId}/pause`,
      resumeMediaConsumer: (routerId: string, consumerId: string) => `/routers/${routerId}/media-consumers/${consumerId}/resume`,
    };
  }

  // HTTP request helper
  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<T> {
    const url = `${this.serverUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (response.status === 204) return {} as T;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}. method: ${method}, url: ${url}`);
      }

      return await response.json();
    } catch (error) {
      if (this.enableDebugLogs) {
        console.error(`Tomasz Chess Request failed [${method} ${url}]:`, error);
      }
      throw error;
    }
  }

  // Router Management API
  async createRouter(routerConfig?: RouterConfig): Promise<RouterSnapshot> {
    const response = await this.makeRequest<RouterSnapshot>(
      this.apiEndpoints.createRouter,
      'POST',
      routerConfig || {}
    );

    if (this.enableDebugLogs) {
      console.log('TomaszChessService: Router created:', response.id);
    }

    return response;
  }

  async getRouter(routerId: string): Promise<RouterSnapshot> {
    const response = await this.makeRequest<RouterSnapshot>(
      this.apiEndpoints.getRouter(routerId)
    );

    if (this.enableDebugLogs) {
      console.log('TomaszChessService: Router retrieved:', response.id);
    }

    return response;
  }

  async deleteRouter(routerId: string): Promise<void> {
    await this.makeRequest(
      this.apiEndpoints.deleteRouter(routerId),
      'DELETE'
    );

    if (this.enableDebugLogs) {
      console.log('TomaszChessService: Router deleted:', routerId);
    }
  }

  // WebRTC Transport Management API
  async createWebRTCTransport(routerId: string, transportConfig?: WebRtcTransportConfig): Promise<WebRtcTransportSnapshot> {
    const response = await this.makeRequest<WebRtcTransportSnapshot>(
      this.apiEndpoints.createWebRTCTransport(routerId),
      'POST',
      transportConfig || {}
    );

    if (this.enableDebugLogs) {
      console.log('TomaszChessService: WebRTC Transport created:', response.id);
    }

    return response;
  }

  async getWebRTCTransport(routerId: string, transportId: string): Promise<WebRtcTransportSnapshot> {
    const response = await this.makeRequest<WebRtcTransportSnapshot>(
      this.apiEndpoints.getWebRTCTransport(routerId, transportId)
    );

    if (this.enableDebugLogs) {
      console.log('TomaszChessService: WebRTC Transport retrieved:', response.id);
    }

    return response;
  }

  async connectWebRTCTransport(routerId: string, transportId: string, connectParams: ConnectWebRtcTransportParams): Promise<void> {
    await this.makeRequest(
      this.apiEndpoints.connectWebRTCTransport(routerId, transportId),
      'POST',
      connectParams
    );

    if (this.enableDebugLogs) {
      console.log('TomaszChessService: WebRTC Transport connected:', transportId);
    }
  }

  async deleteWebRTCTransport(routerId: string, transportId: string): Promise<void> {
    await this.makeRequest(
      this.apiEndpoints.deleteWebRTCTransport(routerId, transportId),
      'DELETE'
    );

    if (this.enableDebugLogs) {
      console.log('TomaszChessService: WebRTC Transport deleted:', transportId);
    }
  }

  // Media Producer Management API
  async createMediaProducer(routerId: string, producerConfig: MediaProducerConfig): Promise<MediaProducerSnapshot> {
    const response = await this.makeRequest<MediaProducerSnapshot>(
      this.apiEndpoints.createMediaProducer(routerId),
      'POST',
      producerConfig
    );

    if (this.enableDebugLogs) {
      console.log('TomaszChessService: Media Producer created:', response.id);
    }

    return response;
  }

  async getMediaProducer(routerId: string, producerId: string): Promise<MediaProducerSnapshot> {
    const response = await this.makeRequest<MediaProducerSnapshot>(
      this.apiEndpoints.getMediaProducer(routerId, producerId)
    );

    if (this.enableDebugLogs) {
      console.log('TomaszChessService: Media Producer retrieved:', response.id);
    }

    return response;
  }

  async getMediaProducerIds(routerId: string): Promise<string[]> {
    const response = await this.makeRequest<{ mediaProducerIds: string[] }>(
      this.apiEndpoints.getMediaProducerIds(routerId)
    );

    if (this.enableDebugLogs) {
      console.log('TomaszChessService: Media Producer IDs retrieved:', response);
    }

    return response.mediaProducerIds;
  }

  async deleteMediaProducer(routerId: string, producerId: string): Promise<void> {
    await this.makeRequest(
      this.apiEndpoints.deleteMediaProducer(routerId, producerId),
      'DELETE'
    );

    if (this.enableDebugLogs) {
      console.log('TomaszChessService: Media Producer deleted:', producerId);
    }
  }

  async pauseMediaProducer(routerId: string, producerId: string): Promise<void> {
    await this.makeRequest(
      this.apiEndpoints.pauseMediaProducer(routerId, producerId),
      'POST'
    );

    if (this.enableDebugLogs) {
      console.log('TomaszChessService: Media Producer paused:', producerId);
    }
  }

  async resumeMediaProducer(routerId: string, producerId: string): Promise<void> {
    await this.makeRequest(
      this.apiEndpoints.resumeMediaProducer(routerId, producerId),
      'POST'
    );

    if (this.enableDebugLogs) {
      console.log('TomaszChessService: Media Producer resumed:', producerId);
    }
  }

  // Media Consumer Management API
  async createMediaConsumer(routerId: string, consumerConfig: MediaConsumerConfig): Promise<MediaConsumerSnapshot> {
    const response = await this.makeRequest<MediaConsumerSnapshot>(
      this.apiEndpoints.createMediaConsumer(routerId),
      'POST',
      consumerConfig
    );

    if (this.enableDebugLogs) {
      console.log('TomaszChessService: Media Consumer created:', response.id);
    }

    return response;
  }

  async getMediaConsumer(routerId: string, consumerId: string): Promise<MediaConsumerSnapshot> {
    const response = await this.makeRequest<MediaConsumerSnapshot>(
      this.apiEndpoints.getMediaConsumer(routerId, consumerId)
    );

    if (this.enableDebugLogs) {
      console.log('TomaszChessService: Media Consumer retrieved:', response.id);
    }

    return response;
  }

  async getMediaConsumerIds(routerId: string): Promise<string[]> {
    const response = await this.makeRequest<{ mediaConsumerIds: string[] }>(
      this.apiEndpoints.getMediaConsumerIds(routerId)
    );  
    if (this.enableDebugLogs) {
      console.log('TomaszChessService: Media Consumer IDs retrieved:', response);
    }
    return response.mediaConsumerIds;
  }

  async deleteMediaConsumer(routerId: string, consumerId: string): Promise<void> {
    await this.makeRequest(
      this.apiEndpoints.deleteMediaConsumer(routerId, consumerId),
      'DELETE'
    );

    if (this.enableDebugLogs) {
      console.log('TomaszChessService: Media Consumer deleted:', consumerId);
    }
  }

  async pauseMediaConsumer(routerId: string, consumerId: string): Promise<void> {
    await this.makeRequest(
      this.apiEndpoints.pauseMediaConsumer(routerId, consumerId),
      'POST'
    );

    if (this.enableDebugLogs) {
      console.log('TomaszChessService: Media Consumer paused:', consumerId);
    }
  }

  async resumeMediaConsumer(routerId: string, consumerId: string): Promise<void> {
    await this.makeRequest(
      this.apiEndpoints.resumeMediaConsumer(routerId, consumerId),
      'POST'
    );

    if (this.enableDebugLogs) {
      console.log('TomaszChessService: Media Consumer resumed:', consumerId);
    }
  }

  // Utility methods
  setServerUrl(serverUrl: string): void {
    this.serverUrl = serverUrl;
  }

  getServerUrl(): string {
    return this.serverUrl;
  }

  setDebugLogs(enabled: boolean): void {
    this.enableDebugLogs = enabled;
  }
}

// Export singleton instance
export const tomaszChessService = new CloudSfuService();
