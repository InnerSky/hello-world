# Craft: the quality standard

The difference between a forgettable wellness exercise and a transformative experience is mostly
**specificity, pacing and voice**. This is the standard every experience is checked against
before it ships.

## Voice

- **Second person, present tense, plain words.** "Notice your breath," not "We will now focus on breathing."
- **Invitational, not instructional.** "You might notice…", "If it feels right…", "See whether…".
  Permission is built in: everything can be skipped, and the text says so when it matters.
- **Short lines with white space.** One idea per line. Let silence do work.
- **Sensory and concrete.** "The weight of your hands in your lap" beats "relax your body".
- **Their words, not yours.** Echo what they said in intake (write it into the lines) and what
  they write during the experience (`{{stepId}}`). Their phrasing is more powerful than any you invent.
- **Warm, not sweet. Wise, not preachy.** Talk like a trusted friend who happens to know a lot.
- **Honest.** Don't promise outcomes ("you will feel calm"). Offer possibilities ("you may notice…").

## Freedom and alternatives

- **The person is always free to adapt.** The threshold says so by default ("Everything here was
  made for you, and you can change any of it…"). Mean it in every step.
- **Every requirement gets an alternative.** A song to play → "or sing or hum one you know". Standing →
  "or sit tall". Making sound → "or breathe it silently". A walk outside → "or walk around the room".
  One person sang instead of playing a song, and it was still a highlight.

## Showing movement

People feel unsure when a movement is only described. Every physical step needs:
1. a starting position ("feet under your hips, knees soft"),
2. one action per cue, named with body landmarks ("right arm up and over toward the left"),
3. the quality ("slowly", "as far as is comfortable"),
4. **a figure pose on every cue** (see `engine/SCHEMA.md`), so they can see it as well as read it.

Start from a routine in `library/routines.json` whenever one fits: its cues, poses and timing have
been checked frame by frame. Personalize the words with `cueText`, not the choreography. A new
movement sequence gets checked the same way before it's used (`node tools/routines.mjs`), and a
good one goes into the library.

## Peak, end and surprise

- People remember an experience by its **peak and its end** (Kahneman's peak–end rule). Design
  one clear peak (usually the Turn) and craft the ending (the card, the last words). If those land,
  the whole session is remembered as good.
- **Don't reveal the agenda.** Not knowing what comes next is part of the pleasure. The threshold
  says how long it takes and what to have ready, not what will happen.
- Give every step a short `name` so the look-back list reads clearly.

## Teachings

A short teaching (`library/teachings.md`) gives words to what was just felt: one idea, up to four
lines, up to two distinctions, its source. Place it in a receptive moment (after a practice opens
something, or before a reflection it can light up), offer it as something to try on, and follow it
with doing or reflecting so they can test it. Paraphrase and attribute; never invent a quote.

## Avoid

- Stock wellness phrases: *journey, embrace, let go of what no longer serves you, hold space,
  sacred space, you've got this, self-care, vibes, manifest, show up for yourself, be gentle with
  yourself, everything happens for a reason, just breathe, good vibes only, healing journey,
  your best self, honor your truth*.
- Toxic positivity or spiritual bypassing: rushing past pain to a silver lining.
- Diagnosis or clinical labels ("your anxiety disorder", "trauma response") unless they used them first.
- Advice lists. If there's advice, it's one thing, embodied, chosen by them.
- Over-explaining the technique. One line of "why" is plenty, and only if it helps trust.
- Exclamation marks, emoji, ALL CAPS.
- Repeating a practice the profile says didn't land, or the same signature practice every session.

## Tests (run before shipping)

1. **Specificity test.** Read every line. Could it have been written for anyone? If so, rewrite it
   using their situation, words or images, or cut it.
2. **Practitioner test.** Would Gendlin, Brach, Levine, Neff, Katie or Frankl (whoever's
   lineage you used) recognize it as faithful and well done?
3. **Arc test.** Is there a real Turn, a moment designed to change something, rather than only
   reflection? Does it end lighter, with agency?
4. **Pacing test.** Read it aloud at the speed it will be experienced. Where is it rushed? Where does it drag?
5. **Throughline test.** Name the single image that holds it together. Does every movement relate to it?
6. **Surprise test.** Where's the moment they wouldn't have predicted?
7. **Safety test.** Is the window of tolerance respected? Regulation before depth? Resources after
   difficulty? Do the care notes from the Reading hold? (See `safety.md`.)
8. **Fallback test.** Read each `companion` fallback as if Claude weren't available. Is it
   still good? It should be written as carefully as the rest.
9. **Time test.** Does the build estimate match what they asked for? Leave slack: real sessions
   run longer than the estimate when something deep happens.
10. **Movement test.** Does every physical cue have a starting position, a clear action and a figure?
    Is there an alternative for every requirement (music, standing, sound, space)? Is each
    sequence a checked routine, or checked frame by frame now?
11. **Transformation test.** Is there a being objective, and at least one moment where the person
    discovers something for themselves rather than being told it? Is every block of experience
    followed by a moment to reflect? Does it end with new meaning in their own words?

## Writing the companion instructions

The companion is live Claude, inside the page, responding to what they've written.
- Give it **one clear job** per step: reflect, keep company, ask one question, write a letter in a
  particular voice, offer a reframe in a particular lineage.
- Give it a **voice and lens** in the experience's `companion.voice` (e.g. "unhurried, precise,
  in the spirit of Ann Weiser Cornell's presence language").
- Put the essentials in `context`: the intake in brief, what matters to them and what to avoid.
- Keep `maxWords` small (60–140). Brevity reads as presence.
- Write the `fallback` as a fully crafted response using `{{templates}}`, so the step works offline.

## Visual and sound choices

- **Skies** carry the emotional arc. Match the time of day they'll do it, and move gradually
  (overcast → after-rain → clearing). Dark skies (dusk, night, moonlit, ember, deep) suit evening
  and inward work. Light skies (mist, clearing, clear, golden, first-light) suit daytime and outward movement.
- **Sound** is a soft drone and moving air, with a bell at each movement and at the start and end of
  practices. Set `sound.root` lower (around 73–87 Hz) for grounding, higher (110–130 Hz) for brightness.

## Copyright

Write original language. For poems, write original verse or use public-domain texts. Quote modern
poets in a short attributed line at most. Credit practice lineages in `lineage`, with the
practitioner's name and the tradition.
