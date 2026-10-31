import type { FastifyInstance } from 'fastify';
import { FLAG } from './config.js';
import { customers, invoices } from './data.js';
import { NotImplementedError } from './domain/not-implemented.js';
import { planReminder } from './domain/plan-reminder.js';
import { sendError } from './errors.js';
import { isEnabled, type Flags } from './flags.js';
import { mockDecision } from './mocks/reminder-decision.js';

const INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/;

/** Squad B route, described by teams/squad-b-outreach/contracts/reminder-events.md. */
export function registerRoutes(app: FastifyInstance, flags: Flags): void {
  app.post<{ Body: { invoiceId?: string; now?: string } }>('/v1/reminders/plan', async (request, reply) => {
    if (!isEnabled(flags, FLAG)) return sendError(reply, 404, 'REMINDER_FEATURE_DISABLED', `Feature disabled (flag ${FLAG})`);
    const { invoiceId, now } = request.body ?? {};
    if (!invoiceId || !now || !INSTANT.test(now)) return sendError(reply, 400, 'REMINDER_INVALID_INPUT', 'Body { invoiceId, now (ISO 8601 with offset) } is required');
    const invoice = invoices().find((i) => i.id === invoiceId);
    const customer = invoice && customers().find((c) => c.id === invoice.customerId);
    // Until squad A deploys its service, the decision comes from the v0 mock.
    const decision = mockDecision(invoiceId);
    if (!invoice || !customer || !decision) return sendError(reply, 404, 'REMINDER_DECISION_NOT_FOUND', 'No decision for this invoice', { invoiceId });
    try {
      return planReminder({ decision, customer, now });
    } catch (error) {
      if (error instanceof NotImplementedError) return sendError(reply, 501, 'REMINDER_NOT_IMPLEMENTED', error.message);
      throw error;
    }
  });
}
