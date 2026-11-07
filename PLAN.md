# PLAN.md – Kids English PWA (working title: "Wordlands")

## 0. Skills check

Skills listed and confirmed. **`ui-ux-pro-max`** is installed and loaded; it governs all UI/UX decisions (touch targets ≥48px, contrast ≥4.5:1, 4/8px spacing, 150–300ms motion with `prefers-reduced-motion`, SVG icons only – no emoji icons, semantic color tokens, light/high-contrast theme pairing, safe areas, mobile-first at 375/768/1024). In Phase 1 I'll run its `--design-system` generator once per world and persist results to `design-system/MASTER.md` + per-world overrides.

## 1. Product summary

| User              | Reading                       | World                   | Track                                                |
| ----------------- | ----------------------------- | ----------------------- | ---------------------------------------------------- |
| Grade 2           | Hebrew yes, English beginner  | Arena                   | Phonics → CVC → vocab → sight words, short sentences |
| Grade 4           | Hebrew yes, English beginner+ | Arena                   | Same spine, faster, adds reading passages, spelling  |
| Kindergarten girl | **No reading**                | Magic Garden            | Audio + pictures + tapping + songs only              |
| Parent            | –                             | PIN-protected dashboard | Progress, limits, custom words                       |

Story chapters (World 3) are shared across all profiles.

## 2. Architecture

- **Vite + React 18 + TypeScript (strict)**, React Router (HashRouter – required for GitHub Pages deep links), Zustand for client state, Firebase v10 modular SDK, `vite-plugin-pwa` (Workbox), Vitest + Testing Library, ESLint + Prettier.
- **Styling:** CSS Modules + CSS custom-property design tokens (per-world theme via `data-world` attribute). No UI framework – game-quality custom components. Framer-Motion-lite via CSS/WAAPI to keep bundle small.
- **Direction:** `<html dir="rtl" lang="he">`; every English string wrapped in `<Ltr>` (`dir="ltr" lang="en"`, `unicode-bidi: isolate`). Lint rule/test: English content never rendered outside `<Ltr>`.
- **Offline-first data:** Firestore with IndexedDB persistence; all writes go through a repository layer so the UI never touches Firebase directly (also enables a local-only/dev mode with no Firebase config).
- **Feature folders**, content strictly separated from code.

```
/
├─ PLAN.md  README.md  .env.example  firebase.json  firestore.rules
├─ .github/workflows/deploy.yml
├─ design-system/            # UI UX Pro output (MASTER.md, per-world)
├─ public/                   # icons, manifest assets, optional audio/ (recorded files)
├─ src/
│  ├─ app/                   # App shell, router, providers, error boundary
│  ├─ core/
│  │  ├─ firebase/           # init, auth, converters, repositories
│  │  ├─ audio/              # tts.ts, sfx.ts, recorded-audio resolver, speech-recognition.ts
│  │  ├─ i18n/               # he.ts strings, <Ltr/>, direction utils
│  │  ├─ srs/                # Leitner/SM-2 engine (pure, tested)
│  │  ├─ economy/            # stars, rewards, shop pricing (pure, tested)
│  │  ├─ progress/           # mastery, streaks, adaptive difficulty (pure, tested)
│  │  └─ storage/            # local cache, sync queue
│  ├─ content/               # ALL lesson data (no components)
│  │  ├─ schema.ts           # types + zod validators
│  │  ├─ words/              # themes/*.ts (colors, numbers, animals…), sightwords.ts
│  │  ├─ phonics/            # units/*.ts (unit1: s a t p i n …)
│  │  ├─ sentences/ passages/ songs/ story/ events/
│  │  ├─ characters/ shop/ cards/
│  │  └─ validate.test.ts    # build-time content QA (dupes, missing audio text, bad fields)
│  ├─ features/
│  │  ├─ profiles/  auth/  placement/  lessons/  review/
│  │  ├─ arena/  (battle, penalty, cards, league, brawlers)
│  │  ├─ garden/ (unicorn, dressup, village, activities, songs)
│  │  ├─ story/  companion/  shop/  inventory/  coop/  events/
│  │  └─ parent/ (pin, dashboard, limits, custom-words)
│  ├─ ui/                    # shared components: Button, Card, Modal, Ltr, SpeakerButton, Stars, ProgressBar…
│  ├─ art/                   # SVG components: characters, items, word pictures, icons
│  ├─ styles/                # tokens.css, themes/{arena,garden,story,contrast}.css
│  └─ main.tsx
└─ tests/
```

## 3. Data model (Firestore)

```
families/{familyId}                       # familyId = auth uid
  settings: { pinHash, pinSalt, muted, highContrast, createdAt }
families/{fid}/profiles/{pid}
  name, avatar, grade|"kg", world: "arena"|"garden", readingLevel, placementLevel,
  stars, totalStarsEarned, streak{current,best,lastDay}, dailyLimitMin, companion{stage,xp,skin},
  equipped{...}, createdAt
families/{fid}/profiles/{pid}/srs/{wordId}        # card state
  box(1-5) | ease/interval/due, reps, lapses, lastSeen, correctStreak, mastered
families/{fid}/profiles/{pid}/sessions/{sid}      # startedAt, durationSec, lessonId, accuracy, starsEarned, wordsSeen
families/{fid}/profiles/{pid}/inventory/{itemId}  # shop items, outfits, skins, room items
families/{fid}/profiles/{pid}/cards/{cardId}      # owned cards + duplicates count
families/{fid}/profiles/{pid}/league/{weekId}     # score, personalBest
families/{fid}/profiles/{pid}/storyProgress/{id}
families/{fid}/customWords/{wordId}               # parent-added words
families/{fid}/coop/{eventId}                     # shared family reward progress
```

**Security rules:** `request.auth.uid == familyId` for everything under `families/{familyId}`; field-type/size validation; `stars >= 0`; no client reads outside own family; no public collections.

**Auth honesty note:** One shared family login (email+password). Child profile switching has no password. The **parent PIN** is a client-side gate (PBKDF2-hashed, stored in the family doc) – it keeps kids out of the dashboard but is not server-enforced security. This is appropriate for a family app; stated plainly in README.

## 4. Content model (key types)

```ts
Word { id, en, he, emoji?:never, art: ArtId, sentence:{en,he}, theme, phonics?:{unit,graphemes[]},
       pos, level(1-5), audio?: path, tags[] }
PhonicsUnit { id, letters[], sounds[{grapheme, ipa, exampleWords[]}], blendWords[], sightWordsIntro[] }
Lesson { id, unit, steps: Step[] }  // Step = listenPick | tapPicture | blend | spell | match | speak | sentenceBuild | readPassage…
Character / Shop item / Card { id, rarity, art, name{en,he}, …}
```

Every word entry is validated at test time (all fields present, American spelling list, no duplicate IDs, Hebrew present, art component exists). Pictures are original SVG components keyed by `ArtId` – no emoji, no external images.

## 5. Pedagogy engine

- **Phonics order (Jolly-Phonics-style, not alphabet):** U1 s a t p i n → U2 c/k e h r m d → U3 g o u l f b → then digraphs (sh ch th ck), vowel teams, magic-e. Blending CVC begins right after U1 (sat, pin, tap, nap, sit, pan, tip, pit…).
- **Letter names vs. sounds** taught as separate steps; sounds spoken as pure phonemes (recorded-audio-ready; TTS is weak at isolated phonemes, so letter sounds use curated phoneme strings + example word fallback, and are flagged for recorded replacements).
- **Vocabulary themes:** colors, numbers 1–20, animals, family, body, food, clothes, home, school, sports, feelings. **Sight words:** Fry first 100 (list embedded as data, reviewed). **Phrases:** I am / I have / I like / This is / Can I…
- **SRS:** Leitner 5-box with per-child intervals (1,2,4,8,16 days); wrong → back to box 1 _and_ appears again within the same session after a hint. SM-2 considered; Leitner chosen for transparency and gentler behavior with kids. Pure module, fully unit-tested.
- **Session shape:** ≈10–15 min cap (parent-settable): warm-up review (SRS due) → new material (3–5 items) → game round → gentle end screen ("כל הכבוד, נתראה מחר"). Never a punishment: wrong → hint → retry → reveal answer kindly.
- **Placement quiz** (grades 2/4): adaptive ~20 items across letters → CVC → sight words → sentences; sets start unit and difficulty. Skippable by parent.
- **Adaptive difficulty:** rolling accuracy + response time per skill → choose option count, distractor similarity, goalkeeper level, hint timing.
- **Kindergarten:** zero text dependence: spoken instructions (Hebrew TTS, with recorded-audio swap), icon-only buttons, big targets, tap/drag/sing.

## 6. Audio

- `tts.ts`: Web Speech Synthesis, voice picker prefers `en-US`, explicit rate presets (normal 0.9 / slow 0.55), 🔊 + 🐢 buttons on every word. Hebrew instruction voice (`he-IL`) for the kindergarten track.
- Resolver order: **recorded file (`/audio/en/<id>.mp3`) → TTS fallback.** Dropping files into `public/audio` upgrades audio with no code change.
- SFX: small synthesized WebAudio sounds (no asset licensing), global mute.
- Speech recognition: `SpeechRecognition` feature-detected; unsupported (notably iOS Safari) → graceful fallback to "tap how it sounded"/self-rating, never blocking progress.

## 7. Worlds

- **Arena** (G2/G4): ~6 original brawlers (name, personality, signature move, color), battle-lesson loop (correct = attack), Word Penalty kick game (goalkeeper level scales), 4-tier cards from star-bought boxes with duplicate→dust handling, weekly league vs. own personal best, levels + skins.
- **Magic Garden** (KG): original unicorn companion + dress-up/hair/makeup, village of original pastel creatures (**the "Puffbloom" folk**, tentative), tasks: hear-tap-picture, sound↔object match, sing-along with motions, color-by-spoken-name, counting. Icons and voice only.
- **Story:** chapter unlocks after a lesson, reusing just-learned words; illustrated by SVG scenes; read-aloud with highlighted words (older kids) or narration only (KG).
- All names/art original; a README "IP checklist" and a test banning brand-name strings (Brawl Stars, FIFA, Barbie, Smurf, etc.) in content.

## 8. Economy (initial tuning, adjustable in `economy/config.ts`)

- Stars: lesson completion 5 + accuracy bonus (≥80%: +3, 100%: +5) + streak bonus (+1 per streak day, cap +5) + first-lesson-of-day bonus 2. Soft daily star cap (~40) so rewards need real learning, not grinding.
- Prices: card box 30★ (≈ 2–3 lessons), outfit/skin 40–120★, room items 25–60★, legendary-only odds ~2%, with a **pity counter** (guaranteed Rare every 5 boxes, Epic every 15, Legendary every 50).
- Streak: reward on day 3/7/14/30; missing a day pauses (no loss), "streak freeze" granted automatically weekly. No timers, no ads, no real money, ever.

## 9. Quality

- TS strict, ESLint (+ a11y plugin), Prettier, Husky-free (simple npm scripts: `lint`, `typecheck`, `test`, `build`).
- Unit tests: SRS, economy, progress/streak/mastery, adaptive difficulty, content validators, direction helper.
- No secrets in repo; `VITE_FIREBASE_*` via `.env.local` and GitHub Actions secrets; `.env.example` committed.
- Accessibility: AA contrast, high-contrast theme, reduced motion, visible focus, every action has audio, labels on icon buttons.

## 10. Deployment

GitHub Pages at `https://liorzafrir.github.io/<repo>/`; Vite `base` set from repo name; HashRouter; Actions workflow (install → lint → typecheck → test → build → deploy-pages) with Firebase env as repo secrets; PWA scope/start_url honor the base path; Firebase Auth authorized domain `liorzafrir.github.io` must be added.

## 11. Phases (each ends with a run + test + summary)

1. **Setup & foundation:** scaffold, tooling, design tokens (from UI UX Pro), RTL/`<Ltr>`, router, Firebase init + repositories + local-only fallback, family auth, profile create/select (3 kids + world choice), Firestore rules, CI skeleton, README stub.
2. **Content system + Phonics Unit 1** (s a t p i n + CVC blending), audio engine, first full lesson player, word card component with 🔊/🐢.
3. **Magic Garden** (KG, no-reading).
4. **Arena** (battle, Word Penalty, cards, league).
5. **Companion growth, shop, inventory, economy tuning.**
6. **SRS integration, placement quiz, adaptive difficulty.**
7. **Story chapters, co-op, seasonal events.**
8. **Parent dashboard, PWA offline, deployment.**

## 12. Open questions / risks (need your input)

1. **Firebase project:** I can't create it for you. Please create a Firebase project (Auth: Email/Password; Firestore) and paste the web config into `.env.local` when I ask in Phase 1 — or approve starting in **local-only mode** and connecting Firebase at the end of Phase 1.
2. **GitHub repo name** under `LiorZafrir` (suggest `kids-english`)?
3. **Hebrew translations & Hebrew TTS:** I'll write them carefully, but please have a Hebrew speaker spot-check; Hebrew voice availability varies by device (iOS/Android generally fine, some desktops lack it). Recorded Hebrew prompts for the KG track would be best long-term.
4. **Letter-sound audio:** TTS pronounces isolated phonemes poorly. I'll mitigate, but recorded sounds (even phone-recorded by you) will be clearly better.
5. **Picture content:** all images are hand-built SVG, so ~300+ word pictures is large work; I'll build them progressively per phase (Phase 2 ≈ 40 pictures, simple flat style).
6. **Scope:** this is a very large product; phases above are sequenced so each is shippable. Phase 4 (Arena) and Phase 3 (Garden) are the biggest.
7. **Names:** are "Wordlands" (app), "Puffbloom" (village folk) and the Arena brawler names fine as placeholders? I'll propose the brawler roster in Phase 4.
