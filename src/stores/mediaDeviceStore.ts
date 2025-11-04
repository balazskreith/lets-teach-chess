import { useSyncExternalStore } from "react";

type MediaState = {
  selectedAudioId?: string;
  selectedVideoId?: string;
};

let state: MediaState = {};

const listeners = new Set<() => void>();

export const getState = (): MediaState => state;

export const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const setState = (patch: Partial<MediaState>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

export const setSelectedAudioId = (id?: string) => setState({ selectedAudioId: id });
export const setSelectedVideoId = (id?: string) => setState({ selectedVideoId: id });

export function useMediaDeviceStore() {
  const snapshot = useSyncExternalStore(subscribe, getState);
  return {
    selectedAudioId: snapshot.selectedAudioId,
    selectedVideoId: snapshot.selectedVideoId,
    setSelectedAudioId,
    setSelectedVideoId,
    getState,
  };
}