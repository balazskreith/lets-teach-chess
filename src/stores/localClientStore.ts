import { useSyncExternalStore } from "react";

/**
 * Minimal local client store: keeps only routerId locally.
 * Router/transports/producers/consumers snapshots are sourced directly
 * from mediasoupWebRtcService by components that need them.
 */

type LocalClientState = {
  routerId?: string | undefined;
};

let state: LocalClientState = {
  routerId: undefined,
};

const listeners = new Set<() => void>();

export const getLocalClientState = () => state;
export const subscribeLocalClient = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const getServerLocalClientState = () => state;

const setState = (patch: Partial<LocalClientState>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

export const setRouterId = (routerId?: string | undefined) => setState({ routerId });

export function useLocalClientStore() {
  const snapshot = useSyncExternalStore(subscribeLocalClient, getLocalClientState, getServerLocalClientState);

  return {
    routerId: snapshot.routerId,
    setRouterId,
  };
}