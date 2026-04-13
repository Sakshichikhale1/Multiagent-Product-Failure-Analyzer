import { useState, useRef, useCallback, useEffect } from 'react';
import {
  FailureScenario,
  LogEntry,
  Metrics,
  AnalysisResult,
  generateMetrics,
  generateLogs,
  shouldTriggerAnalysis,
  buildAnalysisPrompt,
  parseAnalysisResponse,
} from '@/lib/simulator';
import { supabase } from '@/integrations/supabase/client';

const MAX_LOGS = 200;
const MAX_METRICS_HISTORY = 60;
const TICK_MS = 2000;

export function useSimulator() {
  const [activeScenario, setActiveScenario] = useState<FailureScenario>('none');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [metricsHistory, setMetricsHistory] = useState<Metrics[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<Metrics | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRunning, setIsRunning] = useState(true);

  const scenarioStartRef = useRef<number>(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analysisTriggeredRef = useRef(false);
  const logsRef = useRef<LogEntry[]>([]);

  const injectScenario = useCallback((scenario: FailureScenario) => {
    setActiveScenario(scenario);
    scenarioStartRef.current = Date.now();
    analysisTriggeredRef.current = false;
    setAnalysis(null);
  }, []);

  const resolveScenario = useCallback(() => {
    setActiveScenario('none');
    analysisTriggeredRef.current = false;
    setAnalysis(null);
  }, []);

  const triggerAnalysis = useCallback(async (metrics: Metrics, recentLogs: LogEntry[], scenario: FailureScenario) => {
    if (isAnalyzing || analysisTriggeredRef.current) return;
    analysisTriggeredRef.current = true;
    setIsAnalyzing(true);

    const prompt = buildAnalysisPrompt(metrics, recentLogs, scenario);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-logs', {
        body: { prompt },
      });

      if (error) {
        console.error('Edge function error:', error);
        // Fallback to mock
        const result = await mockAnalysis(scenario);
        setAnalysis(result);
        return;
      }

      if (data?.error) {
        console.error('Analysis error:', data.error);
        const result = await mockAnalysis(scenario);
        setAnalysis(result);
        return;
      }

      const parsed = parseAnalysisResponse(data.analysis, 'Gemini 3 Flash (Lovable AI)');
      if (parsed) {
        setAnalysis(parsed);
      } else {
        console.warn('Failed to parse AI response, using mock');
        const result = await mockAnalysis(scenario);
        setAnalysis(result);
      }
    } catch (err) {
      console.error('Analysis failed:', err);
      const result = await mockAnalysis(scenario);
      setAnalysis(result);
    } finally {
      setIsAnalyzing(false);
    }
  }, [isAnalyzing]);

  const tick = useCallback(() => {
    const elapsed = (Date.now() - scenarioStartRef.current) / 1000;
    const metrics = generateMetrics(activeScenario, elapsed);
    const newLogs = generateLogs(activeScenario, elapsed);

    setCurrentMetrics(metrics);
    setMetricsHistory(prev => [...prev.slice(-(MAX_METRICS_HISTORY - 1)), metrics]);

    const updatedLogs = [...logsRef.current, ...newLogs].slice(-MAX_LOGS);
    logsRef.current = updatedLogs;
    setLogs(updatedLogs);

    if (shouldTriggerAnalysis(metrics, activeScenario) && !analysisTriggeredRef.current) {
      triggerAnalysis(metrics, updatedLogs, activeScenario);
    }
  }, [activeScenario, triggerAnalysis]);

  useEffect(() => {
    if (isRunning) {
      tick(); // immediate first tick
      intervalRef.current = setInterval(tick, TICK_MS);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [tick, isRunning]);

  return {
    activeScenario,
    logs,
    metricsHistory,
    currentMetrics,
    analysis,
    isAnalyzing,
    isRunning,
    setIsRunning,
    injectScenario,
    resolveScenario,
  };
}

// Mock analysis that simulates LLM response
async function mockAnalysis(scenario: FailureScenario): Promise<AnalysisResult> {
  await new Promise(r => setTimeout(r, 1500 + Math.random() * 1000));

  const analyses: Record<string, Omit<AnalysisResult, 'analyzedAt' | 'model'>> = {
    memory_leak: {
      severity: 'CRITICAL',
      rootCause: 'Unbounded heap growth in product-service due to unclosed image buffer pool connections leaking ~50MB/min',
      evidence: [
        'Heap usage growing linearly from 600MB to 1.9GB over 30s',
        'GC pause times exceeding 500ms indicating V8 struggling to reclaim memory',
        'EventLoop lag correlating with heap pressure — requests queueing',
      ],
      immediateActions: [
        'Restart product-service pods with rolling restart to reclaim memory',
        'Enable Node.js --max-old-space-size=4096 as temporary buffer',
        'Activate circuit breaker on api-gateway to shed load during recovery',
      ],
      affectedServices: ['product-service', 'api-gateway'],
      estimatedImpact: 'Product pages loading 40x slower, estimated $12K/hour revenue loss from abandoned sessions',
      preventionSteps: [
        'Add memory leak detection in CI pipeline using clinic.js',
        'Implement proper cleanup in image buffer pool with explicit dispose()',
      ],
    },
    db_timeout: {
      severity: 'CRITICAL',
      rootCause: 'PostgreSQL connection pool exhausted due to long-running transactions holding connections without release',
      evidence: [
        'DB pool at 20/20 (100% utilized) — no connections available',
        'Connection acquire timeouts at 5000ms across checkout and cart services',
        'Transaction deadlocks detected on inventory table',
      ],
      immediateActions: [
        'Kill long-running queries: SELECT pg_terminate_backend(pid) for queries > 30s',
        'Increase pool size temporarily to 40 connections',
        'Enable PgBouncer transaction mode pooling',
      ],
      affectedServices: ['checkout-service', 'cart-service', 'inventory-service'],
      estimatedImpact: 'Checkout completely blocked, orders dropping to near-zero, estimated $25K/hour revenue loss',
      preventionSteps: [
        'Add statement_timeout = 30s at database level',
        'Implement connection pool monitoring with PgBouncer stats',
      ],
    },
    api_failure: {
      severity: 'HIGH',
      rootCause: 'Stripe payment API returning HTTP 503 — upstream provider experiencing partial outage',
      evidence: [
        'Consistent 503 responses from api.stripe.com/v1/charges',
        'Payment retry exhaustion after 3 attempts per transaction',
        'Error rate spike to 35%+ concentrated in payment-service',
      ],
      immediateActions: [
        'Enable payment queue to buffer charges for retry when Stripe recovers',
        'Show user-friendly "payment processing delayed" message on checkout',
        'Monitor Stripe status page and set up webhook for recovery notification',
      ],
      affectedServices: ['payment-service', 'checkout-service'],
      estimatedImpact: 'All new orders failing at payment step, revenue completely blocked until provider recovers',
      preventionSteps: [
        'Implement multi-PSP failover (add Adyen/Braintree as backup)',
        'Add circuit breaker with fallback payment queue pattern',
      ],
    },
    disk_full: {
      severity: 'HIGH',
      rootCause: '/var/log partition at 98% due to verbose debug logging enabled after last deploy and failed log rotation',
      evidence: [
        'ENOSPC errors on log writes across multiple services',
        'Elasticsearch refusing writes due to disk watermark exceeded',
        'WAL archiving stalled in PostgreSQL',
      ],
      immediateActions: [
        'Emergency log cleanup: find /var/log -name "*.log" -mtime +1 -delete',
        'Disable debug logging: set LOG_LEVEL=warn across all services',
        'Force logrotate execution with compression',
      ],
      affectedServices: ['api-gateway', 'search-service', 'inventory-service'],
      estimatedImpact: 'Write operations failing across stack, search results stale, potential data loss if WAL fills',
      preventionSteps: [
        'Set up disk usage alerts at 70%, 80%, 90% thresholds',
        'Implement structured logging with automatic retention policies',
      ],
    },
    deployment_regression: {
      severity: 'HIGH',
      rootCause: 'Version 2.14.0 introduced N+1 query in checkout flow — each cart item triggers separate DB query instead of batch',
      evidence: [
        'P99 latency jumped from 120ms to 4800ms immediately after deploy',
        'N+1 query pattern detected: SELECT per line_item',
        'TypeError on undefined "discount" property — missing null check in new code',
      ],
      immediateActions: [
        'Immediate rollback to v2.13.9 using kubectl rollout undo',
        'Block v2.14.0 from further canary promotion',
        'Notify customers of brief checkout disruption',
      ],
      affectedServices: ['checkout-service', 'user-service', 'api-gateway'],
      estimatedImpact: 'Checkout conversion dropped 60%, orders/min fell from 80 to 10, impacting ~$15K/hour',
      preventionSteps: [
        'Add performance regression tests comparing p99 against baseline',
        'Require load testing sign-off before production deploys',
      ],
    },
    cache_stampede: {
      severity: 'CRITICAL',
      rootCause: 'Redis cluster memory pressure causing mass key eviction, triggering thundering herd of 847+ concurrent DB fetches',
      evidence: [
        'Cache hit rate collapsed from 95% to <15%',
        'Redis evicting 4200 keys per 10s window',
        'Response time p99 at 8400ms due to cache miss cascade',
      ],
      immediateActions: [
        'Enable request coalescing / singleflight pattern for cache rebuilds',
        'Increase Redis maxmemory and switch to allkeys-lfu eviction policy',
        'Add mutex locks on cache population to prevent thundering herd',
      ],
      affectedServices: ['product-service', 'cart-service', 'search-service'],
      estimatedImpact: 'All product pages extremely slow, 8x normal response time, estimated 40% user drop-off',
      preventionSteps: [
        'Implement cache warming on deploy',
        'Add probabilistic early expiration (XFetch algorithm)',
      ],
    },
    payment_gateway: {
      severity: 'HIGH',
      rootCause: 'Stripe webhook processing silently failing due to signature verification error after secret rotation',
      evidence: [
        'Webhook signature verification failures on all incoming events',
        'Orders stuck in payment_pending state for 12+ minutes',
        'Reconciliation showing 47 charges without matching orders',
      ],
      immediateActions: [
        'Update webhook signing secret from Stripe dashboard immediately',
        'Run reconciliation script to match orphaned charges to orders',
        'Process stuck payment_pending orders manually',
      ],
      affectedServices: ['payment-service', 'checkout-service', 'notification-service'],
      estimatedImpact: 'Customers charged but not receiving order confirmations, high refund/chargeback risk',
      preventionSteps: [
        'Add webhook processing health check to monitoring',
        'Implement dual-secret rotation support for zero-downtime key changes',
      ],
    },
    search_index: {
      severity: 'MEDIUM',
      rootCause: 'Elasticsearch cluster degraded with 3 unassigned shards after node restart, causing search timeouts',
      evidence: [
        'Cluster health YELLOW with shard relocation in progress',
        'Search queries timing out at 10s on products_v3 index',
        'Segment count at 847 indicating delayed merges',
      ],
      immediateActions: [
        'Force shard allocation: POST /_cluster/reroute?retry_failed=true',
        'Enable SQL LIKE fallback for critical search paths',
        'Trigger force merge on products_v3 to reduce segment count',
      ],
      affectedServices: ['search-service', 'product-service'],
      estimatedImpact: 'Product search degraded, users seeing incomplete or slow results, ~10% conversion impact',
      preventionSteps: [
        'Add cluster health monitoring with automatic shard rebalancing',
        'Implement search result caching layer to absorb ES instability',
      ],
    },
    cdn_failure: {
      severity: 'MEDIUM',
      rootCause: 'CDN edge nodes serving stale assets after failed origin pull, likely due to origin health check misconfiguration',
      evidence: [
        'Origin pull 504 errors from CDN edge',
        'Assets served with age=7200s exceeding max-age=300s',
        'SSL handshake failures at Singapore POP',
      ],
      immediateActions: [
        'Purge CDN cache for affected asset paths',
        'Fix origin health check endpoint and timeouts',
        'Verify SSL certificate chain at all edge POPs',
      ],
      affectedServices: ['cdn-edge', 'api-gateway'],
      estimatedImpact: 'Users seeing broken styles/scripts, checkout page may show mixed content warnings',
      preventionSteps: [
        'Implement origin failover with multiple backend targets',
        'Add synthetic monitoring for CDN freshness across all POPs',
      ],
    },
    rate_limit: {
      severity: 'MEDIUM',
      rootCause: 'Coordinated bot scraping attack from IP range 45.33.x.x triggering WAF rate limits affecting legitimate traffic',
      evidence: [
        'Request rate 12,400/min from suspicious IP range (normal: ~1000/min)',
        'WAF blocking 2847 requests in 60s window',
        'False positive rate at 2.1% — legitimate users getting 429s',
      ],
      immediateActions: [
        'Block IP range 45.33.0.0/16 at edge firewall level',
        'Raise rate limit threshold for authenticated users to prevent false positives',
        'Enable CAPTCHA challenge for suspicious request patterns',
      ],
      affectedServices: ['api-gateway', 'product-service', 'user-service'],
      estimatedImpact: '2.1% of legitimate users blocked, bot traffic consuming 80% of capacity',
      preventionSteps: [
        'Implement progressive rate limiting with token bucket per user tier',
        'Add bot detection using browser fingerprinting and behavioral analysis',
      ],
    },
    ssl_expiry: {
      severity: 'HIGH',
      rootCause: 'SSL certificate for checkout.store.com expiring in <24h, ACME auto-renewal failed due to DNS challenge timeout',
      evidence: [
        'Certificate expiry warning: 22 hours remaining',
        'ACME DNS-01 challenge timeout during renewal attempt',
        'Users reporting ERR_CERT_DATE_INVALID on Chrome',
      ],
      immediateActions: [
        'Manually renew certificate via certbot with HTTP-01 challenge as fallback',
        'If renewal blocked, upload manually obtained cert from CA dashboard',
        'Verify DNS provider API credentials for ACME automation',
      ],
      affectedServices: ['api-gateway', 'checkout-service', 'payment-service'],
      estimatedImpact: 'Checkout will become completely inaccessible when cert expires, blocking all revenue',
      preventionSteps: [
        'Add certificate expiry monitoring with 30/14/7/1 day alerts',
        'Test ACME renewal in staging monthly to catch provider API changes',
      ],
    },
  };

  const data = analyses[scenario] || analyses.memory_leak;
  return { ...data, analyzedAt: new Date(), model: 'Claude 3.5 Sonnet (simulated)' } as AnalysisResult;
}
