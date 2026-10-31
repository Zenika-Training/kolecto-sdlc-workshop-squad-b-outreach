// Reference tests · READ-ONLY (ENG-04). Generated from the business's acceptance examples in the Context Nexus.
import { describe, expect, it } from 'vitest';
import { planReminder, type PlanReminderInput } from '../../src/domain/plan-reminder.js';
import { loadReferenceCases } from './load-cases.js';

const cases = loadReferenceCases();

describe(`reference cases ${cases.version} · planReminder`, () => {
  for (const c of cases.planReminder) {
    it(c.name, () => {
      expect(planReminder(c.input as PlanReminderInput)).toEqual(c.expected);
    });
  }
});
