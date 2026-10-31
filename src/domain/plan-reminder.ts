import { NotImplementedError } from './not-implemented.js';
import type { Customer } from './types.js';
import type { ReminderDecisionV0 } from '../mocks/reminder-decision.js';

export interface PlanReminderInput {
  /** The decision published by squad A (reminder-decision contract). Until A publishes v1, see src/mocks/. */
  decision: ReminderDecisionV0;
  customer: Customer;
  /** Current instant, ISO 8601 with offset (never the system clock: decision D-06). */
  now: string;
}

/** The planned reminder. Its exact shape is yours to define in your spec and publish in your contract. */
export type ReminderPlan = Record<string, unknown>;

/** Squad B · Outreach. Business rules RR-06 to RR-09; exact expected outputs in the reference cases. */
export function planReminder(input: PlanReminderInput): ReminderPlan {
  void input;
  throw new NotImplementedError('planReminder');
}
