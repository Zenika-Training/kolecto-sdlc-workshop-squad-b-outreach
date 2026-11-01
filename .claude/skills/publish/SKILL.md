---
name: publish
description: Publish the squad's artefacts to the Context Nexus (business intent, spec, contract, runbook, journals). Checks the frontmatter first, shows what will be published, then commits and pushes only teams/<squad>/. Use for /publish or "publish our changes".
---

# /publish

Publishing makes your work visible to the other squad and to the gate keeper. Only `teams/<squad>/` is ever published.

1. Show what changed: `git -C ../context-nexus status --short -- teams/` .
2. For each changed Markdown artefact, check its frontmatter and list problems (do not fix without asking):
   - `owner` is a person's name, not a placeholder;
   - `status`: `intent/` and `contracts/` must be set to `active` **by a human**, in the editor: you never change it yourself. If they are `draft`, say: "A human reviews it, then sets `status: active` and their name as owner in the file. Tell me when it is done." and wait;
   - `version` bumped if the content changed since the last publication (breaking change = major, API-02);
   - `last-validated` is today;
   - `consumes` pins the **current** version of every artefact read (run `npm run context` to check).
3. To publish a Spec Kit spec: copy `specs/<feature>/spec.md` to `../context-nexus/teams/<squad>/intent/specs/<squad>-001.md` and prepend the frontmatter from `../context-nexus/templates/spec-frontmatter.md`, with today's date and current pins. Remove the body's `**Status**: Draft` line: the frontmatter is the only status. Ask who the owner is. Also copy the rest of `specs/<feature>/` (plan, tasks, data model) to `../context-nexus/teams/<squad>/intent/specs/<feature>/`, so a teammate who takes the keyboard in another Codespace can continue from it.
4. If the squad also changed its contract, publish the contract first, then re-pin the spec on the new version: the other way round, the spec arrives stale.
5. Run `npm run publish -- -m "<short message: what and which version>"` with **one** `-m` and no attribution line, and report the result in one line.
