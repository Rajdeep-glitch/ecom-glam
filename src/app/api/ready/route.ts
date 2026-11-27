import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Readiness Probe: /api/ready
 * Used by Load Balancers to verify the node has active database connectivity
 * and is capable of accepting incoming customer transactions.
 * If database is down or connection pool exhausted, returns 503 so traffic
 * is immediately diverted to healthy nodes without user-facing failures.
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now();
  try {
    // 1. Verify Prisma connection by running lightweight ping query
    await prisma.$queryRaw`SELECT 1`;
    const dbPingLatencyMs = Date.now() - startTime;

    return NextResponse.json(
      {
        ready: true,
        status: 'READY_FOR_TRAFFIC',
        dbPingLatencyMs,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('[READINESS_PROBE_FAILED]', error);
    return NextResponse.json(
      {
        ready: false,
        status: 'DATABASE_UNREACHABLE',
        error: error.message || 'Database connection pool failure',
        timestamp: new Date().toISOString(),
      },
      {
        status: 503, // Service Unavailable: signal to load balancer to remove node from rotation
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}
