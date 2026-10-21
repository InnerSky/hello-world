# Experience script format

An experience is one JSON file, `experience.json`. `tools/build.mjs` validates it and pours it into
`engine/template.html` to produce a single page, `experience.html`, which is published as an
Artifact. See `examples/sample/experience.json` for a complete working example.

## Top level

```jsonc
{
  "id": "2026-10-21-after-the-rain",      // unique; letters, digits, . _ ~ -  (also the save key)
  "title": "After the Rain",              // 2–4 word name: the page title and the threshold heading
  "subtitle": "a passage for a crowded Tuesday",   // small line above the title
  "intention": "To set things down and find what matters underneath.",
  "duration": 20,                          // minutes, shown on the threshold
  "prep": ["somewhere you won't be interrupted", "headphones if you have them"],
  "lang": "en",                            // for voice guidance
  "context": "Brief private summary of the intake, for the companion.",
  "companion": { "voice": "Unhurried and precise, in the spirit of …" },
  "measure": { "label": "How much room there is inside", "low": "crammed", "high": "spacious" },
  "sound": { "root": 98, "bell": 392, "default": "on" },   // drone pitch (Hz), bell pitch, on/off
  "vars": { "name": "Sam" },               // compose-time values usable as {{name}}
  "movements": [ { "id": "arrive", "name": "Arrive", "sky": "overcast" }, … ],
  "steps": [ … ],
  "lineage": [ { "name": "Cyclic sighing", "source": "Balban, Huberman et al., 2023" }, … ]
}
```

**Skies** (`engine/skies.json`). Dark text: `mist`, `overcast`, `after-rain`, `clearing`, `clear`,
`golden`, `first-light`. Light text: `storm`, `dawn`, `dusk`, `canopy`, `ember`, `moonlit`, `night`, `deep`.

## Text in steps

- Any text field may echo earlier answers: `{{stepId}}`, or `{{stepId|fallback words}}` when empty.
  Echoes show in italics in the sky's accent color. Choices echo their labels and lists read naturally
  ("a, b and c").
- `_italic_` and `**bold**` work inside text.
- In `lines`, an empty string `""` makes a stanza break (useful with `style: "poem"`).

## Fields every step can have

| Field | Meaning |
|---|---|
| `id` | unique, required |
| `type` | one of the types below, required |
| `movement` | the movement this step starts (later steps inherit it) |
| `sky` | override the movement's sky for this step |
| `when` | show only if a condition holds (see Branching) |
| `title` / `prompt` / `sub` / `lines` | heading, question, small line under it, short lines above the control |
| `cta` | label of the Continue button |
| `quiet` | `true` fades out the ambient drone for this step (bells still ring), e.g. while they play their own music |

## Step types

| type | what it does | key fields |
|---|---|---|
| `threshold` | opening screen: title, lines, length, sound/voice toggles, Begin | `lines`, `eyebrow`, `cta` |
| `text` | lines that appear one by one; tap to show all | `lines`, `style` (`poem` / `large` / `small`, combinable: `"poem large"`), `pace` (sec between lines), `hold` (sec before Continue), `attribution`, `voice: true` |
| `breath` | animated orb paces the breath for N cycles | `pattern`: `sigh` `resonance` `extended` `box` `4-7-8` `awaken` `hum`, or `[{kind:"in"/"out"/"hold", seconds, label, to}]`; `cycles`; `ready`; `after` |
| `guided` | timed cues, one at a time, with progress and a pause button | `cues: [{text, seconds}]`, `ready`, `after`, `bell: false` |
| `sit` | silent timed sit with a bell at each end | `seconds`, `anchor`, `after`, `showTime: false` |
| `write` | free writing | `prompt`, `sub`, `placeholder`, `rows`, `seconds` (gentle flow timer), `private: true` (never leaves the device) |
| `choose` | single or multiple choice | `prompt`, `options: [{label, value, hint}]` or strings, `multi`, `allowOther` |
| `words` | pick words from chips, or add your own | `prompt`, `words: []`, `max`, `allowOwn: false` |
| `scale` | 0–10 slider | `prompt`, `low`, `high`, `min`, `max`, `measure: "before" / "after"` |
| `body` | tap where something lives in the body | `prompt`, `sub` |
| `release` | write something, then watch it dissolve. Not saved unless `keep: true` | `prompt`, `placeholder`, `release` (button label), `after: [lines]` |
| `companion` | live Claude responds to what they've written, with an offline fallback | `instruction`, `fallback` (required), `include: [stepIds]`, `turns` (allow back-and-forth), `maxWords`, `tier` (`quick`/`default`/`complex`) |
| `card` | closing card to keep: anchor, pocket practice, next step, before→after, lineage. Copy and save | `title`, `anchor`, `lines`, `practice: {name, lines}`, `next`, `eyebrow` |

## Branching

`when` hides a step unless its condition holds (several conditions in an array must all hold):

```json
{ "when": { "step": "what", "is": "feeling" } }
{ "when": { "step": "what", "is": ["thought", "decision"] } }
{ "when": { "step": "probe", "not": "nothing" } }
{ "when": { "step": "before", "gte": 7 } }
{ "when": { "step": "letter", "answered": true } }
```

`is` and `not` match a choice's `value` (or any of several values for multi-select and word lists).

## What gets saved

When the page runs on claude.ai, each run is saved to the artifact's private database as
`runs/<runId>`, readable only by the owner: `{experience, title, startedAt, updatedAt, completed,
measure: {before, after}, path: [stepIds], answers: {stepId: {type, prompt, value, label?}}}`.
`private` steps and released text are never saved. Elsewhere, progress lives in the browser only.
