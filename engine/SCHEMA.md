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
  "voices": ["Andrew", "Ryan"],            // preferred voices for guidance, best first (the person can change it)
  "freedom": "…",                           // optional: replaces the default "you can change any of this" line on the threshold
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
| `name` | short label shown in the look-back list (e.g. "Cat stretch"); give every step one |
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
| `breath` | animated orb paces the breath for N cycles | `pattern`: `sigh` `resonance` `extended` `box` `4-7-8` `awaken` `hum`, or `[{kind:"in"/"out"/"hold", seconds, label, to, figure}]` (with figures, the figure replaces the orb); `cycles`; `ready`; `after` |
| `guided` | timed cues, one at a time, with progress and a pause button | `cues: [{text, seconds, figure, beat}]`, `figure` (starting pose), `ready`, `after`, `bell: false`, `preview: false` |
| `sit` | silent timed sit with a bell at each end | `seconds`, `anchor`, `after`, `showTime: false`, `figure` (a still pose, e.g. `"sit"`) |
| `write` | free writing | `prompt`, `sub`, `placeholder`, `rows`, `seconds` (gentle flow timer), `private: true` (never leaves the device) |
| `choose` | single or multiple choice | `prompt`, `options: [{label, value, hint}]` or strings, `multi`, `allowOther` |
| `words` | pick words from chips, or add your own | `prompt`, `words: []`, `max`, `allowOwn: false` |
| `scale` | 0–10 slider | `prompt`, `low`, `high`, `min`, `max`, `measure: "before" / "after"` |
| `body` | tap where something lives in the body | `prompt`, `sub` |
| `release` | write something, then watch it dissolve. Not saved unless `keep: true` | `prompt`, `placeholder`, `release` (button label), `after: [lines]` |
| `companion` | live Claude responds to what they've written, with an offline fallback | `instruction`, `fallback` (required), `include: [stepIds]`, `turns` (allow back-and-forth), `maxWords`, `tier` (`quick`/`default`/`complex`) |
| `teaching` | a short teaching at the right moment: the idea, a few lines, optional distinctions ("not this, but this"), and its source. Narrated | `title`, `lines`, `distinctions: [{not, is}]`, `source`, `eyebrow` |
| `card` | closing card to keep: anchor, pocket practice, next step, before→after, lineage. Copy and save | `title`, `anchor`, `lines`, `practice: {name, lines}`, `next`, `eyebrow` |

After the card the engine adds two screens of its own: **for tomorrow**, an optional list of the
steps the person went through, where they mark what *helped most* and what *could be better* (tap a
name to see the step again, add a note), and a short **closing** that ends on their anchor. Set
`"feedback": false` at the top level to leave them out.

## The figure: showing movements

Any movement should be shown, not only described. Steps with poses get a simple animated figure
that demonstrates them in time with the cues (`engine/figure.js`, poses in `engine/poses.json`).

- On a `guided` cue: `"figure": "reach-up"` moves to that pose at the start of the cue (over `beat`
  seconds, default 1.6); `"figure": ["cat", "cow"]` loops between poses (`beat` per move, default 2.2).
- On a custom `breath` phase: `"figure": "bj-up"` moves to the pose over the length of the phase.
- Before the person presses Begin, the figure previews the whole sequence on a slow loop.
- Front-facing poses are mirror images, like an instructor facing a class: cue "right arm over to
  the left" with `bend-left`.

Poses: `stand` `stand-3q` `stand-side` `soft-knees` `reach-up` `yawn` `curl` `arms-wide` `bend-left`
`bend-right` `heart` `belly` `open-chest` `nod` `shake-a` `shake-b` `sway-left` `sway-right` `dance-up`
`dance-low` `cat` `cow` `fold` `bj-forward` `bj-wide` `bj-up` `sit`. To add one, edit `poses.json` and
check it with `node tools/poses.mjs` (writes a contact sheet to `engine/preview/poses.png`).

## Voice: recorded narration

Browser voices vary wildly (an iPhone offers novelty voices such as "Cellos"; Microsoft's natural
voices exist only in Edge). So the guidance can be **recorded at build time** and shipped with the
page, sounding the same everywhere:

1. `node tools/narration.mjs lines <dir> --voice "<name>"` writes `narration.json`: every line the page
   speaks (text lines, guided cues and closing lines, sit anchors, breath phrases), each with a key.
2. Each line is synthesized once (Claude uses Higgsfield text-to-speech) and fetched with
   `node tools/narration.mjs fetch <dir> <results.json>` into `<dir>/audio/<key>.mp3`.
3. `tools/build.mjs` embeds the keys that have clips (`X.narration`) and writes `publish-files.json`,
   the files to publish beside the page.

Lines are spoken as whole sentences: a `poem` is spoken a stanza at a time, the text sent to the
speech engine is capitalized and properly ended, and a guided cue lasts until its spoken line has
finished. With narration, voice guidance is on by default, text steps wait for each spoken line, and lines
without a clip (echoes of what the person wrote, live companion replies) stay silent rather than
switching to a device voice. Without narration, the page falls back to the best device voice and
never picks a novelty voice.

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
measure: {before, after}, path: [stepIds], answers: {stepId: {type, prompt, value, label?}},
feedback: {stepId: {name, reaction: "helped" | "okay" | "not", note}, _overall: {note}}}`.
Companion answers also record `live` and the model `tier` that answered.

**Look back.** The closing card offers "Look back at the steps": every step they went through,
which they can tap to see again and mark *helped / okay / didn't help*, with an optional note.
That feedback is saved with the run, and Claude reads it during integration.
`private` steps and released text are never saved. Elsewhere, progress lives in the browser only.
