// Moves the Spec Kit spec between this starter and the Context Nexus, so nobody copies it by hand.
//   npm run spec:publish [-- --repin]   specs/<feature>/ → teams/<squad>/intent/specs/ (spec with frontmatter, plus plan, tasks…)
//   npm run spec:pull                   teams/<squad>/intent/specs/ → specs/<feature>/ (the driver, in another Codespace)
// Neither one publishes: a human checks owner, status and version, then /publish.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { NEXUS, SQUAD, TEAM, requireNexus, green, red, nowIso } from './lib.mjs';

requireNexus();
const [action, ...rest] = process.argv.slice(2);
const SPECS = resolve(TEAM, 'intent/specs');
const PUBLISHED = resolve(SPECS, `${SQUAD}-001.md`);
const today = nowIso().slice(0, 10);

const split = (text) => { const m = text.match(/^---\n([\s\S]*?)\n---\n*/); return m ? [m[1], text.slice(m[0].length)] : ['', text]; };
const field = (fm, k) => (fm.match(new RegExp(`^${k}:\\s*(.*)$`, 'm')) ?? [])[1]?.trim();
const versionOf = (rel) => { const p = resolve(NEXUS, rel); return existsSync(p) ? field(split(readFileSync(p, 'utf8'))[0], 'version') : null; };
const files = (dir) => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? files(join(dir, n)).map((f) => join(n, f)) : [n]));
const dirs = (dir) => (existsSync(dir) ? readdirSync(dir).filter((n) => statSync(join(dir, n)).isDirectory()) : []);

function feature(candidates, where) {
  const fj = '.specify/feature.json';
  const fromJson = existsSync(fj) ? JSON.parse(readFileSync(fj, 'utf8')).feature_directory?.split('/').pop() : null;
  if (fromJson && candidates.includes(fromJson)) return fromJson;
  if (candidates.length === 1) return candidates[0];
  red(candidates.length ? `✗ Several features in ${where}: ${candidates.join(', ')}. Set .specify/feature.json.` : `✗ No feature in ${where}.`);
  process.exit(1);
}

if (action === 'publish') {
  const f = feature(dirs('specs'), 'specs/');
  const body = readFileSync(join('specs', f, 'spec.md'), 'utf8').replace(/^\*\*Status\*\*:.*\n\n?/m, '');
  let fm;
  if (existsSync(PUBLISHED)) {
    const [old, oldBody] = split(readFileSync(PUBLISHED, 'utf8'));
    fm = old.replace(/^last-validated:.*$/m, `last-validated: ${today}`);
    if (oldBody.trim() !== body.trim()) console.log(`Content changed: bump version (now ${field(old, 'version')}; major if the change breaks a consumer, API-02).`);
  } else {
    const contracts = readdirSync(resolve(NEXUS, 'teams')).flatMap((t) => (existsSync(resolve(NEXUS, 'teams', t, 'contracts')) ? readdirSync(resolve(NEXUS, 'teams', t, 'contracts')).filter((n) => n.endsWith('.md')).map((n) => `teams/${t}/contracts/${n}`) : []));
    const pins = [`teams/${SQUAD}/intent/business-intent.md`, 'programme/payment-reminders/knowledge/business-rules.md', 'programme/payment-reminders/contracts/reference-cases.md', ...contracts]
      .filter(versionOf).map((p) => `${p}@${versionOf(p)}`);
    fm = [`id: ${SQUAD}/spec-001`, 'register: intent', 'level: team', 'owner: <first.last>', 'status: draft', 'version: 1.0.0', `last-validated: ${today}`,
      'consumption-mode: context-injection', `source: starter-${SQUAD}/specs/${f}/spec.md`, `consumes: [${pins.join(', ')}]`, 'consumers: []', 'exception-to: null', 'exception-approved-by: null'].join('\n');
  }
  // Pins: report what changed; --repin moves them to the current version (only once the squad has read the change).
  const consumes = (field(fm, 'consumes') ?? '').replace(/^\[|\]$/g, '').split(',').map((s) => s.trim()).filter(Boolean);
  const moved = consumes.map((ref) => { const [p, v] = ref.split('@'); return [p, v, versionOf(p)]; }).filter(([, v, cur]) => cur && v !== cur);
  if (rest.includes('--repin')) fm = fm.replace(/^consumes:.*$/m, `consumes: [${consumes.map((ref) => { const [p, v] = ref.split('@'); return `${p}@${versionOf(p) ?? v}`; }).join(', ')}]`);
  mkdirSync(join(SPECS, f), { recursive: true });
  writeFileSync(PUBLISHED, `---\n${fm}\n---\n\n${body}`);
  const working = files(join('specs', f)).filter((n) => n !== 'spec.md');
  for (const n of working) { mkdirSync(join(SPECS, f, n, '..'), { recursive: true }); cpSync(join('specs', f, n), join(SPECS, f, n)); }
  green(`✓ ${relative(NEXUS, PUBLISHED)} written, and ${working.length} working file(s) in ${relative(NEXUS, join(SPECS, f))}/`);
  for (const [p, v, cur] of moved) console.log(`  ${rest.includes('--repin') ? 're-pinned' : 'stale pin '} ${p} ${v} → ${cur}${rest.includes('--repin') ? '' : '  (read the change, then npm run spec:publish -- --repin)'}`);
  console.log(`Next: a human checks owner, status and version in ${relative(process.cwd(), PUBLISHED)}, then /publish.`);
} else if (action === 'pull') {
  if (!existsSync(PUBLISHED)) { red(`✗ Nothing published yet in ${relative(NEXUS, SPECS)}/: the pen runs npm run spec:publish, then /publish.`); process.exit(1); }
  const f = feature(dirs(SPECS), relative(NEXUS, SPECS) + '/');
  const incoming = [['spec.md', split(readFileSync(PUBLISHED, 'utf8'))[1]], ...files(join(SPECS, f)).map((n) => [n, readFileSync(join(SPECS, f, n), 'utf8')])];
  const changed = [];
  for (const [n, text] of incoming) {
    const dest = join('specs', f, n);
    if (existsSync(dest) && readFileSync(dest, 'utf8') !== text) changed.push(n);
    mkdirSync(join(dest, '..'), { recursive: true });
    writeFileSync(dest, text);
  }
  mkdirSync('.specify', { recursive: true });
  writeFileSync('.specify/feature.json', `${JSON.stringify({ feature_directory: `specs/${f}` }, null, 2)}\n`);
  green(`✓ specs/${f}/: ${incoming.length} file(s) from the Nexus${changed.length ? `, ${changed.length} updated (${changed.join(', ')})` : ''}. Spec Kit now works on this feature.`);
} else {
  red('Usage: npm run spec:publish [-- --repin]   |   npm run spec:pull');
  process.exit(2);
}
