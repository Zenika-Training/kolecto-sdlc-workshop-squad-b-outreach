# Mission · squad B · Outreach

> Your goal, who does what, and for each phase: the commands and **example prompts**. The examples worked in rehearsal: **adapt them, don't paste them**. Your own words, your own questions, work better. One page of commands: `CHEATSHEET.md`.

## Your slice

You build `planReminder` (`src/domain/plan-reminder.ts`): when to send the reminder, in which language, with which subject and amount due. Rules: **RR-06 to RR-09** in the business rules. Exact expected outputs: the reference cases.

- **You read:** squad A's decision (`reminder-decision`).
- **Who reads you:** squad C measures the pilot from your plans.
- You publish one contract: **`reminder-events`**. Publish your contract after squad A's v1 (pin A's version), before squad C's.

## Who does what (two people)

Pick the hats yourselves. A split that worked:

| Seat | Hats | Mostly |
|---|---|---|
| **Pen** | Specification Engineer + Context Engineer | holds the pen on the intent and the spec, reads the other squads' contracts, keeps the pins current |
| **Driver** | Agentic Workflow Orchestrator + Decision Guarantor | owns the contract, drives the code from Develop on, switches the flag |

One Codespace is the **driver station**: at Develop, swap seats, not Codespaces. Working in two Codespaces? The pen runs `npm run spec:publish` then `/publish`; the other runs `npm run spec:pull`.

## How to talk to Claude

Say who you are and what you want, give a limit, then review what comes back. Three habits from the rehearsal:

- **One step at a time:** "Do T001 to T003 only, then stop so I can review."
- **Ask before it edits:** "Show me what changed for us. Don't edit anything yet."
- **Keep other squads' questions for humans:** "Ask me your questions; don't answer anything about squad C: I'll walk over."

## Kick-off · everyone

In Claude Code: `/welcome`. Then:
> I'm <name>, I wear <hats>. <Teammate> holds the pen on the intent. What should I do first in my seat?

## Discover · G1 Ready to Spec

**Goal:** a Business Intent Spec in five answers (problem, users, a success number with a horizon, data, priority and owner), every claim with its source.

**Pen**
> What does the brief **not** say that matters for `planReminder`? Split it: what's in the Context Nexus, what only the Head of Receivables can answer.

Ask the Head of Receivables (a human, in the room), not Claude, for the number. Then:
> Here is what the Head of Receivables said: <her answers, with today's date>. Copy `templates/business-intent.md` to our folder in the Nexus and draft our intent from it. Tag every claim with its source. Leave owner and status to me.

Review it, set `owner:` and `status: active` yourself in the editor, then `/publish` and `npm run gate -- G1`.

**Driver**
> Read squad A's contract in the Nexus. List what we need from them, field by field, and what is unclear.

**Done when:** `npm run gate -- G1` is green and the gate keeper says GO.

## Design · G2 Ready to Build

**Goal:** a short spec (Spec Kit) with 3 to 5 acceptance criteria AC-1… in Given/When/Then, and your contract v1. Read the other squad's contract **before** writing yours.

**Pen**: the Spec Kit chain, one command at a time, reviewing each:
> /speckit-constitution The org rules are already in it. Add the business rules of our slice (RR-06 to RR-09), each with its id. Nothing else.

> /speckit-specify planReminder: turn squad A's published decision into a planned e-mail: send time inside the business sending window (RR-06), template and subject in the customer's language (RR-07), fee lines and amount due (RR-08), the reminder_scheduled event (RR-09). Short spec: one user story, 3 to 5 acceptance criteria in Given/When/Then.

> /speckit-clarify Ask me your questions, max 3. Don't answer them yourself, above all anything about another squad.

> /speckit-plan then /speckit-tasks. Keep the plan short: one pure function behind the existing route, reuse what Core Billing already does, tests named after the AC.

Then `npm run spec:publish`, set owner and status in the editor, `/publish`.

**Driver**: the contract.
> Write our contract `reminder-events` v1.0.0 in `../context-nexus/teams/squad-b-outreach/contracts/` from `templates/contract.md`, field by field: name, type, unit, example, rule. Take every field we read from squad A with A's published name. Squad C reads our plan next: make the step and the fees explicit.

Review it, set owner and status, `/publish`. Once the contract is out, the pen re-pins the spec on it: `npm run spec:publish -- --repin`, then `/publish`.

**Done when:** `npm run gate -- G2` is green. At minute 35, the contract market: the three contracts on the room screen, field by field.

## Develop · G3 Ready to Release

**Goal:** the code, task by task; one unit test named after each AC; the reference tests green.

**Driver** (start a **fresh** Claude session: a long one re-reads its whole history on every turn):
> I'm the driver now. I ran `npm run spec:pull` and `npm run graph`. Before writing anything, use the graph: what does Core Billing (`src/billing/`) already do that `planReminder` needs? Give me a table: our need, the existing function, its file. Nothing marked `@deprecated`.

> /speckit-implement Reuse the functions from your table. One unit test per AC, named after its id. Don't touch `test/reference/` or `src/billing/`. Do the first three tasks, then stop so I can review.

Then `npm test`, `npm run test:reference`, `npm run gate -- G3`.

**Pen**: keep the spec right while the code is written; check the acceptance criteria against what the code taught you.

### When the business changes its mind (around minute 50)

The Head of Receivables reads a card. Then, **before prompting anything**:
1. `/nexus`: what is now stale.
2. `/contract-diff`:
   > Show me what changed for squad B, and which of our acceptance criteria and code it hits. Don't edit anything yet.
3. Read the diff yourselves. Then the pen updates the spec, the driver the code and the contract.

Start your side from the business rules 2.0.0 and A's diff; publish `reminder-events` 2.0.0 as soon as A's 2.0.0 is out, so squad C can start. Re-pin the intent and the spec on the new versions (`npm run spec:publish -- --repin`, `/publish`).

**Done when:** `npm run gate -- G3` is green again and the gate keeper says GO.

## Deploy · G4 Released and Observable

**Goal:** live with the flag off; a human switches it on, with a reason; a five-line runbook.

**Driver**, in the terminal (these are yours, not Claude's):
```
npm run deploy
npm run observe
npm run flag -- reminders_outreach_plan on --reason "<why, and the G3 GO>"
```
Then `/publish` (the flag journal), `npm run deploy` again (the service reads the flag at start), `npm run observe`, and try the feature: `curl -s -X POST "http://localhost:3002/v1/reminders/plan" -H "content-type: application/json" -d '{"invoiceId":"inv_0002","now":"2026-11-20T10:00:00+01:00"}'`

**Pen**:
> Write our runbook in `teams/squad-b-outreach/operations/runbook.md` from `templates/runbook.md`, five lines, for our service. The owner is <driver>. Rollback: flag off with a reason, then `npm run deploy`.

Set owner and status, `/publish`. Then `npm run gate -- G4`.

**Done when:** `npm run gate -- G4` is green and you can say, in one sentence, who switches it off and how fast.
