/**
 * External API Resilience Module for E-Commerce
 * Protects against cascading failures from Payment Gateways, Shipping Logistics APIs,
 * and SMS/Notification Webhooks under heavy load.
 * 
 * Features:
 * 1. Strict Timeout with AbortController (prevents worker pool exhaustion)
 * 2. Circuit Breaker (Closed -> Open -> Half-Open)
 * 3. Exponential Backoff with Jitter for transient network faults
 */

export interface CircuitBreakerOptions {
  failureThreshold: number;   // Number of failures before opening circuit (default: 5)
  cooldownPeriodMs: number;   // Time to stay open before probing half-open (default: 30,000ms)
  timeoutMs: number;          // Timeout per request (default: 6,000ms)
  maxRetries: number;         // Max retries for transient errors (default: 2)
}

enum CircuitState {
  CLOSED = 'CLOSED',       // Normal operation
  OPEN = 'OPEN',           // Fast-fail: calls rejected immediately
  HALF_OPEN = 'HALF_OPEN', // Probing: single test request allowed
}

class CircuitBreaker {
  private state = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime = 0;
  private successProbeCount = 0;

  constructor(private name: string, private options: CircuitBreakerOptions) {}

  public async execute<T>(fn: (signal: AbortSignal) => Promise<T>): Promise<T> {
    const now = Date.now();

    // Check if cooldown elapsed to transition from OPEN to HALF_OPEN
    if (this.state === CircuitState.OPEN) {
      if (now - this.lastFailureTime > this.options.cooldownPeriodMs) {
        this.state = CircuitState.HALF_OPEN;
        this.successProbeCount = 0;
      } else {
        throw new Error(
          `CircuitBreaker [${this.name}] is OPEN. Downstream service unavailable. Failing fast.`
        );
      }
    }

    let lastError: any;
    for (let attempt = 0; attempt <= this.options.maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.options.timeoutMs);

      try {
        const result = await fn(controller.signal);
        clearTimeout(timeoutId);
        this.onSuccess();
        return result;
      } catch (err: any) {
        clearTimeout(timeoutId);
        lastError = err;

        // If circuit is half-open, fail immediately back to OPEN
        if (this.state === CircuitState.HALF_OPEN) {
          this.state = CircuitState.OPEN;
          this.lastFailureTime = Date.now();
          throw new Error(
            `CircuitBreaker [${this.name}] probe failed: ${err.message}. Reopening circuit.`
          );
        }

        // Apply exponential backoff with jitter before retry if attempts remain
        if (attempt < this.options.maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 200, 3000);
          await new Promise((res) => setTimeout(res, delay));
        }
      }
    }

    this.onFailure();
    throw lastError;
  }

  private onSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successProbeCount++;
      if (this.successProbeCount >= 2) {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
      }
    } else {
      this.failureCount = 0;
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.options.failureThreshold) {
      this.state = CircuitState.OPEN;
      console.warn(`[CIRCUIT_BREAKER] ${this.name} tripped to OPEN after ${this.failureCount} consecutive failures.`);
    }
  }

  public getStatus() {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime ? new Date(this.lastFailureTime).toISOString() : null,
    };
  }
}

// Registry of circuit breakers for external services
const registry = new Map<string, CircuitBreaker>();

export function getCircuitBreaker(
  serviceName: string,
  options: Partial<CircuitBreakerOptions> = {}
): CircuitBreaker {
  let cb = registry.get(serviceName);
  if (!cb) {
    cb = new CircuitBreaker(serviceName, {
      failureThreshold: options.failureThreshold ?? 5,
      cooldownPeriodMs: options.cooldownPeriodMs ?? 30000,
      timeoutMs: options.timeoutMs ?? 6000,
      maxRetries: options.maxRetries ?? 2,
    });
    registry.set(serviceName, cb);
  }
  return cb;
}

export function getAllCircuitStatus() {
  const result: Record<string, any> = {};
  registry.forEach((cb, key) => {
    result[key] = cb.getStatus();
  });
  return result;
}
