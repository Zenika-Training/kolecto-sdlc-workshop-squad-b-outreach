/**
 * Mock of squad A's `reminder-decision` contract, **v0.1.0** (teams/squad-a-policy/contracts/reminder-decision.md),
 * written by facilitation before squad A existed. Code against it until squad A publishes v1, then align this
 * mock and your types with the published contract, field for field.
 */
export interface ReminderDecisionV0 {
  invoiceId: string;
  eligible: boolean;
  step: 'friendly' | 'firm' | 'formal' | null;
  daysLate: number;
  feeMinor: number;
}

const examples: Record<string, ReminderDecisionV0> = {
  inv_0002: { invoiceId: 'inv_0002', eligible: true, step: 'firm', daysLate: 20, feeMinor: 0 },
  inv_0005: { invoiceId: 'inv_0005', eligible: true, step: 'formal', daysLate: 50, feeMinor: 6055 },
  inv_0012: { invoiceId: 'inv_0012', eligible: true, step: 'friendly', daysLate: 3, feeMinor: 0 },
  inv_0022: { invoiceId: 'inv_0022', eligible: false, step: null, daysLate: 31, feeMinor: 0 },
};

export function mockDecision(invoiceId: string): ReminderDecisionV0 | undefined {
  return examples[invoiceId];
}
