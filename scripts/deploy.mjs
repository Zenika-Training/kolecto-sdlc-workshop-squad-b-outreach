// Local deploy: build, stop the previous instance, start in the background, health probe.
import { execSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, openSync, readFileSync, writeFileSync } from 'node:fs';
import { PORT, SQUAD, green, red, nowIso } from './lib.mjs';

mkdirSync('.run', { recursive: true });
execSync('npm run build', { stdio: 'inherit' });

if (existsSync('.run/server.pid')) {
  const previous = Number(readFileSync('.run/server.pid', 'utf8'));
  try { process.kill(previous); console.log(`Previous instance stopped (pid ${previous})`); } catch { /* already stopped */ }
}
const log = openSync('.run/server.log', 'a');
const child = spawn(process.execPath, ['dist/index.js'], { detached: true, stdio: ['ignore', log, log], env: { ...process.env, PORT: String(PORT) } });
child.unref();
writeFileSync('.run/server.pid', String(child.pid));

for (let i = 0; i < 20; i++) {
  await new Promise((r) => setTimeout(r, 250));
  try {
    const res = await fetch(`http://localhost:${PORT}/health`);
    if (res.ok) {
      const health = await res.json();
      writeFileSync('.run/deploy.json', JSON.stringify({ deployedAt: nowIso(), squad: SQUAD, port: PORT, flags: health.flags }, null, 2));
      green(`Deployed: http://localhost:${PORT} (flags: ${JSON.stringify(health.flags)})`);
      process.exit(0);
    }
  } catch { /* not ready yet */ }
}
red('The service does not answer on /health: see .run/server.log');
process.exit(1);
