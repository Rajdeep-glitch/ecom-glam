/**
 * Production Metrics & Health Monitoring System
 * Collects runtime telemetry, p95 latency, active connections, and memory usage.
 */

interface RequestMetrics {
  totalRequests: number;
  activeRequests: number;
  statusCodes: Record<string, number>;
  latenciesMs: number[];
  startTime: number;
}

const metrics: RequestMetrics = {
  totalRequests: 0,
  activeRequests: 0,
  statusCodes: {},
  latenciesMs: [],
  startTime: Date.now(),
};

export function recordRequestStart(): (statusCode?: number) => void {
  metrics.totalRequests++;
  metrics.activeRequests++;
  const start = Date.now();

  return (statusCode: number = 200) => {
    metrics.activeRequests = Math.max(0, metrics.activeRequests - 1);
    const duration = Date.now() - start;

    const codeKey = `${Math.floor(statusCode / 100)}xx`;
    metrics.statusCodes[codeKey] = (metrics.statusCodes[codeKey] || 0) + 1;

    // Keep rolling sample of last 200 request latencies for p95 computation
    metrics.latenciesMs.push(duration);
    if (metrics.latenciesMs.length > 200) {
      metrics.latenciesMs.shift();
    }
  };
}

export function getSystemHealthMetrics() {
  const mem = process.memoryUsage();
  const uptimeSeconds = Math.floor((Date.now() - metrics.startTime) / 1000);

  // Compute p95 latency
  let p95LatencyMs = 0;
  if (metrics.latenciesMs.length > 0) {
    const sorted = [...metrics.latenciesMs].sort((a, b) => a - b);
    const p95Index = Math.floor(sorted.length * 0.95);
    p95LatencyMs = sorted[p95Index] || 0;
  }

  return {
    uptimeSeconds,
    totalRequests: metrics.totalRequests,
    activeRequests: metrics.activeRequests,
    statusCodes: metrics.statusCodes,
    p95LatencyMs,
    memory: {
      rssMb: Math.round(mem.rss / 1024 / 1024),
      heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
      heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
    },
    nodeEnv: process.env.NODE_ENV || 'production',
  };
}
