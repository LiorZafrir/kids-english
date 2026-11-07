# Wordlands (kids-english)

A gamified, offline-capable English-learning PWA for Hebrew-speaking children (kindergarten, grade 2, grade 4). Hebrew RTL UI, English content always LTR. See [PLAN.md](PLAN.md) for architecture and phases.

**Status: all 8 phases built.** Still to do by hand: connect Firebase, push to GitHub, record audio (see "Left for you" below).

## What's inside

- **Two worlds:** Arena (Grades 2 and 4: lessons, battles with the Word Penalty, story, cards) and Magic Garden (kindergarten: pictures and audio only, nothing to read).
- **Phonics:** Units 1 and 2 (s a t p i n, k e h r m d) as data in `src/content/phonics/`. A test checks every word is decodable from sounds already taught.
- **Learning engine:** Leitner spaced repetition (`src/core/srs`), daily review, placement quiz for readers, adaptive number of wrong options (`src/core/progress/adaptive.ts`).
- **Rewards:** stars, collectible cards, companion that grows (egg, baby, kid, hero), shop with wearable items, streaks, seasonal events (`src/core/progress/events.ts`), a shared weekly family goal.
- **Parent area:** PIN, per-child stats, weak sounds, daily time limit, family settings.
- **PWA:** installable and works offline (service worker via vite-plugin-pwa). Icons are generated with `npm run icons`.

## Left for you

1. Firebase: create a new project and paste the config (see below). Until then everything is saved on the device only.
2. GitHub: create the `kids-english` repo, push, add the Firebase values as repo secrets, enable Pages.
3. Audio: record the sounds listed in `docs/RECORDING_LIST.md` (optional; text-to-speech is the fallback).
4. Review the Hebrew in `src/core/i18n/he.ts`, the card names in `src/content/cards.ts` and the story in `src/content/story.ts`.


## Run

```bash
npm install
npm run dev        # http://localhost:5173/kids-english/
npm test           # unit tests
npm run lint && npm run typecheck
npm run build
```

Without Firebase env vars the app runs in **local-only mode** (data in this browser's localStorage).

## Firebase (when ready)

1. Create a Firebase project; enable **Authentication → Email/Password** and **Firestore**.
2. Add a Web app; copy its config into `.env.local` (see `.env.example`). Never commit `.env.local`.
3. Deploy rules: `firebase deploy --only firestore:rules` (uses [firestore.rules](firestore.rules)).
4. In Authentication → Settings → Authorized domains add `liorzafrir.github.io` (and `localhost` is already allowed).

One shared family account signs in; children pick a profile without a password. The parent PIN is a client-side gate (PBKDF2-hashed), not server-enforced security.

## Deploy (GitHub Pages)

Repo: `LiorZafrir/kids-english`. Settings → Pages → Source: **GitHub Actions**. Add the six `VITE_FIREBASE_*` values as repository secrets. Pushing to `main` runs lint, typecheck, tests, build and deploy ([workflow](.github/workflows/deploy.yml)). The router is hash-based so deep links work on Pages.

## Where things live

| What                                                  | Where                                          |
| ----------------------------------------------------- | ---------------------------------------------- |
| App/product names (Wordlands, Puffbloom, world names) | `src/config/app.ts` – rename here only         |
| Hebrew UI strings                                     | `src/core/i18n/he.ts`                          |
| Design tokens + world themes + high contrast          | `src/styles/tokens.css`                        |
| Persistence (local or Firebase)                       | `src/core/repo/`, `src/core/firebase/`         |
| Lesson content (data only)                            | `src/content/`                                 |
| Profiles, parent PIN                                  | `src/features/profiles`, `src/features/parent` |

Rules: wrap English text in `<Ltr>`; use only semantic CSS tokens; touch targets ≥ 48px; every icon-only button needs a label.

## Recorded audio (optional, no code changes)

Anything not recorded falls back to text-to-speech. Drop MP3s here, then run `npm run audio:list`:

- `public/audio/phonemes/<id>.mp3` – one per sound in `src/content/phonemes.json`
- `public/audio/letters/<a-z>.mp3` – letter names
- `public/audio/words/<wordId>.mp3` – words/sentences (later phases)

`npm run audio:list` rewrites `src/content/audio-manifest.json` and **[docs/RECORDING_LIST.md](docs/RECORDING_LIST.md)**, the checklist of every file still to record (41 sounds + 26 letter names), with pronunciation notes.

## Adding things (grows with each phase)

- **New names/worlds:** `src/config/app.ts`.
- **New sounds:** add an entry to `src/content/phonemes.json`, run `npm run audio:list`.
- Lessons, characters, shop items: documented as those phases land.
