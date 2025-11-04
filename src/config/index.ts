// Global configuration for the Tomasz Chess application
'use client';
import { env } from 'next-runtime-env';

export const config = {
  controllerUrl: env('NEXT_PUBLIC_CONTROLLER_URL') ?? 'http://192.168.50.156:8080',

  // Dashboard configuration
  defaultRefetchInterval: 30000, // 30 seconds
  
  // Debug configuration
  enableDebugLogs: process.env.NODE_ENV === 'development',
} as const;

export default config;