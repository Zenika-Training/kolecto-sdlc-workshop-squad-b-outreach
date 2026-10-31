# CLAUDE.md · squad B · Outreach

You work for **squad B · Outreach** of the AI-augmented PDLC hackathon, on the fictional "smart payment reminders" case.
Your squad's slice: Plan the reminder: when to send it, which template and subject, what amount due, which event.

## Assembled context

The mission context is produced by the Context Assembler of the Context Nexus and imported here:

@.context/brief.md

If it is missing or outdated, run `npm run context` (or `/nexus`), then read what changed.

## Working rules

- The shared Context Nexus is in `../context-nexus/`. You may **read** all of it. You write **only** in `../context-nexus/teams/squad-b-outreach/`, and only when a human of the squad asks.
- Intent (what we build) and Contracts (what we require) are decided by humans. You draft; you never set an `intent/` or `contracts/` artefact to `status: active` yourself, and you never sign a gate.
- The other squad's contract is the truth as pinned in the brief. If you find a gap (name, type, unit, format) between our code or contract and theirs, **stop and report it** with both excerpts, instead of picking an interpretation.
- If the brief reports a `stale` artefact or a pinned version that changed, do not write new code on that basis until the squad has read the change (`/contract-diff`).
- `test/reference/` holds the programme's reference tests, generated from the business's acceptance examples. They are read-only. Make the code pass them.
- Spec Kit order: `/speckit-constitution` → `/speckit-specify` → `/speckit-clarify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`. The constitution only contains principles found in the brief, each with the id of its source (ORG-xx, SEC-xx, ENG-xx, RR-xx).
- Acceptance criteria in the spec carry ids `AC-1`, `AC-2`… and are written Given / When / Then. Every criterion has at least one unit test in `test/unit/` whose name starts with its id (ENG-02).
- Every feature sits behind the feature flag `reminders_outreach_plan`, off by default. You never switch a flag: the harness blocks it.
- Code always takes `today` / `now` as parameters, never the system clock (decision D-06).
- Code and specs in English. Be concise: read a precise file rather than the whole repository.

## This starter

- Fastify API in TypeScript (Node 22). The slice's route is in `src/routes.ts`, behind the flag in `flags.json`.
- The domain function to implement is in `src/domain/`: it is a **stub** that throws `NotImplementedError`.
- Squad B implements `planReminder` in `src/domain/plan-reminder.ts`. The route `POST /v1/reminders/plan` is already wired to it.
- `src/mocks/reminder-decision.ts` mocks squad A's contract **v0**. When squad A publishes v1, align the mock and your input type with the published contract, field for field, and pin that version in your spec and contract.
- `data/` holds the synthetic pilot dataset (reference day 2026-11-20). Amounts are always integer **cents**.

| Command | What it does |
|---|---|
| `npm test` | Unit tests (`test/unit/`) |
| `npm run test:reference` | The programme's reference tests (`test/reference/`) |
| `npm run test:coverage` | All tests, coverage ≥ 70 % |
| `npm run lint` / `npm run typecheck` | Code quality |
| `npm run scan` | No secret, no bank data (SEC-01, SEC-02) |
| `npm run context` | Re-assemble `.context/brief.md` from the Context Nexus |
| `npm run publish -- -m "…"` | Publish `teams/squad-b-outreach/` to the Context Nexus |
| `npm run gate -- G1` | Automatic gate-check (G1 to G4): run it before asking the gate keeper |
| `npm run deploy` / `npm run observe` | Local deploy on port 3002, health and metrics (G4) |
| `npm run flag -- reminders_outreach_plan on --reason "…"` | Traced flag switch: **human only**, never run it yourself |

## Code graph (Graphify)

`npm run graph` builds a knowledge graph of this starter's code in `graphify-out/` (local tree-sitter analysis: nothing leaves the machine). Open `graphify-out/graph.html` to see it.
- When `graphify-out/graph.json` exists, run `graphify query "<question>"` before your first grep or source-file read for a codebase question. Use `graphify path "<A>" "<B>"` for relationships, `graphify explain "<concept>"` for one concept, and `graphify affected "<symbol>"` to see what a change impacts.
- After modifying code, run `graphify update .` to keep the graph current (no API cost).
- `/graphify src` rebuilds it from the skill; keep it on `src` so it stays code-only and fast.

Skills of this harness: `/welcome`, `/nexus`, `/publish`, `/gate`, `/contract-diff`, the `/speckit-*` commands, and `/graphify`.
