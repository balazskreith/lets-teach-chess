import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatNumber(num: number, decimals: number = 0): string {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(decimals) + "B";
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(decimals) + "M";
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(decimals) + "K";
  }
  return num.toFixed(decimals);
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function formatPercentage(value: number, total: number): string {
  if (total === 0) return "0%";
  return ((value / total) * 100).toFixed(1) + "%";
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "online":
    case "healthy":
    case "success":
      return "text-green-500";
    case "warning":
    case "degraded":
      return "text-yellow-500";
    case "error":
    case "down":
    case "critical":
      return "text-red-500";
    case "info":
    case "unknown":
    default:
      return "text-blue-500";
  }
}

export function generateMockData(count: number, min: number = 0, max: number = 100) {
  return Array.from({ length: count }, (_, i) => ({
    timestamp: new Date(Date.now() - (count - i - 1) * 60000).toISOString(),
    value: Math.floor(Math.random() * (max - min + 1)) + min,
  }));
} 