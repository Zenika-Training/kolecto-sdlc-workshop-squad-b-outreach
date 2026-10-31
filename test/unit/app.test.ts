import { describe, expect, it } from 'vitest';
import { buildApp } from '../../src/app.js';

const on = { reminders_outreach_plan: true };
const off = { reminders_outreach_plan: false };
const plan = (body: unknown) => ({ method: 'POST' as const, url: '/v1/reminders/plan', payload: body as object });

describe('starter squad-b-outreach', () => {
  it('answers /health with the squad and its flags', async () => {
    const res = await buildApp({ flags: off }).inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ status: 'ok', squad: 'squad-b-outreach', flags: off });
  });

  it('hides the route while the flag is off', async () => {
    const res = await buildApp({ flags: off }).inject(plan({ invoiceId: 'inv_0005', now: '2026-11-20T10:00:00+01:00' }));
    expect(res.statusCode).toBe(404);
    expect(res.json()).toMatchObject({ code: 'REMINDER_FEATURE_DISABLED' });
  });

  it('rejects an instant without offset (ORG-03, SEC-04)', async () => {
    const res = await buildApp({ flags: on }).inject(plan({ invoiceId: 'inv_0005', now: '2026-11-20 10:00' }));
    expect(res.statusCode).toBe(400);
  });

  // Starter behaviour: replace this test once planReminder is implemented.
  it('answers 501 while planReminder is a stub', async () => {
    const res = await buildApp({ flags: on }).inject(plan({ invoiceId: 'inv_0005', now: '2026-11-20T10:00:00+01:00' }));
    expect(res.statusCode).toBe(501);
  });

  it('counts requests in /metrics', async () => {
    const app = buildApp({ flags: off });
    await app.inject({ method: 'GET', url: '/health' });
    const res = await app.inject({ method: 'GET', url: '/metrics' });
    expect(res.json().requests).toMatchObject({ '/health 200': 1 });
  });
});
