export const TOMASZ_CHESS_API_SCHEMA_VERSION = '1.0.0';
export type SnapshotMetaData = {
    createdAt: number,
    sfuId?: string,
    routerId?: string,
    transportId?: string,
    workerPid?: number,
    version: number,
}

export type SfuHeartbeat = {
    ip: string,
    port: number,
    sfuId: string,
    region: string,
    version: string, // version of the SFU
    foo?: string,
    draining?: boolean, // if true, the SFU is draining it should not accept new connections
    numberOfRouters: number,
    cpuUsages: number[], // CPU usage in percentage
    memoryUsage?: number, // Memory usage in bytes
}

export type RouterConfig = {
    preferredRegion?: string,
    mediaCodecs?: RtpCodecCapability[];

    // routers will connect to these routers also will allocate on different workers
    peerRouterIds?: string[], 
    // all features the controller can offer
    // preferredRegions?: string[],
}

export type ConnectRouterParams = {
    remoteRouterId: string,
}

export type RouterSnapshot = {
    meta: SnapshotMetaData,
    
    id: string,
    connections: {
        remoteRouterId: string,
        pipeTransportId: string,
    }[],
    rtpCapabilities: RtpCapabilities,
    region: string,
    closed: boolean,
}

export type WebRtcTransportConfig = {
    preferredRegion?: string,

    // the transport protocols enabled for the webrtc transport in a preferred order
    allowedProtocols: TransportProtocol[],
    // if this set and the iceServer is empty or unset the controller 
    // will select a TURN server for the transport closest to the preferred region
    // if this not set and the iceServer is empty or unset the controller will select a TURN server
    // based on client IP address
    preferredRegions?: string[], 
    // mediaCodecs?: RtpCodecCapability[],
    // enableSctp?: boolean,
    // enableUdp?: boolean,
    // enableTcp?: boolean,
    // preferUdp?: boolean,
    // preferTcp?: boolean,
    iceServers?: IceServerConfig[],
    iceConsentTimeout?: number;
    initialAvailableOutgoingBitrate?: number;
    // if this set SCTP protocol is enabled
    numSctpStreams?: NumSctpStreams;
    maxSctpMessageSize?: number;
    sctpSendBufferSize?: number;
}

export type WebRtcTransportSnapshot = {
    meta: SnapshotMetaData,

    id: string,
    iceServers: IceServerConfig[],
    rtpCapabilities: RtpCapabilities,
    // protocol: TransportProtocol,
    dtlsParameters: DtlsParameters,
    iceParameters: IceParameters,
    iceCandidates: IceCandidate[],
    dtlsRemoteCert?: string,
    iceState: IceState,
    iceSelectedTuple?: unknown,
    dtlsState: DtlsState,
    closed: boolean,
    iceRole: IceRole,
    sctpParameters?: SctpParameters,
    sctpState?: string,
}

export type ConnectWebRtcTransportParams = {
    dtlsParameters: DtlsParameters, // DtlsParameters;
};

export type RestartWebRtcTransportIceParams = {
    // empty
}

export type PipeTransportConfig = {
    enableSctp?: boolean,
    enableSrtp?: boolean,
    enableRtx?: boolean,
    numSctpStreams?: NumSctpStreams,
    maxSctpMessageSize?: number,
    sctpSendBufferSize?: number,

    remoteRouterId: string,
    remoteSfuId: string,
    remoteSfuIp: string,
    remoteSfuPort: number,
}

export type PipeTransportSnapshot = {
    meta: SnapshotMetaData,
    
    id: string,
    listenInfo: TransportListenInfo,
    enableSctp?: boolean,
    enableSrtp?: boolean,
    enableRtx?: boolean,
    numSctpStreams?: NumSctpStreams,
    maxSctpMessageSize?: number,
    sctpSendBufferSize?: number,

    remoteRouterId: string,
    remoteSfuId: string,
    remoteSfuIp: string,
    remoteSfuPort: number,

    closed: boolean,
}

export type ConnectPipeTransportParams = {
    ip: string,
    port: number,
    srtpParameters?: SrtpParameters,
}


export type MediaProducerConfig = {
    id?: string,
    transportId: string,
    kind: MediaKind,
    rtpParameters: RtpParameters,
    paused?: boolean,
    keyFrameRequestDelayInMs?: number,
};


export type MediaProducerSnapshot = {
    meta: SnapshotMetaData,

    id: string,
    transportId: string,
    kind: MediaKind,
    rtpParameters: RtpParameters,
    paused: boolean,
    closed: boolean, 
};

export type PauseMediaProducerParams = {
}

export type ResumeMediaProducerParams = {
}

export type MediaConsumerConfig = {
    mediaProducerId: string,
    transportId: string,
    enableRtx?: boolean,
    ignoreDtx?: boolean,
    mid?: string,
    pipe?: boolean,
    preferredLayers?: ConsumerLayers,
    paused?: boolean,
}

export type PipedMediaConsumerConfig = {
    mediaProducerId: string,
}

export type MediaConsumerSnapshot = {
    meta: SnapshotMetaData,

    id: string,
    mediaProducerId: string,
    transportId: string,
    kind: MediaKind,
    rtpParameters: RtpParameters,
    paused: boolean,
    closed: boolean,
    producerPaused: boolean, // if the producer is paused
};

export type PauseMediaConsumerParams = {

}

export type ResumeMediaConsumerParams = {

}

export type SetMediaConsumerPreferredLayersParams = {
    spatialLayer: number,
    temporalLayer: number,
}

export type SetMediaConsumerPriorityParams = {
    priority: number, // 0-10
}
export type UnsetMediaConsumerPriorityParams = {
    // empty
}

export type RequestMediaConsumerKeyFrameParams = {
    // empty
}

export type DataProducerStreamProcessingParams = {
    type: 'client-samples',
    callId: string,
    clientId: string,
};

export type DataProducerConfig =  {
    transportId: string,
    dataProducerId?: string,
    sctpStreamParameters?: SctpStreamParameters,
    paused?: boolean,
    label?: string,
    protocol?: string,
}

export type DataProducerSnapshot = {
    meta: SnapshotMetaData,

    id: string,
    transportId: string,
    closed: boolean,

    streamProcessing?: DataProducerStreamProcessingParams,
};

export type DataConsumerConfig = {
    transportId: string,
    dataProducerId: string,
    protocol?: string,
    maxPacketLifeTime?: number,
    maxRetransmits?: number,
    ordered?: boolean,
    subchannels?: number[],
    paused?: boolean,
};

export type DataConsumerSnapshot = {
    meta: SnapshotMetaData,
   
    id: string,
    dataProducerId: string,
    transportId: string,
    closed: boolean,
};

export type SnapshotsMap = {
    RouterSnapshot: RouterSnapshot,
    WebRtcTransportSnapshot: WebRtcTransportSnapshot,
    PipeTransportSnapshot: PipeTransportSnapshot,   
    MediaProducerSnapshot: MediaProducerSnapshot,
    MediaConsumerSnapshot: MediaConsumerSnapshot,
    DataProducerSnapshot: DataProducerSnapshot,
    DataConsumerSnapshot: DataConsumerSnapshot,
}

// Helper type to programmatically create a discriminated union from SnapshotsMap
export type SnapshotMessage = {
  [K in keyof SnapshotsMap]: { 
    type: K; 
    payload: SnapshotsMap[K]; 
    timestamp: number 
}
}[keyof SnapshotsMap];

type MediaKind = 'audio' | 'video';
type RtpHeaderExtensionDirection = 'sendrecv' | 'sendonly' | 'recvonly' | 'inactive';
type IceRole = 'controlled' | 'controlling';
type IceState = 'new' | 'connected' | 'completed' | 'disconnected' | 'closed';
type IceCandidateType = 'host';
type IceCandidateTcpType = 'passive';
type DtlsRole = 'auto' | 'client' | 'server';
type DtlsState = 'new' | 'connecting' | 'connected' | 'failed' | 'closed';
type FingerprintAlgorithm = 'sha-1' | 'sha-224' | 'sha-256' | 'sha-384' | 'sha-512';
type TransportProtocol = 'udp' | 'tcp';
type SrtpCryptoSuite = 'AEAD_AES_256_GCM' | 'AEAD_AES_128_GCM' | 'AES_CM_128_HMAC_SHA1_80' | 'AES_CM_128_HMAC_SHA1_32';

export type RtpHeaderExtensionUri = 
  | 'urn:ietf:params:rtp-hdrext:sdes:mid'
  | 'urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id'
  | 'urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id'
  | 'http://tools.ietf.org/html/draft-ietf-avtext-framemarking-07'
  | 'urn:ietf:params:rtp-hdrext:framemarking'
  | 'urn:ietf:params:rtp-hdrext:ssrc-audio-level'
  | 'urn:3gpp:video-orientation'
  | 'urn:ietf:params:rtp-hdrext:toffset'
  | 'http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01'
  | 'http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time'
  | 'http://www.webrtc.org/experiments/rtp-hdrext/abs-capture-time'
  | 'http://www.webrtc.org/experiments/rtp-hdrext/playout-delay'
  | 'https://aomediacodec.github.io/av1-rtp-spec/#dependency-descriptor-rtp-header-extension';

  
type RtpCapabilities = {
  codecs?: RtpCodecCapability[];
  headerExtensions?: RtpHeaderExtension[];
};


type RtpCodecCapability = {
  kind: MediaKind;
  mimeType: string;
  preferredPayloadType?: number;
  clockRate: number;
  channels?: number;
  parameters?: any;
  rtcpFeedback?: RtcpFeedback[];
};

type RtcpFeedback = {
  type: string;
  parameter?: string;
};

type IceServerConfig = {
    credential: string;
    credentialType: 'password',
    urls: string[];
    username: string;
};


type RtpHeaderExtension = {
  kind: MediaKind;
//   uri: RtpHeaderExtensionUri;
  uri: string; // RtpHeaderExtensionUri;
  preferredId: number;
  preferredEncrypt?: boolean;
  direction?: RtpHeaderExtensionDirection;
};


type NumSctpStreams = {
  initOutgoingStreams: number;
  maxIncomingStreams: number;
};

type TransportListenInfo = {
    /**
     * Network protocol.
     */
    protocol: TransportProtocol;
    /**
     * Listening IPv4 or IPv6.
     */
    ip: string;
    /**
     * Announced IPv4, IPv6 or hostname (useful when running mediasoup behind NAT
     * with private IP).
     */
    announcedAddress?: string;
    /**
     * Listening port.
     */
    port?: number;
    /**
     * Send buffer size (bytes).
     */
    sendBufferSize?: number;
    /**
     * Recv buffer size (bytes).
     */
    recvBufferSize?: number;
};

type DtlsParameters = {
    role?: DtlsRole;
    fingerprints: DtlsFingerprint[];
};

/**
 * The hash function algorithm and its corresponding certificate fingerprint
 * value (in lowercase hex string as expressed utilizing the syntax of
 * "fingerprint" in RFC 4572 Section 5).
 */
type DtlsFingerprint = {
    algorithm: FingerprintAlgorithm;
    value: string;
};

/**
 * SRTP parameters.
 */
type SrtpParameters = {
    /**
     * Encryption and authentication transforms to be used.
     */
    cryptoSuite: SrtpCryptoSuite;
    /**
     * SRTP keying material (master key and salt) in Base64.
     */
    keyBase64: string;
};

export type RtpParameters = {
    /**
     * The MID RTP extension value as defined in the BUNDLE specification.
     */
    mid?: string;
    /**
     * Media and RTX codecs in use.
     */
    codecs: RtpCodecParameters[];
    /**
     * RTP header extensions in use.
     */
    headerExtensions?: RtpHeaderExtensionParameters[];
    /**
     * Transmitted RTP streams and their Config.
     */
    encodings?: RtpEncodingParameters[];
    /**
     * Parameters used for RTCP.
     */
    rtcp?: RtcpParameters;
};

type RtpCodecParameters = {
    /**
     * The codec MIME media type/subtype (e.g. 'audio/opus', 'video/VP8').
     */
    mimeType: string;
    /**
     * The value that goes in the RTP Payload Type Field. Must be unique.
     */
    payloadType: number;
    /**
     * Codec clock rate expressed in Hertz.
     */
    clockRate: number;
    /**
     * The number of channels supported (e.g. two for stereo). Just for audio.
     * Default 1.
     */
    channels?: number;
    /**
     * Codec-specific parameters available for signaling. Some parameters (such
     * as 'packetization-mode' and 'profile-level-id' in H264 or 'profile-id' in
     * VP9) are critical for codec matching.
     */
    parameters?: any;
    /**
     * Transport layer and codec-specific feedback messages for this codec.
     */
    rtcpFeedback?: RtcpFeedback[];
};

type RtpHeaderExtensionParameters = {
    /**
     * The URI of the RTP header extension, as defined in RFC 5285.
     */
    // uri: RtpHeaderExtensionUri;
    uri: string;
    /**
     * The numeric identifier that goes in the RTP packet. Must be unique.
     */
    id: number;
    /**
     * If true, the value in the header is encrypted as per RFC 6904. Default false.
     */
    encrypt?: boolean;
    /**
     * Snapshoturation parameters for the header extension.
     */
    parameters?: any;
};

type RtpEncodingParameters = {
    /**
     * The media SSRC.
     */
    ssrc?: number;
    /**
     * The RID RTP extension value. Must be unique.
     */
    rid?: string;
    /**
     * Codec payload type this encoding affects. If unset, first media codec is
     * chosen.
     */
    codecPayloadType?: number;
    /**
     * RTX stream information. It must contain a numeric ssrc field indicating
     * the RTX SSRC.
     */
    rtx?: {
        ssrc: number;
    };
    /**
     * It indicates whether discontinuous RTP transmission will be used. Useful
     * for audio (if the codec supports it) and for video screen sharing (when
     * static content is being transmitted, this option disables the RTP
     * inactivity checks in mediasoup). Default false.
     */
    dtx?: boolean;
    /**
     * Number of spatial and temporal layers in the RTP stream (e.g. 'L1T3').
     * See webrtc-svc.
     */
    scalabilityMode?: string;
    /**
     * Others.
     */
    scaleResolutionDownBy?: number;
    maxBitrate?: number;
};

type RtcpParameters = {
    /**
     * The Canonical Name (CNAME) used by RTCP (e.g. in SDES messages).
     */
    cname?: string;
    /**
     * Whether reduced size RTCP RFC 5506 is Snapshotured (if true) or compound RTCP
     * as specified in RFC 3550 (if false). Default true.
     */
    reducedSize?: boolean;
};

type ConsumerLayers = {
    /**
     * The spatial layer index (from 0 to N).
     */
    spatialLayer: number;
    /**
     * The temporal layer index (from 0 to N).
     */
    temporalLayer?: number;
};

type SctpStreamParameters = {
    /**
     * SCTP stream id.
     */
    streamId: number;
    /**
     * Whether data messages must be received in order. If true the messages will
     * be sent reliably. Default true.
     */
    ordered?: boolean;
    /**
     * When ordered is false indicates the time (in milliseconds) after which a
     * SCTP packet will stop being retransmitted.
     */
    maxPacketLifeTime?: number;
    /**
     * When ordered is false indicates the maximum number of times a packet will
     * be retransmitted.
     */
    maxRetransmits?: number;
};

type IceCandidate = {
    /**
     * Unique identifier that allows ICE to correlate candidates that appear on
     * multiple transports.
     */
    foundation: string;
    /**
     * The assigned priority of the candidate.
     */
    priority: number;
    /**
     * The IP address or hostname of the candidate.
     */
    address: string;
    /**
     * The IP address  or hostname of the candidate.
     * @deprecated Use |address| instead.
     */
    ip: string;
    /**
     * The protocol of the candidate.
     */
    protocol: 'udp' | 'tcp';
    /**
     * The port for the candidate.
     */
    port: number;
    /**
     * The type of candidate.
     */
    type: 'host' | 'srflx' | 'prflx' | 'relay';
    /**
     * The type of TCP candidate.
     */
    tcpType?: 'active' | 'passive' | 'so';
};

type IceParameters = {
    /**
     * ICE username fragment.
     * */
    usernameFragment: string;
    /**
     * ICE password.
     */
    password: string;
    /**
     * ICE Lite.
     */
    iceLite?: boolean;
};

type SctpParameters = {
    /**
     * Must always equal 5000.
     */
    port: number;
    /**
     * Initially requested number of outgoing SCTP streams.
     */
    OS: number;
    /**
     * Maximum number of incoming SCTP streams.
     */
    MIS: number;
    /**
     * Maximum allowed size for SCTP messages.
     */
    maxMessageSize: number;
};