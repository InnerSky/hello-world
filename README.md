# Inner Sky

A workflow for creating personalized, transformative experiences through a simple digital interface.

You say how you are today: in your body, your mood, your mind, what's going on and what you think
you need. Claude listens, reads what the moment calls for, draws on many traditions (somatic
practice, Focusing, IFS, ACT, Stoicism, contemplative traditions, narrative therapy, positive
psychology, coaching, poetry, play), and composes an interactive experience made for you
right now. You go through it on your phone or computer. Afterwards, Claude reads what you
reflected and the system learns what helps you.

## How to use it

Start a conversation with Claude in this repository and say how you are, or type `/session`.

That's it. Claude will:
1. ask a few questions,
2. tell you briefly what it's sensing and what it'll make,
3. build the experience and give you a link,
4. and when you come back and say how it went, read your reflections and integrate them.

## What's here

- [`DESIGN.md`](DESIGN.md): the design, the pipeline, and why it should work
- [`library/`](library/): the knowledge Claude uses (the Compass, the Council of lenses, the
  Atlas of practices, Routines, Teachings, Arcs, Craft, Safety)
- [`engine/`](engine/): the experience player and its script format
- [`tools/`](tools/): build, preview, narration, and checks for poses and movement routines
- [`examples/sample/`](examples/sample/): a complete example experience

To try the example locally:

```bash
node tools/build.mjs examples/sample
node tools/preview.mjs examples/sample   # walks it and writes examples/sample/preview/index.html to open in a browser
```

## Privacy

This repository is public. Everything personal lives in `private/`, which git ignores. Experiences
are published as private pages on claude.ai, and your reflections are saved where only you
(and Claude, working for you) can read them.

## Not therapy

Inner Sky is a reflective practice tool. It doesn't diagnose or treat anything, and it isn't crisis
support. If you're in danger or thinking about hurting yourself, please reach a person now: in the
US call or text **988**; elsewhere see [findahelpline.com](https://findahelpline.com) or call your
local emergency number.
