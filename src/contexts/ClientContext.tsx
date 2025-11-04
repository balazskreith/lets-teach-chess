"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type LocalStreams = {
  audio?: MediaStream | null;
  video?: MediaStream | null;
};

type ClientContextValue = {
  streams: LocalStreams;
  setStreams: (s: LocalStreams) => void;
  stopAll: () => void;
};

const ClientContext = createContext<ClientContextValue | null>(null);

export function ClientProvider({
  children,
  initialStreams,
}: {
  children: React.ReactNode;
  initialStreams?: LocalStreams | null;
}) {
  const [streams, setStreamsState] = useState<LocalStreams>({
    audio: initialStreams?.audio ?? null,
    video: initialStreams?.video ?? null,
  });

  useEffect(() => {
    if (!initialStreams) return;
    setStreamsState((cur) => {
      if (cur.audio === initialStreams.audio && cur.video === initialStreams.video) return cur;
      return { audio: initialStreams.audio ?? null, video: initialStreams.video ?? null };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialStreams?.audio, initialStreams?.video]);

  useEffect(() => {
    return () => {
      if (streams.audio) streams.audio.getTracks().forEach((t) => t.stop());
      if (streams.video) streams.video.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setStreams = (s: LocalStreams) => {
    if (streams.audio && s.audio !== streams.audio) streams.audio.getTracks().forEach((t) => t.stop());
    if (streams.video && s.video !== streams.video) streams.video.getTracks().forEach((t) => t.stop());
    setStreamsState({ audio: s.audio ?? null, video: s.video ?? null });
  };

  const stopAll = () => {
    if (streams.audio) streams.audio.getTracks().forEach((t) => t.stop());
    if (streams.video) streams.video.getTracks().forEach((t) => t.stop());
    setStreamsState({ audio: null, video: null });
  };

  const value = useMemo(
    () => ({
      streams,
      setStreams,
      stopAll,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [streams]
  );

  return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>;
}

export function useClientContext() {
  const ctx = useContext(ClientContext);
  if (!ctx) {
    throw new Error("useClientContext must be used within ClientProvider");
  }
  return ctx;
}