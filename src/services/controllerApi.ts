import appConfig from '@/config';
import { 
  RouterSnapshot, 
  RouterConfig, 
  SfuHeartbeat, 
  WebRtcTransportConfig, 
  WebRtcTransportSnapshot,
  ConnectWebRtcTransportParams,
  MediaProducerConfig,
  MediaProducerSnapshot,
  MediaConsumerConfig,
  MediaConsumerSnapshot,
  SetMediaConsumerPreferredLayersParams,
  SetMediaConsumerPriorityParams,
  DataProducerConfig,
  DataProducerSnapshot,
  DataConsumerConfig,
  DataConsumerSnapshot
} from '@/types/cloudsfu-api';

class ControllerApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = appConfig.controllerUrl;
  }

  private log(message: string, ...args: any[]) {
    if (appConfig.enableDebugLogs) {
      console.log(`[ControllerApi] ${message}`, ...args);
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    this.log(`Requesting: ${url}`, options);

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP ${response.status} ${response.statusText}: ${errorBody || 'No error body'}`);
      }
      
      if (response.status === 204) { // No Content
        return undefined as T;
      }

      const data = await response.json();
      this.log(`Response from ${url}:`, data);
      return data;
    } catch (error) {
      this.log(`Error making request to ${url}:`, error);
      throw error;
    }
  }

  // SFU Endpoints
  async getSfus(): Promise<SfuHeartbeat[]> {
    const response = await this.request<{ sfus: SfuHeartbeat[] }>('/sfus');
    return response.sfus;
  }

  async getSfu(sfuId: string): Promise<SfuHeartbeat | null> {
    const sfus = await this.getSfus();
    return sfus.find(sfu => sfu.sfuId === sfuId) || null;
  }

  async drainSfu(sfuId: string, sfuEndpoint: string): Promise<void> {
    // Make direct request to the SFU endpoint, not the controller
    const url = `http://${sfuEndpoint}/state/drain`;
    this.log(`Draining SFU: ${url}`);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP ${response.status} ${response.statusText}: ${errorBody || 'No error body'}`);
      }
    } catch (error) {
      this.log(`Error draining SFU ${sfuId}:`, error);
      throw error;
    }
  }

  async undrainSfu(sfuId: string, sfuEndpoint: string): Promise<void> {
    // Make direct request to the SFU endpoint, not the controller
    const url = `http://${sfuEndpoint}/state/undrain`;
    this.log(`Undraining SFU: ${url}`);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP ${response.status} ${response.statusText}: ${errorBody || 'No error body'}`);
      }
    } catch (error) {
      this.log(`Error undraining SFU ${sfuId}:`, error);
      throw error;
    }
  }

  async getSfuConfig(sfuEndpoint: string): Promise<any> {
    // Make direct request to the SFU endpoint to get config
    const url = `http://${sfuEndpoint}/config`;
    this.log(`Getting SFU config: ${url}`);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP ${response.status} ${response.statusText}: ${errorBody || 'No error body'}`);
      }

      return await response.json();
    } catch (error) {
      this.log(`Error getting SFU config:`, error);
      throw error;
    }
  }

  async getSfuMetrics(sfuEndpoint: string): Promise<string> {
    // Make direct request to the SFU endpoint to get metrics
    const url = `http://${sfuEndpoint}/metrics`;
    this.log(`Getting SFU metrics: ${url}`);

    try {
      const response = await fetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP ${response.status} ${response.statusText}: ${errorBody || 'No error body'}`);
      }

      return await response.text();
    } catch (error) {
      this.log(`Error getting SFU metrics:`, error);
      throw error;
    }
  }

  // Router Endpoints
  async getRouterIds(): Promise<string[]> {
    const response = await this.request<{ routerIds: string[] }>('/routers');
    return response.routerIds;
  }

  async createRouter(config: RouterConfig): Promise<RouterSnapshot> {
    return this.request<RouterSnapshot>('/routers', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async getRouterSnapshot(routerId: string): Promise<RouterSnapshot> {
    return this.request<RouterSnapshot>(`/routers/${routerId}`);
  }

  async deleteRouter(routerId: string): Promise<void> {
    await this.request<void>(`/routers/${routerId}`, { method: 'DELETE' });
  }

  async connectRouters(routerId: string, remoteRouterId: string): Promise<void> {
    await this.request<void>(`/routers/${routerId}/connections`, {
      method: 'POST',
      body: JSON.stringify({ remoteRouterId }),
    });
  }

  async disconnectRouters(routerId: string, remoteRouterId: string): Promise<void> {
    await this.request<void>(`/routers/${routerId}/connections`, {
      method: 'DELETE',
      body: JSON.stringify({ remoteRouterId }),
    });
  }
  
  async getRouterStats(routerId: string): Promise<any> {
    return this.request(`/routers/${routerId}/stats`);
  }

  // WebRTC Transport Endpoints
  async getWebRtcTransportIds(routerId: string): Promise<string[]> {
    const response = await this.request<{ webrtcTransportIds: string[] }>(`/routers/${routerId}/webrtc-transports`);
    return response.webrtcTransportIds;
  }
  
  async createWebRtcTransport(routerId: string, config: WebRtcTransportConfig): Promise<WebRtcTransportSnapshot> {
    return this.request<WebRtcTransportSnapshot>(`/routers/${routerId}/webrtc-transports`, {
        method: 'POST',
        body: JSON.stringify(config),
    });
  }

  async getWebRtcTransportSnapshot(routerId: string, transportId: string): Promise<WebRtcTransportSnapshot> {
    return this.request<WebRtcTransportSnapshot>(`/routers/${routerId}/webrtc-transports/${transportId}`);
  }

  async deleteWebRtcTransport(routerId: string, transportId: string): Promise<void> {
    await this.request<void>(`/routers/${routerId}/webrtc-transports/${transportId}`, { method: 'DELETE' });
  }

  async connectWebRtcTransport(routerId: string, transportId: string, params: ConnectWebRtcTransportParams): Promise<void> {
    await this.request<void>(`/routers/${routerId}/webrtc-transports/${transportId}/connect`, {
        method: 'POST',
        body: JSON.stringify(params),
    });
  }

  // Media Producer Endpoints
  async getMediaProducerIds(routerId: string): Promise<string[]> {
    const response = await this.request<{ mediaProducerIds: string[] }>(`/routers/${routerId}/media-producers`);
    return response.mediaProducerIds;
  }

  async createMediaProducer(routerId: string, config: MediaProducerConfig): Promise<MediaProducerSnapshot> {
    return this.request<MediaProducerSnapshot>(`/routers/${routerId}/media-producers`, {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async getMediaProducerSnapshot(routerId: string, producerId: string): Promise<MediaProducerSnapshot> {
    return this.request<MediaProducerSnapshot>(`/routers/${routerId}/media-producers/${producerId}`);
  }

  async deleteMediaProducer(routerId: string, producerId: string): Promise<void> {
    await this.request<void>(`/routers/${routerId}/media-producers/${producerId}`, { method: 'DELETE' });
  }

  async pauseMediaProducer(routerId: string, producerId: string): Promise<void> {
    await this.request<void>(`/routers/${routerId}/media-producers/${producerId}/pause`, { method: 'POST' });
  }

  async resumeMediaProducer(routerId: string, producerId: string): Promise<void> {
    await this.request<void>(`/routers/${routerId}/media-producers/${producerId}/resume`, { method: 'POST' });
  }

  // Media Consumer Endpoints
  async getMediaConsumerIds(routerId: string): Promise<string[]> {
    const response = await this.request<{ mediaConsumerIds: string[] }>(`/routers/${routerId}/media-consumers`);
    // console.warn('getMediaConsumerIds', response);  
    return response.mediaConsumerIds;
  }
  
  async createMediaConsumer(routerId: string, config: MediaConsumerConfig): Promise<MediaConsumerSnapshot> {
    return this.request<MediaConsumerSnapshot>(`/routers/${routerId}/media-consumers`, {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async getMediaConsumerSnapshot(routerId: string, consumerId: string): Promise<MediaConsumerSnapshot> {
    return this.request<MediaConsumerSnapshot>(`/routers/${routerId}/media-consumers/${consumerId}`);
  }

  async deleteMediaConsumer(routerId: string, consumerId: string): Promise<void> {
    await this.request<void>(`/routers/${routerId}/media-consumers/${consumerId}`, { method: 'DELETE' });
  }

  async pauseMediaConsumer(routerId: string, consumerId: string): Promise<void> {
    await this.request<void>(`/routers/${routerId}/media-consumers/${consumerId}/pause`, { method: 'POST' });
  }

  async resumeMediaConsumer(routerId: string, consumerId: string): Promise<void> {
    await this.request<void>(`/routers/${routerId}/media-consumers/${consumerId}/resume`, { method: 'POST' });
  }

  async setMediaConsumerPreferredLayers(routerId: string, consumerId: string, params: SetMediaConsumerPreferredLayersParams): Promise<void> {
    await this.request<void>(`/routers/${routerId}/media-consumers/${consumerId}/set-preferred-layers`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async setMediaConsumerPriority(routerId: string, consumerId: string, params: SetMediaConsumerPriorityParams): Promise<void> {
    await this.request<void>(`/routers/${routerId}/media-consumers/${consumerId}/set-priority`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }
  
  async unsetMediaConsumerPriority(routerId: string, consumerId: string): Promise<void> {
    await this.request<void>(`/routers/${routerId}/media-consumers/${consumerId}/unset-priority`, { method: 'POST' });
  }
  
  async requestMediaConsumerKeyFrame(routerId: string, consumerId: string): Promise<void> {
    await this.request<void>(`/routers/${routerId}/media-consumers/${consumerId}/request-key-frame`, { method: 'POST' });
  }

  // Data Producer Endpoints
  async getDataProducerIds(routerId: string): Promise<string[]> {
    const response = await this.request<{ dataProducerIds: string[] }>(`/routers/${routerId}/data-producers`);
    return response.dataProducerIds;
  }

  async createDataProducer(routerId: string, config: DataProducerConfig): Promise<DataProducerSnapshot> {
    return this.request<DataProducerSnapshot>(`/routers/${routerId}/data-producers`, {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async getDataProducerSnapshot(routerId: string, producerId: string): Promise<DataProducerSnapshot> {
    return this.request<DataProducerSnapshot>(`/routers/${routerId}/data-producers/${producerId}`);
  }

  async deleteDataProducer(routerId: string, producerId: string): Promise<void> {
    await this.request<void>(`/routers/${routerId}/data-producers/${producerId}`, { method: 'DELETE' });
  }

  // Data Consumer Endpoints
  async getDataConsumerIds(routerId: string): Promise<string[]> {
    const response = await this.request<{ dataConsumerIds: string[] }>(`/routers/${routerId}/data-consumers`);
    return response.dataConsumerIds;
  }

  async createDataConsumer(routerId: string, config: DataConsumerConfig): Promise<DataConsumerSnapshot> {
    return this.request<DataConsumerSnapshot>(`/routers/${routerId}/data-consumers`, {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async getDataConsumerSnapshot(routerId: string, consumerId: string): Promise<DataConsumerSnapshot> {
    return this.request<DataConsumerSnapshot>(`/routers/${routerId}/data-consumers/${consumerId}`);
  }

  async deleteDataConsumer(routerId: string, consumerId: string): Promise<void> {
    await this.request<void>(`/routers/${routerId}/data-consumers/${consumerId}`, { method: 'DELETE' });
  }
}

export const controllerApi = new ControllerApiService();
export default controllerApi; 