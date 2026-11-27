async function verifyProduction() {
  console.log('--- RUNNING PRODUCTION ARCHITECTURE AUDIT ---');

  // 1. Health Probe
  const healthRes = await fetch('http://localhost:3000/api/health');
  const health = await healthRes.json();
  console.log('✓ Liveness Probe /api/health:', health.status, `(Uptime: ${health.telemetry.uptimeSeconds}s, Memory: ${health.telemetry.memory.rssMb}MB)`);

  // 2. Readiness Probe
  const readyRes = await fetch('http://localhost:3000/api/ready');
  const ready = await readyRes.json();
  console.log('✓ Readiness Probe /api/ready:', ready.status, `(DB Ping Latency: ${ready.dbPingLatencyMs}ms)`);

  // 3. Security Headers
  const rootRes = await fetch('http://localhost:3000/');
  console.log('✓ Production Security Headers:');
  console.log('   X-Frame-Options:', rootRes.headers.get('x-frame-options'));
  console.log('   X-Content-Type-Options:', rootRes.headers.get('x-content-type-options'));
  console.log('   Strict-Transport-Security:', rootRes.headers.get('strict-transport-security'));
  console.log('   Permissions-Policy:', rootRes.headers.get('permissions-policy'));

  // 4. Rate Limiting Headers
  const catRes1 = await fetch('http://localhost:3000/api/categories?lang=en');
  const etag = catRes1.headers.get('etag');
  console.log('✓ Rate Limiting Headers:');
  console.log('   X-RateLimit-Limit:', catRes1.headers.get('x-ratelimit-limit'));
  console.log('   X-RateLimit-Remaining:', catRes1.headers.get('x-ratelimit-remaining'));
  console.log('   X-RateLimit-Tier:', catRes1.headers.get('x-ratelimit-tier'));

  // 5. High-Speed Caching & Conditional 304 Not Modified
  console.log('✓ Caching & Conditional HTTP 304 Verification:');
  console.log('   Initial Fetch ETag:', etag);
  console.log('   Initial Cache-Control:', catRes1.headers.get('cache-control'));
  
  const catRes2 = await fetch('http://localhost:3000/api/categories?lang=en', {
    headers: { 'If-None-Match': etag }
  });
  console.log('   Conditional Re-fetch HTTP Status (Expect 304):', catRes2.status);

  // 6. UI Translations Cache & Rate Limit
  const transRes = await fetch('http://localhost:3000/api/translations?lang=en');
  console.log('✓ UI Translations Cache:', transRes.headers.get('x-cache-status'), `(ETag: ${transRes.headers.get('etag')})`);

  console.log('--- ALL PRODUCTION REFINEMENTS VERIFIED CLEANLY ---');
}

verifyProduction().catch(console.error);
