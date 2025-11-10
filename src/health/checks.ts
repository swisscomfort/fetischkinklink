// Health Check and Monitoring Endpoints

import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    database: ServiceStatus;
    memory: ServiceStatus;
  };
}

interface ServiceStatus {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  details?: any;
}

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================

export async function healthCheck(req: Request, res: Response) {
  const startTime = Date.now();
  
  const health: HealthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: await checkDatabase(),
      memory: checkMemory(),
    },
  };

  // Determine overall status
  const serviceStatuses = Object.values(health.services).map(s => s.status);
  if (serviceStatuses.includes('down')) {
    health.status = 'unhealthy';
  } else if (serviceStatuses.includes('degraded')) {
    health.status = 'degraded';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
}

// ============================================================================
// READINESS PROBE
// ============================================================================

export async function readinessProbe(req: Request, res: Response) {
  try {
    // Check if critical services are ready
    const dbStatus = await checkDatabase();
    
    if (dbStatus.status === 'up') {
      res.status(200).json({ ready: true });
    } else {
      res.status(503).json({ ready: false, reason: 'Database not ready' });
    }
  } catch (error) {
    res.status(503).json({ ready: false, error: (error as Error).message });
  }
}

// ============================================================================
// LIVENESS PROBE
// ============================================================================

export function livenessProbe(req: Request, res: Response) {
  // Simple check if process is alive
  res.status(200).json({ alive: true });
}

// ============================================================================
// METRICS ENDPOINT (Prometheus-compatible)
// ============================================================================

export function metricsEndpoint(req: Request, res: Response) {
  const memUsage = process.memoryUsage();
  
  const metrics = `
# HELP nodejs_memory_heap_used_bytes Memory heap used in bytes
# TYPE nodejs_memory_heap_used_bytes gauge
nodejs_memory_heap_used_bytes ${memUsage.heapUsed}

# HELP nodejs_memory_heap_total_bytes Total memory heap in bytes
# TYPE nodejs_memory_heap_total_bytes gauge
nodejs_memory_heap_total_bytes ${memUsage.heapTotal}

# HELP nodejs_memory_rss_bytes Resident set size in bytes
# TYPE nodejs_memory_rss_bytes gauge
nodejs_memory_rss_bytes ${memUsage.rss}

# HELP nodejs_uptime_seconds Process uptime in seconds
# TYPE nodejs_uptime_seconds gauge
nodejs_uptime_seconds ${process.uptime()}

# HELP nodejs_version_info Node.js version
# TYPE nodejs_version_info gauge
nodejs_version_info{version="${process.version}"} 1
`.trim();

  res.set('Content-Type', 'text/plain');
  res.send(metrics);
}

// ============================================================================
// SERVICE CHECK FUNCTIONS
// ============================================================================

async function checkDatabase(): Promise<ServiceStatus> {
  const startTime = Date.now();
  
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return {
        status: 'down',
        details: 'Supabase credentials not configured',
      };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Simple query to check connection
    const { error } = await supabase.from('characters').select('count').limit(1);
    
    const responseTime = Date.now() - startTime;

    if (error) {
      return {
        status: 'down',
        responseTime,
        details: error.message,
      };
    }

    // Warn if response time is too high
    const status = responseTime > 1000 ? 'degraded' : 'up';

    return {
      status,
      responseTime,
    };
  } catch (error) {
    return {
      status: 'down',
      responseTime: Date.now() - startTime,
      details: (error as Error).message,
    };
  }
}

function checkMemory(): ServiceStatus {
  const memUsage = process.memoryUsage();
  const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
  const heapTotalMB = memUsage.heapTotal / 1024 / 1024;
  const usagePercent = (heapUsedMB / heapTotalMB) * 100;

  let status: 'up' | 'degraded' | 'down' = 'up';
  if (usagePercent > 90) {
    status = 'down';
  } else if (usagePercent > 80) {
    status = 'degraded';
  }

  return {
    status,
    details: {
      heapUsedMB: Math.round(heapUsedMB),
      heapTotalMB: Math.round(heapTotalMB),
      usagePercent: Math.round(usagePercent),
    },
  };
}
