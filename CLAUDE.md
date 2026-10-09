# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Arkanoid/Breakout clone built with plain HTML, CSS and JavaScript — **zero dependencies, no build step, no bundler**. Nothing is implemented yet: the repo currently only has the sprite/sound assets and the spec-driven workflow scaffolding described below. There is no `index.html`, no game loop, and no package.json.

This directory is **not yet a git repository**. `/spec-impl` (see below) requires git to create branches, so `git init` will be needed before implementation work starts.

## Development workflow: spec-driven

This repo works through two custom slash-command skills imported from `Klerith/fernando-skills` (tracked in `skills-lock.json`, symlinked from `.claude/skills/*` into `.agents/skills/*`):

- **`/spec <description>`** — turns a feature idea into a written spec under `specs/NN-slug.md` through a clarifying-questions phase. Never writes code. Produces a spec in `Draft` state.
- **`/spec-impl <NN-slug>`** — implements a spec whose state is `Approved`. Creates/switches to a git branch `spec-NN-slug`, then implements the plan step by step, pausing for review after each step. Refuses to run on anything not marked `Approved`.

Practical implications when working in this repo:
- Don't write game code directly unless the user explicitly asks for something outside the spec flow — check whether a relevant spec exists in `specs/` first.
- A spec only becomes implementable once a human flips its state to `Approved`; Claude must not do that itself.
- Full behavior/phases are documented in `.agents/skills/spec/SKILL.md` and `.agents/skills/spec-impl/SKILL.md` — read those before driving either command.
- Branch auto-creation for `/spec-impl` is controlled by `specs/.spec-config.yml` (`AutoCreateBranch`, defaults to `true`), seeded by `/spec` the first time a spec is saved.

## Assets

- `assets/spritesheet-breakout.png` — the single sprite sheet image for all game graphics.
- `assets/spritesheet.js` — plain-JS helper for the sprite sheet: `SPRITES` maps names (`paddle`, `ball`, `blocks.<color>`) to `{sx, sy, sw, sh}` rects; `EXPLOSION_FRAMES` holds per-color 4-frame explosion animations. Call `loadSpritesheet(cb)` once before drawing; `drawSprite(ctx, name, x, y, w, h)` and `drawFrame(ctx, frame, x, y, w, h)` blit onto a canvas context. Block sprite names are looked up via the `block_<color>` convention (e.g. `block_red` → `SPRITES.blocks.red`).
- `assets/sounds/ball-bounce.mp3`, `assets/sounds/break-sound.mp3` — sound effects for ball/paddle and block-break events.

Any future game code should load the spritesheet via this existing module rather than re-implementing sprite lookup.
