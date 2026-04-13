// E-Commerce Log & Metric Simulator Engine

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'FATAL' | 'DEBUG';
export type FailureScenario = 'memory_leak' | 'db_timeout' | 'api_failure' | 'disk_full' | 'deployment_regression' | 'cache_stampede' | 'payment_gateway' | 'search_index' | 'cdn_failure' | 'rate_limit' | 'ssl_expiry' | 'none';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  service: string;
  message: string;
  traceId?: string;
  metadata?: Record<string, string | number>;
}

export interface Metrics {
  timestamp: Date;
  cpu: number;
  memory: number;
  diskUsage: number;
  requestsPerSec: number;
  avgResponseTime: number;
  errorRate: number;
  activeConnections: number;
  dbPoolUsed: number;
  dbPoolMax: number;
  cacheHitRate: number;
  ordersPerMin: number;
  cartAbandonRate: number;
  p99Latency: number;
  heapUsed: number;
  heapTotal: number;
  gcPauseMs: number;
}

export interface FailureConfig {
  label: string;
  description: string;
  icon: string;
}

export const FAILURE_SCENARIOS: Record<FailureScenario, FailureConfig> = {
  none: { label: 'Healthy', description: 'All systems nominal', icon: '✓' },
  memory_leak: { label: 'Memory Leak', description: 'Heap growing unbounded in product-service', icon: '🧠' },
  db_timeout: { label: 'DB Timeout', description: 'PostgreSQL connection pool exhausted', icon: '🗄️' },
  api_failure: { label: 'API Failure', description: 'Upstream payment provider returning 503', icon: '🔌' },
  disk_full: { label: 'Disk Full', description: '/var/log partition at 98%+', icon: '💾' },
  deployment_regression: { label: 'Deploy Regression', description: 'v2.14.0 introduced N+1 query in /checkout', icon: '🚀' },
  cache_stampede: { label: 'Cache Stampede', description: 'Redis cluster key eviction causing thundering herd', icon: '⚡' },
  payment_gateway: { label: 'Payment Gateway', description: 'Stripe webhook processing failing silently', icon: '💳' },
  search_index: { label: 'Search Index', description: 'Elasticsearch cluster yellow, shards relocating', icon: '🔍' },
  cdn_failure: { label: 'CDN Failure', description: 'CloudFront edge returning stale assets', icon: '🌐' },
  rate_limit: { label: 'Rate Limit', description: 'Bot traffic spike triggering WAF rules', icon: '🚦' },
  ssl_expiry: { label: 'SSL Expiry', description: 'Certificate expiring in <24h on checkout subdomain', icon: '🔒' },
};

const SERVICES = ['api-gateway', 'product-service', 'cart-service', 'checkout-service', 'payment-service', 'user-service', 'inventory-service', 'search-service', 'notification-service', 'cdn-edge'];

const HEALTHY_LOGS: Array<{ level: LogLevel; service: string; msg: string }> = [
  { level: 'INFO', service: 'api-gateway', msg: 'GET /api/v2/products 200 23ms' },
  { level: 'INFO', service: 'api-gateway', msg: 'POST /api/v2/cart/add 201 45ms' },
  { level: 'INFO', service: 'product-service', msg: 'Cache hit for catalog:electronics ratio=0.94' },
  { level: 'INFO', service: 'user-service', msg: 'JWT token validated for uid=usr_8f3k2 scope=read,write' },
  { level: 'INFO', service: 'checkout-service', msg: 'Order ORD-29481 created total=$124.99 items=3' },
  { level: 'INFO', service: 'payment-service', msg: 'Charge ch_3N8kPq succeeded amount=12499 currency=usd' },
  { level: 'INFO', service: 'inventory-service', msg: 'Stock decremented SKU-8829 qty=1 remaining=847' },
  { level: 'INFO', service: 'notification-service', msg: 'Email dispatched template=order_confirm to=user@example.com' },
  { level: 'DEBUG', service: 'search-service', msg: 'Elasticsearch query took 12ms hits=2847 index=products_v3' },
  { level: 'INFO', service: 'cdn-edge', msg: 'Asset /static/js/bundle.a8f3.js served from edge POP=IAD' },
  { level: 'INFO', service: 'cart-service', msg: 'Session sess_k29f cart updated items=2 subtotal=$89.98' },
  { level: 'INFO', service: 'api-gateway', msg: 'GET /api/v2/recommendations 200 67ms personalized=true' },
  { level: 'DEBUG', service: 'product-service', msg: 'Image resize queued SKU-1129 dimensions=400x400 format=webp' },
  { level: 'INFO', service: 'user-service', msg: 'Login successful method=oauth2 provider=google uid=usr_2k8f' },
  { level: 'INFO', service: 'inventory-service', msg: 'Warehouse sync completed region=us-east items_synced=12847' },
];

const FAILURE_LOGS: Record<FailureScenario, Array<{ level: LogLevel; service: string; msg: string }>> = {
  none: [],
  memory_leak: [
    { level: 'WARN', service: 'product-service', msg: 'Heap usage at 78% — GC pause 340ms' },
    { level: 'WARN', service: 'product-service', msg: 'Memory allocation failed for image buffer pool — retrying' },
    { level: 'ERROR', service: 'product-service', msg: 'OOMKill risk: heap 1.8GB/2GB — V8 GC unable to reclaim' },
    { level: 'ERROR', service: 'product-service', msg: 'EventLoop lag 2400ms — requests queueing in product-service' },
    { level: 'FATAL', service: 'product-service', msg: 'FATAL: JavaScript heap out of memory — process exiting pid=28491' },
    { level: 'WARN', service: 'api-gateway', msg: 'Upstream product-service latency spike p99=4200ms' },
  ],
  db_timeout: [
    { level: 'WARN', service: 'checkout-service', msg: 'DB pool utilization 85% (17/20 connections)' },
    { level: 'ERROR', service: 'checkout-service', msg: 'Connection acquire timeout after 5000ms — pool exhausted' },
    { level: 'ERROR', service: 'cart-service', msg: 'PgError: remaining connection slots reserved for superuser' },
    { level: 'FATAL', service: 'checkout-service', msg: 'FATAL: too many connections for role "app_user" limit=20' },
    { level: 'ERROR', service: 'inventory-service', msg: 'Transaction deadlock detected on table "inventory" — rollback' },
    { level: 'WARN', service: 'api-gateway', msg: 'Circuit breaker OPEN for checkout-service failures=12/min' },
  ],
  api_failure: [
    { level: 'WARN', service: 'payment-service', msg: 'Stripe API latency 3200ms — above SLA threshold' },
    { level: 'ERROR', service: 'payment-service', msg: 'HTTP 503 from api.stripe.com/v1/charges — Service Unavailable' },
    { level: 'ERROR', service: 'payment-service', msg: 'Payment retry 3/3 failed for order ORD-29482 — marking failed' },
    { level: 'ERROR', service: 'checkout-service', msg: 'Checkout flow blocked: payment provider unreachable' },
    { level: 'WARN', service: 'notification-service', msg: 'Failed payment email queued for ORD-29482 template=payment_failed' },
    { level: 'ERROR', service: 'api-gateway', msg: 'POST /api/v2/checkout 502 — upstream payment timeout' },
  ],
  disk_full: [
    { level: 'WARN', service: 'api-gateway', msg: 'Disk usage /var/log at 92% — rotation lagging' },
    { level: 'ERROR', service: 'api-gateway', msg: 'Write failed /var/log/access.log: No space left on device (ENOSPC)' },
    { level: 'ERROR', service: 'product-service', msg: 'Image upload rejected: insufficient disk space on /data partition' },
    { level: 'FATAL', service: 'search-service', msg: 'Elasticsearch refusing writes: disk watermark [95%] exceeded' },
    { level: 'ERROR', service: 'inventory-service', msg: 'WAL segment 000000010000003E full — PostgreSQL archiving stalled' },
    { level: 'WARN', service: 'cdn-edge', msg: 'Local cache eviction aggressive: disk at 97%' },
  ],
  deployment_regression: [
    { level: 'INFO', service: 'api-gateway', msg: 'Deploy v2.14.0 rolling out — canary 10% traffic' },
    { level: 'WARN', service: 'checkout-service', msg: 'N+1 query detected: SELECT * FROM line_items for each cart item' },
    { level: 'ERROR', service: 'checkout-service', msg: 'GET /checkout p99=4800ms (was 120ms in v2.13.9) — regression' },
    { level: 'ERROR', service: 'checkout-service', msg: 'TypeError: Cannot read properties of undefined (reading "discount")' },
    { level: 'WARN', service: 'api-gateway', msg: 'Error rate spike post-deploy: 8.2% (baseline 0.3%)' },
    { level: 'ERROR', service: 'user-service', msg: 'Session migration v2.14.0 failed: schema mismatch on "preferences"' },
  ],
  cache_stampede: [
    { level: 'WARN', service: 'product-service', msg: 'Redis EVICTED 4200 keys in 10s — memory pressure' },
    { level: 'ERROR', service: 'product-service', msg: 'Cache miss thundering herd: 847 concurrent fetches for catalog:home' },
    { level: 'ERROR', service: 'cart-service', msg: 'Redis CLUSTERDOWN — hash slot migration in progress' },
    { level: 'WARN', service: 'search-service', msg: 'Query cache invalidated globally — rebuilding 2.1M entries' },
    { level: 'ERROR', service: 'api-gateway', msg: 'Response time p50=1200ms p99=8400ms — cache miss cascade' },
    { level: 'WARN', service: 'product-service', msg: 'Fallback to DB direct: Redis latency >500ms' },
  ],
  payment_gateway: [
    { level: 'ERROR', service: 'payment-service', msg: 'Webhook signature verification failed event=evt_1N8kPq' },
    { level: 'ERROR', service: 'payment-service', msg: 'Stripe webhook 402: card_declined for sub_8fK2p — not propagated' },
    { level: 'WARN', service: 'checkout-service', msg: 'Order ORD-29483 stuck in "payment_pending" for 12min' },
    { level: 'ERROR', service: 'payment-service', msg: 'Idempotency key collision — duplicate charge risk for ch_3N8k' },
    { level: 'WARN', service: 'notification-service', msg: 'Customer complaint queue +23 — "payment charged but order not confirmed"' },
    { level: 'ERROR', service: 'payment-service', msg: 'Reconciliation mismatch: 47 charges without matching orders' },
  ],
  search_index: [
    { level: 'WARN', service: 'search-service', msg: 'Cluster health YELLOW — 3 unassigned shards' },
    { level: 'ERROR', service: 'search-service', msg: 'Search query timeout 10000ms index=products_v3 query="laptop"' },
    { level: 'WARN', service: 'search-service', msg: 'Shard relocation in progress: 12/200 shards moving' },
    { level: 'ERROR', service: 'product-service', msg: 'Product search fallback to SQL LIKE — degraded results' },
    { level: 'WARN', service: 'search-service', msg: 'Index products_v3 segments=847 — merge policy lagging' },
    { level: 'ERROR', service: 'api-gateway', msg: 'GET /api/v2/search 504 Gateway Timeout — elasticsearch' },
  ],
  cdn_failure: [
    { level: 'WARN', service: 'cdn-edge', msg: 'Origin pull failure: 504 from origin for /static/css/main.css' },
    { level: 'ERROR', service: 'cdn-edge', msg: 'Serving stale content age=7200s max-age=300s path=/static/js/app.js' },
    { level: 'WARN', service: 'api-gateway', msg: 'Client reports: mixed content warnings on checkout page' },
    { level: 'ERROR', service: 'cdn-edge', msg: 'Cache invalidation failed: API rate limit exceeded' },
    { level: 'WARN', service: 'product-service', msg: 'Image CDN returning 403 for product thumbnails — ACL issue' },
    { level: 'ERROR', service: 'cdn-edge', msg: 'SSL handshake failure at edge POP=SIN — certificate chain incomplete' },
  ],
  rate_limit: [
    { level: 'WARN', service: 'api-gateway', msg: 'Request rate 12,400/min from IP range 45.33.x.x — bot pattern detected' },
    { level: 'ERROR', service: 'api-gateway', msg: 'WAF rule triggered: 429 Too Many Requests — 2847 blocked in 60s' },
    { level: 'WARN', service: 'product-service', msg: 'Scraper detected: User-Agent="python-requests/2.28" path=/api/v2/products' },
    { level: 'ERROR', service: 'cart-service', msg: 'Cart creation rate limit: 200 carts from single session — abuse' },
    { level: 'WARN', service: 'api-gateway', msg: 'Legitimate traffic impacted: false positive rate 2.1% during block' },
    { level: 'ERROR', service: 'user-service', msg: 'Brute force detected: 847 failed logins for admin@store.com in 5min' },
  ],
  ssl_expiry: [
    { level: 'WARN', service: 'api-gateway', msg: 'SSL certificate for checkout.store.com expires in 22h' },
    { level: 'ERROR', service: 'api-gateway', msg: 'ACME renewal failed: DNS-01 challenge timeout for checkout.store.com' },
    { level: 'WARN', service: 'payment-service', msg: 'TLS handshake warning: peer certificate about to expire' },
    { level: 'ERROR', service: 'cdn-edge', msg: 'OCSP stapling failed for checkout.store.com — revocation check error' },
    { level: 'WARN', service: 'api-gateway', msg: 'Chrome users reporting NET::ERR_CERT_DATE_INVALID on checkout' },
    { level: 'ERROR', service: 'checkout-service', msg: 'Webhook callback to checkout.store.com/hook failed: SSL_ERROR_EXPIRED' },
  ],
};

let logCounter = 0;
const generateTraceId = () => `trace-${Math.random().toString(36).substr(2, 12)}`;

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function generateMetrics(scenario: FailureScenario, elapsed: number): Metrics {
  const t = Math.min(elapsed / 30, 1); // ramp over 30 seconds

  const base: Metrics = {
    timestamp: new Date(),
    cpu: randomBetween(15, 35),
    memory: randomBetween(40, 55),
    diskUsage: randomBetween(45, 55),
    requestsPerSec: randomBetween(800, 1200),
    avgResponseTime: randomBetween(30, 80),
    errorRate: randomBetween(0.1, 0.5),
    activeConnections: Math.floor(randomBetween(150, 300)),
    dbPoolUsed: Math.floor(randomBetween(5, 10)),
    dbPoolMax: 20,
    cacheHitRate: randomBetween(92, 98),
    ordersPerMin: randomBetween(40, 80),
    cartAbandonRate: randomBetween(15, 25),
    p99Latency: randomBetween(80, 200),
    heapUsed: randomBetween(400, 600),
    heapTotal: 2048,
    gcPauseMs: randomBetween(5, 20),
  };

  if (scenario === 'none') return base;

  const overrides: Partial<Metrics> = {};

  switch (scenario) {
    case 'memory_leak':
      overrides.memory = clamp(55 + t * 40, 55, 98);
      overrides.heapUsed = clamp(600 + t * 1400, 600, 1950);
      overrides.gcPauseMs = clamp(20 + t * 500, 20, 800);
      overrides.cpu = clamp(35 + t * 50, 35, 95);
      overrides.avgResponseTime = clamp(80 + t * 3000, 80, 5000);
      break;
    case 'db_timeout':
      overrides.dbPoolUsed = clamp(Math.floor(10 + t * 10), 10, 20);
      overrides.avgResponseTime = clamp(80 + t * 4000, 80, 8000);
      overrides.errorRate = clamp(0.5 + t * 25, 0.5, 30);
      overrides.ordersPerMin = clamp(80 - t * 75, 2, 80);
      break;
    case 'api_failure':
      overrides.errorRate = clamp(0.5 + t * 35, 0.5, 40);
      overrides.ordersPerMin = clamp(80 - t * 70, 5, 80);
      overrides.avgResponseTime = clamp(80 + t * 2000, 80, 3000);
      break;
    case 'disk_full':
      overrides.diskUsage = clamp(70 + t * 28, 70, 99);
      overrides.errorRate = clamp(0.5 + t * 15, 0.5, 20);
      break;
    case 'deployment_regression':
      overrides.avgResponseTime = clamp(80 + t * 4000, 80, 5000);
      overrides.errorRate = clamp(0.5 + t * 12, 0.5, 15);
      overrides.p99Latency = clamp(200 + t * 4500, 200, 5000);
      overrides.ordersPerMin = clamp(80 - t * 60, 10, 80);
      break;
    case 'cache_stampede':
      overrides.cacheHitRate = clamp(95 - t * 80, 10, 95);
      overrides.avgResponseTime = clamp(80 + t * 6000, 80, 8000);
      overrides.cpu = clamp(35 + t * 55, 35, 95);
      overrides.requestsPerSec = clamp(1200 + t * 3000, 1200, 5000);
      break;
    case 'payment_gateway':
      overrides.errorRate = clamp(0.5 + t * 20, 0.5, 25);
      overrides.ordersPerMin = clamp(80 - t * 65, 8, 80);
      break;
    case 'search_index':
      overrides.avgResponseTime = clamp(80 + t * 8000, 80, 10000);
      overrides.errorRate = clamp(0.5 + t * 10, 0.5, 12);
      break;
    case 'cdn_failure':
      overrides.avgResponseTime = clamp(80 + t * 2000, 80, 3000);
      overrides.errorRate = clamp(0.5 + t * 8, 0.5, 10);
      break;
    case 'rate_limit':
      overrides.requestsPerSec = clamp(1200 + t * 10000, 1200, 15000);
      overrides.cpu = clamp(35 + t * 50, 35, 90);
      overrides.activeConnections = Math.floor(clamp(300 + t * 2000, 300, 3000));
      break;
    case 'ssl_expiry':
      overrides.errorRate = clamp(0.5 + t * 15, 0.5, 18);
      overrides.ordersPerMin = clamp(80 - t * 50, 20, 80);
      break;
  }

  return { ...base, ...overrides };
}

export function generateLogs(scenario: FailureScenario, elapsed: number): LogEntry[] {
  const logs: LogEntry[] = [];
  const t = Math.min(elapsed / 30, 1);

  // Always produce 1-3 healthy logs
  const healthyCount = scenario === 'none' ? 3 : Math.max(1, Math.floor(3 - t * 2));
  for (let i = 0; i < healthyCount; i++) {
    const tpl = HEALTHY_LOGS[Math.floor(Math.random() * HEALTHY_LOGS.length)];
    logs.push({
      id: `log-${++logCounter}`,
      timestamp: new Date(),
      level: tpl.level,
      service: tpl.service,
      message: tpl.msg,
      traceId: generateTraceId(),
    });
  }

  // Add failure logs based on scenario intensity
  if (scenario !== 'none') {
    const failLogs = FAILURE_LOGS[scenario];
    const failCount = Math.min(failLogs.length, Math.floor(1 + t * 4));
    const selectedIndices = new Set<number>();
    while (selectedIndices.size < failCount) {
      selectedIndices.add(Math.floor(Math.random() * failLogs.length));
    }
    for (const idx of selectedIndices) {
      const tpl = failLogs[idx];
      logs.push({
        id: `log-${++logCounter}`,
        timestamp: new Date(),
        level: tpl.level,
        service: tpl.service,
        message: tpl.msg,
        traceId: generateTraceId(),
      });
    }
  }

  return logs;
}

export function shouldTriggerAnalysis(metrics: Metrics, scenario: FailureScenario): boolean {
  if (scenario === 'none') return false;
  return (
    metrics.errorRate > 5 ||
    metrics.avgResponseTime > 1000 ||
    metrics.memory > 85 ||
    metrics.diskUsage > 90 ||
    metrics.dbPoolUsed >= metrics.dbPoolMax - 2 ||
    metrics.cacheHitRate < 50 ||
    metrics.cpu > 80
  );
}

export function buildAnalysisPrompt(metrics: Metrics, recentLogs: LogEntry[], scenario: FailureScenario): string {
  const logText = recentLogs
    .slice(-20)
    .map(l => `[${l.level}] [${l.service}] ${l.message}`)
    .join('\n');

  return `You are a senior SRE analyzing a production e-commerce incident. Analyze these metrics and logs, then respond in EXACTLY this JSON format (no markdown, no code fences):

{"severity":"CRITICAL|HIGH|MEDIUM|LOW","rootCause":"One sentence root cause","evidence":["evidence point 1","evidence point 2","evidence point 3"],"immediateActions":["action 1","action 2","action 3"],"affectedServices":["service1","service2"],"estimatedImpact":"Business impact description","preventionSteps":["prevention 1","prevention 2"]}

CURRENT METRICS:
- CPU: ${metrics.cpu.toFixed(1)}%
- Memory: ${metrics.memory.toFixed(1)}% (Heap: ${metrics.heapUsed.toFixed(0)}MB/${metrics.heapTotal}MB)
- Disk: ${metrics.diskUsage.toFixed(1)}%
- Requests/sec: ${metrics.requestsPerSec.toFixed(0)}
- Avg Response: ${metrics.avgResponseTime.toFixed(0)}ms
- P99 Latency: ${metrics.p99Latency.toFixed(0)}ms
- Error Rate: ${metrics.errorRate.toFixed(2)}%
- DB Pool: ${metrics.dbPoolUsed}/${metrics.dbPoolMax}
- Cache Hit Rate: ${metrics.cacheHitRate.toFixed(1)}%
- Orders/min: ${metrics.ordersPerMin.toFixed(1)}
- Cart Abandon Rate: ${metrics.cartAbandonRate.toFixed(1)}%
- GC Pause: ${metrics.gcPauseMs.toFixed(0)}ms

RECENT LOGS:
${logText}`;
}

export interface AnalysisResult {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  rootCause: string;
  evidence: string[];
  immediateActions: string[];
  affectedServices: string[];
  estimatedImpact: string;
  preventionSteps: string[];
  analyzedAt: Date;
  model: string;
}

export function parseAnalysisResponse(text: string, model: string): AnalysisResult | null {
  try {
    // Try to extract JSON from response
    let jsonStr = text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) jsonStr = jsonMatch[0];
    
    const parsed = JSON.parse(jsonStr);
    return {
      severity: parsed.severity || 'MEDIUM',
      rootCause: parsed.rootCause || 'Unknown',
      evidence: parsed.evidence || [],
      immediateActions: parsed.immediateActions || [],
      affectedServices: parsed.affectedServices || [],
      estimatedImpact: parsed.estimatedImpact || 'Unknown impact',
      preventionSteps: parsed.preventionSteps || [],
      analyzedAt: new Date(),
      model,
    };
  } catch {
    return null;
  }
}
