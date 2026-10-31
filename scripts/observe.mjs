// Reads health and metrics of the deployed service (G4: observable).
import { PORT, green, red } from './lib.mjs';

try {
  const health = await (await fetch(`http://localhost:${PORT}/health`)).json();
  const metrics = await (await fetch(`http://localhost:${PORT}/metrics`)).json();
  green(`✓ ${health.squad} answers on port ${PORT}`);
  console.log('Flags    :', JSON.stringify(health.flags));
  console.log('Started  :', metrics.startedAt);
  console.log('Requests :', JSON.stringify(metrics.requests, null, 2));
} catch {
  red(`✗ No service on port ${PORT}: run npm run deploy`);
  process.exit(1);
}
