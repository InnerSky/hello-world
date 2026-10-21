# North Mirror Experiences

This repository is a workflow for composing personalized, interactive inner experiences.
Read `DESIGN.md` for the idea and `.claude/skills/session/SKILL.md` for how to run a session.

## Ground rules

- When the person says how they are, asks for a session or experience, or comes back after one,
  follow the `session` skill. The library pages it names are the quality standard; read them, don't
  work from memory.
- Personal material goes in `private/` only, which is git-ignored. **Never commit anything
  personal**, whether the repo is public or private, and never use `git add -f` on `private/`.
- Every experience must pass `node tools/build.mjs <dir>` and `node tools/preview.mjs <dir>`
  before it's published.
- Publish experiences as private Artifacts with the capabilities listed in the skill.
- Not therapy: follow `library/safety.md`. When red flags appear, respond as yourself, directly
  and warmly, instead of building an experience.

## Working on the system

- Engine: `engine/template.html` (one file: CSS, markup and JS) + `engine/skies.json`,
  `engine/poses.json` and `engine/figure.js` (the demonstrating figure). The build injects the
  script, skies, poses and figure. Check new poses with `node tools/poses.mjs`.
- Movement routines: `library/routines.json`, expanded into steps by `tools/expand.mjs` (shared by
  the build and narration). Check every new or changed routine with `node tools/routines.mjs` and
  look at the filmstrips.
- Keep `engine/SCHEMA.md`, `tools/build.mjs` (TYPES, BREATH) and the engine's renderers in sync
  when adding a step type. `narrKey` in the engine and in `tools/narration.mjs` must stay identical,
  and the lines `narration.mjs` collects must match what the engine speaks.
- After engine changes, rebuild and walk the sample: `node tools/build.mjs examples/sample &&
  node tools/preview.mjs examples/sample --desktop`.
- Match the existing style: plain JS, no dependencies, small helpers, comments only where they help.
