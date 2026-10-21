# The Atlas: practices and how to render them

Practices are the building blocks. Each entry gives: **lineage** · **fits** (states or movements) ·
**time** · **engine** (step types; see `engine/SCHEMA.md`) · how to do it well · care.

They're grouped by where they usually sit in the arc (see `arcs.md`), but most can move.
Adapt every one of them to the person. Use their words, their situation, their images.

Practices marked **routine `name`** are ready-made and checked frame by frame in
`library/routines.json`: start a step from one with `"routine": "name"` instead of writing cues and
poses from scratch, then personalize it (see `engine/SCHEMA.md`, Routines).

---

## Arrive: crossing the threshold

- **Mirror**: Carl Rogers; Motivational Interviewing · all · 0.5 min · `text`
  Open by reflecting their own phrases back ("Too many tabs open. That's where we start.").
  Feeling accurately heard is regulating by itself. Use their words, not a summary of them.
- **Inner weather**: Clean Language; metaphor work · all · 1 min · `choose` / `words` / `write`
  "If today had weather inside, what would it be?" Gives a shared image for the whole session and
  often becomes the throughline.
- **Scale in**: solution-focused scaling · all · 0.3 min · `scale` with `measure: "before"`
  One question matched to the movement (calm, room, clarity, kindness toward yourself, energy).
  Always pair it with the same question at the end.
- **Intention**: many traditions · all · 1 min · `write` or `choose`
  "What would make these minutes worth it?" Keep it optional; some people don't know yet.

## Settle: regulating so anything else can land

- **Cyclic sighing**: Balban, Huberman et al. 2023 · activated, mixed · 1–3 min · `breath` pattern `sigh`
  Double inhale through the nose, long exhale through the mouth. The fastest reliable downshift.
- **Resonance breathing**: Lehrer, HRV research · activated, open · 2–5 min · `breath` pattern `resonance`
  ~5.5 breaths per minute, smooth and even. Good before inquiry.
- **Extended exhale**: many · activated · 1–3 min · `breath` pattern `extended`
- **Box breathing**: military and clinical use · activated, needing focus · 2 min · `breath` pattern `box`
  Care: the holds can feel activating for anxious people; offer `extended` instead.
- **Humming / "voo"**: Peter Levine; vagal-tone research · activated or shut down · 1–2 min · `breath` pattern `hum`
  Long exhale with a low hum felt in the chest and belly. Only when they can make sound.
- **Orienting**: Peter Levine · all, especially shut down · 1 min · `guided`
  Eyes open; let the eyes wander; land on something pleasant; notice the body's response.
- **5-4-3-2-1 grounding**: CBT/DBT · activated, dissociated · 2 min · `guided` (or `write`)
- **Self-holding**: Peter Levine · activated, tender · 1–2 min · `guided` · routine `self-holding`
  One hand on the heart, one on the forehead (or belly); stay until something shifts.
- **Butterfly hug**: Lucina Artigas, EMDR · activated, tender · 1 min · `guided`
- **Shake it out**: TRE; qigong · mixed, restless · 1 min · `guided` with short cues · routine `shake-out`
  Needs a space where they can move; give a seated option (shake hands, bounce knees).
- **Arriving in your seat**: Zen and Insight posture teaching · before a sit, inquiry or writing · 1 min · routine `seated-arrival`
- **Let the neck go**: somatic movement; physical therapy · screen tension, jaw, shoulders · 1 min · routine `neck-release`
- **Pendulation**: Peter Levine · after a hard feeling · 2 min · `body` + `guided`
  Find a place that feels okay (even neutral), then the hard place, then back. Let them sway between the two.
- **Soothing touch**: MSC · tender, self-critical · 1 min · `guided`
- **NSDR / brief yoga nidra**: Satyananda; Huberman's NSDR · depleted, evening · 6–15 min · `guided`
  Care: in a shut-down state, keep it short and eyes-open optional.

## Wake and enliven: raising energy through the body

- **Cat stretch (pandiculation)**: Thomas Hanna's somatics · morning stiffness, flat, tight · 2–3 min · `guided` with figures · routine `cat-stretch`
  Tighten a little, lengthen slowly all the way out, let go completely. Poses: `curl` → `reach-up` →
  `yawn` → `stand`, side bends `bend-left` / `bend-right`, then `cat` / `cow` with knees soft and
  hands on thighs. Inherently pleasurable: "a cat doesn't stretch to be productive".
- **Breath of Joy**: Kripalu yoga · flat, low energy, morning · 1 min · `breath` with a custom pattern and figures · routine `breath-of-joy`
  Three sips of air with the arms (`bj-forward`, `bj-wide`, `bj-up`), then "ha!" swinging down
  (`fold`), rising (`soft-knees`). Care: slow down if light-headed; keep the fold small with high
  blood pressure or after head injury.
- **Shake it out**: TRE; qigong · restless, mixed · 1 min · `guided`, cue figure `["shake-a", "shake-b"]` with `beat: 0.4` · routine `shake-out`
- **One-song dance**: Gabrielle Roth's 5Rhythms; Stuart Brown on play · Enliven, Savor · 3–4 min · `guided` with `quiet: true` · routine `one-song-dance`
  A song they love, or one they sing or hum. Cues build from one body part to the whole body.
  Figure loops `["sway-left", "sway-right"]`, then `["dance-low", "dance-up"]`. A natural peak.
- **Side stretch**: hatha yoga · tight ribs, shallow breath, long sitting · 1 min · routine `side-stretch`
- **Cat and cow, standing**: hatha yoga · stiff back, busy mind · 1–2 min · routine `cat-cow-standing`
- **Roll down, roll up**: Pilates; somatic movement · back and neck, a reset, slowing down · 1–2 min · routine `roll-down`
  Care: skip or go halfway with high blood pressure, glaucoma or dizziness.
- **Big arm circles**: qigong and movement warm-ups · cold shoulders, low energy · 1 min · routine `arm-circles`
- **March in place**: cross-body warm-ups · flat, sluggish, numb · 1 min · routine `march`
- **Sit, stand, repeat**: functional strength · heavy body, wanting to feel strong · 1–2 min · routine `sit-to-stand`
  Needs a sturdy chair; any depth counts.

## Meet: turning toward what's here

- **Body map**: somatic therapies · all · 0.5 min · `body`
  "Where do you feel it?" A precise, embodied anchor for later steps (`{{where}}`).
- **Feelings & needs**: NVC · confusion, conflict · 1 min · `words` (feelings, then needs)
- **Clearing a space**: Gendlin's Focusing · overwhelm, many concerns · 3 min · `write` (list) → `guided`
  Name each concern and imagine setting it down at a comfortable distance. Then ask how you are
  with all of it set aside.
- **Felt sense & handle**: Focusing · vague unease, mixed feelings · 3–5 min · `guided` + `write` + `companion`
  Attend to the whole feel of the situation in the body; let a word or image come that fits; check
  it against the body ("does 'tight knot' fit?").
- **Keeping company**: Ann Weiser Cornell · after a felt sense · 2 min · `companion` or `text`
  "Something in you feels… You can just say hello to it."
- **RAIN**: Tara Brach · strong emotion · 5–8 min · `guided` + `write`
  Recognize, Allow, Investigate (with kindness, in the body), Nurture (what does this part need?).
- **Meet a part**: IFS · inner conflict, critic, avoidance · 5–8 min · `write` + `choose` + `companion`
  Notice the part; "how do you feel toward it?" (if not curious or open, ask the reacting part to
  step back); ask what it's afraid would happen if it stopped; thank it for its job.
- **The Guest House**: Rumi (paraphrase or public-domain translation) · strong feelings · 2 min · `text` + `write`
  "This feeling is a guest. What might it have come to tell you?"
- **Expressive writing**: James Pennebaker · something unsaid, rumination · 5–8 min · `write` with `seconds`
  Deepest thoughts and feelings, without stopping or editing. Mark `private: true` when it's very personal.
- **Unsent letter**: Gestalt; narrative · unfinished business · 5 min · `write` (often `private`)

## Turn: the shift

The turn is the heart of the experience: a moment designed to change the person's *relationship*
to what's here. Pick one well-made turn rather than several half-made ones.

- **Self-compassion break**: Kristin Neff · self-criticism, failure · 3 min · `guided` + `write`
  "This is a moment of difficulty. Difficulty is part of being human. May I be kind to myself."
  Then: "What do you need to hear right now?"
- **Letter from a compassionate friend**: MSC; CFT · shame, harshness · 5 min · `write` + `companion`
  Write to yourself from someone who loves you unconditionally, or let the companion write it
  using their words. Best when the person writes first.
- **The Work**: Byron Katie · a specific painful belief · 6–8 min · `write` sequence + `choose`
  Is it true? Can you absolutely know it's true? How do you react when you believe it? Who would you
  be without it? Then turnarounds, each with three real examples.
- **Defusion**: ACT · rumination, harsh self-talk · 2 min · `write` → `text` → `release`
  Write the thought; read it back as "I'm having the thought that…"; let it float off.
- **Choice point**: Russ Harris · stuck between avoidance and values · 4 min · `words` (values) + `write`
  "Toward or away?" What would a step toward look like in the next 24 hours?
- **Dichotomy of control**: Epictetus · overwhelm by circumstance · 4 min · `write` ×2 + `text`
  What's mine to tend, and what isn't? Then: set down what isn't.
- **View from above**: Marcus Aurelius; Hadot · smallness, catastrophizing · 3 min · `guided`
  Rise slowly above the room, the city, the country, the planet. See the situation in proportion.
  Return carrying the perspective, not the detachment.
- **Externalize the problem**: Michael White · identity stories · 5 min · `write` + `companion`
  Name it ("the Rush"); what are its tactics? When did you outwit it, even once?
- **Miracle question**: de Shazer & Berg · stuck, problem-saturated · 4 min · `write`
  "Tonight, while you sleep, this is resolved. What's the first small thing you'd notice tomorrow?"
- **Exceptions**: solution-focused · "always/never" stories · 2 min · `write`
- **Hakomi probe**: Ron Kurtz · beliefs held in the body · 2 min · `text` (pause) → `choose`
  Settle; then offer one sentence ("You don't have to earn rest.") and ask what happened inside:
  something softened · tears came · something tightened · a thought argued · nothing much (+ `allowOther`).
  Whatever happened is welcome, and the next step responds to it (use `when`). Expect strong responses
  when the sentence names the person's growing edge exactly: a permission probe once brought sobbing, then
  relief and clarity. Always follow a probe with presence (a companion step) before moving on.
- **Juxtaposition**: Bruce Ecker · "I know better but…" · 5 min · `write` + `guided`
  State the hidden belief plainly, then hold it beside a vivid memory that contradicts it.
- **Two-chair dialogue (in writing)**: Gestalt; EFT · inner conflict · 6 min · `write` ×3 + `companion`
  The critic speaks; the one being criticized answers; the critic responds to that.
- **Active imagination**: Jung · something without words yet · 5 min · `guided` + `write`
  Let an image come. Ask it what it wants. Write its answer without censoring.
- **Future self**: Hal Hershfield; narrative · direction, decisions · 5 min · `write` + `companion`
  A letter from yourself ten years on, who got through this.
- **Best possible self**: Laura King · hope, direction · 5 min · `write` with `seconds`
- **"What does this moment ask of me?"**: Viktor Frankl · meaning, suffering · 3 min · `write`
- **Where are you pushing the river?**: Lao Tzu · striving, exhaustion · 3 min · `text` + `write`
- **Awe moment**: Dacher Keltner · rumination, smallness · 2 min · `guided` (night sky sky-state helps)
- **Narrate it like a nature documentary**: improv; narrative distance · stuck, self-serious · 3 min · `write` + `companion`
  "Here we observe the human in her natural habitat, refreshing her inbox for the eleventh time…"
  Playful distance loosens identification fast. Use only when there's enough safety.
- **Honoring pain**: Joanna Macy · grief for the world, burnout from caring · 4 min · `write` + `text`
- **Release ritual**: ritual practice; narrative therapy · letting go · 2 min · `release`
  Write it; watch it dissolve. Follow with what remains (`after` lines).

## Integrate: letting it land

- **Taking in the good**: Rick Hanson (HEAL) · after any shift · 1–2 min · `guided`
  Notice what's better; let it fill the body for 10–20 seconds; imagine it sinking in.
- **Anchor phrase**: Ericksonian; contemplative · all · 1 min · `choose` or `write`
  A sentence to carry, ideally in their words. It becomes the card's `anchor`.
- **Symbol**: Jung; expressive arts · all · 1 min · `choose`
  An object or image to stand for the shift (a stone, an open window, a lit lamp).
- **Embodied posture**: somatic · after a Reclaim or Nourish turn · 1 min · `guided`
  "Let your body find the posture of this. Notice your spine, your hands, your face."
- **Savoring**: Fred Bryant · Savor movement · 2 min · `guided`

## Return: carrying it home

- **Tiny step**: BJ Fogg · all · 1 min · `write`
  "After I [existing routine], I will [tiny behavior]." Small enough to do on a hard day.
- **WOOP**: Gabriele Oettingen · goals, decisions · 4 min · `write` ×4
- **Pocket practice**: · all · in the card
  A practice of 60 seconds or less that they can repeat without the page.
- **Scale out**: · all · `scale` with `measure: "after"` (the same question as the start)
- **Closing words**: John O'Donohue's blessing tradition · all · `text` or in the card
  Original, specific to them, short. Not a poem about "the journey".
