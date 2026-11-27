import { NextRequest, NextResponse } from 'next/server';
import { getSystemHealthMetrics } from '@/lib/metrics';
import { getAllCircuitStatus } from '@/lib/externalApi';
import { cacheManager } from '@/lib/cache';

export const dynamic = 'force-dynamic';

/**
 * Liveness Probe: /api/health
 * Used by Load Balancers (AWS ALB, Nginx, Kubernetes livenessProbe)
 * to verify the Node.js process is responsive and not locked in an event-loop freeze.
 */
export async function GET(req: NextRequest) {
  const metrics = getSystemHealthMetrics();
  const circuits = getAllCircuitStatus();
  const cacheStats = cacheManager.getStats();

  return NextResponse.json(
    {
      status: 'HEALTHY',
      timestamp: new Date().toISOString(),
      service: 'royal-honey-d2c',
      version: '1.2.0-prod',
      telemetry: metrics,
      circuitBreakers: circuits,
      cache: cacheStats,
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
