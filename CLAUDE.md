# Fish-Oid — CLAUDE.md
*For Trinity. Read this first.*

---

## What Fish-Oid Is

Free AI-powered identification tool for fishing, hunting, and marine life.
Upload a photo — Fish-Oid (aka Dave the Rave) identifies your catch, gear,
or game, or roasts it. Ask Captain Barnacle (retired trawlerman turned
marine biologist) anything about fish ID, tackle, or the sea. Wrapped
inside **The Harbour Village** — a learning hub (tides, fish ID tips,
conservation) plus a Supabase-backed community layer (kudos, leaderboard,
activity feed).

Part of the FeelFamous -Oid Ecosystem.

**Live at:** fish-oid.netlify.app — confirmed 2026-08-18 against the real
Netlify project record (`get-project` on site ID `935617af-...`); no
`.co.uk` custom domain is attached, despite this file previously saying
`fish-oid.co.uk`. Don't reintroduce `fish-oid.co.uk` in canonical tags,
meta/OG tags, robots.txt/sitemap.xml, share text, or cross-links elsewhere
in the ecosystem until a real `.co.uk` domain is actually attached in
Netlify.

---

## The Characters

**Dave the Rave** — the identification voice used inside `analyze-image.js`'s
prompts (identify mode + roast mode). A raver who finds peace by the river.

**Captain Barnacle** — the chatbot (`chat-barnacle.js`). Retired North Sea
trawlerman turned marine biologist, 62, from Whitby. Salt-weathered, dry
humour, fish puns, has a Jack Russell called Sprat.

---

## Stack

- **Static HTML** — single page (`index.html`), no framework, no build step
- **Tailwind CSS CDN** — inline
- **Netlify** — hosting + serverless `/netlify/functions/`
- **Supabase** — auth (kudos, leaderboard, activity feed), project
  `pdnjeynugptnavkdbmxh` (shared anon key visible client-side, same pattern
  as sibling -oids)
- **Gemini 2.0 Flash** (`analyze-image.js` — identify + roast modes) /
  **Gemini 2.5 Flash** (`chat-barnacle.js`) — all AI calls (NEVER Anthropic
  API in deployed code)
- **Patreon** — no OAuth integration exists in this repo at all (see below).
  "Join on Patreon" is a static outbound link only.

---

## File Map

```
/
├── CLAUDE.md               ← you are here
├── LICENSE
├── index.html              ← entire app: identify/roast, Learn, Q&A, Ask Barnacle, Gear, Village
├── netlify.toml
├── package.json
└── netlify/functions/
    ├── analyze-image.js     ← Gemini vision: identify mode + roast mode
    └── chat-barnacle.js     ← Captain Barnacle chatbot
```

No `patreon-auth.js`, no security wrapper files (`gemini-secure-wrapper.js`,
`ipi-sanitize.js`) present in this repo, unlike several sibling -oids that
copied them in. Worth considering adding if this app starts handling
higher-risk input, but out of scope for this pass.

---

## Free-to-use philosophy (Chris, 2026-07-13 — read before adding any gate)

The core tool is free for everyone, no sign-in, no lock icon, no "Villager+
only" banner. Don't gate the tool itself behind Patreon.

**What Patreon/paid tiers are for:** genuine extras that cost ongoing hosting/
upkeep and aren't required to use the tool. Frame honestly, never as a
shame-lock ("🔒 ... Unlock →"). No tier-comparison shop windows.

**The ask, when there is one:** one honest, low-key line after the task
completes — free to use, tell a mate if it helped, buy-me-a-coffee if you
want to say thanks (one-off, `buymeacoffee.com/chrispteemagician`), Patreon
if you want to be a regular. Not a gate. Not gamified.

**Repo-specific facts (don't relitigate):**
- Audited 2026-07-29: **no Patreon gating exists in this repo at all.**
  There is no `patreon-auth.js` function, no `isPro`/`patron_status` check,
  no lock-icon or shame-lock copy, no false-scarcity banner
  ("first 1,000 only" etc.), anywhere in `index.html` or
  `netlify/functions/`. `analyze-image.js` (identify + roast) and
  `chat-barnacle.js` (Ask Captain Barnacle) have never had a tier check —
  both are, and always were, fully free and ungated.
- The "🪝 Join on Patreon" buttons and the Villager/Elder/Founder tier cards
  in the Village section are static outbound links to
  `patreon.com/chrisptee` / `patreon.com/FeelFamous` — informational only,
  not wired to any client-side session state (no `patreonSession`/`isPro`
  variable exists in this codebase to check).
- Sign-in (`#signInPrompt`, shown after an identify/roast result) is
  Supabase email/password, not Patreon — it unlocks kudos, catch tracking,
  and the village activity feed/leaderboard (bucket 2, real Supabase
  hosting cost), never the identify/roast/chat tools themselves, which
  already work and show their result before any sign-in prompt appears.
- Added 2026-07-29: an honesty-box message (`#honestyBox`) under the
  identify/roast result, above the sign-in prompt — free to use, one-off
  Buy Me a Coffee link, Patreon if you want to be a regular. This repo has
  no Patreon session state to hide it behind (same situation as sail-oid),
  so it's shown to everyone, same as sail-oid's pattern.
- Fixed 2026-07-29: `analyze-image.js` hardcoded `mime_type: "image/jpeg"`
  regardless of the uploaded image's real type — now extracts the real MIME
  type from the data URL first (see Gemini API Rules below).

---

## Membership Tiers (as displayed — informational only, no code gate)

| Tier | Price | Perk |
|------|-------|------|
| 🐟 Villager | £4.95/month | Hut in the village, kudos & leaderboard, activity feed, recognised across all -Oids |
| ⭐ Elder | Earned | Everything in Villager + mini hamlet page + named in the village roll |
| 👑 Founder | £14.95/month | Full hamlet suite, direct line to Chris, early access, 300 kudos on joining |

Pricing already matches the ecosystem standard (£4.95 / Earned / £14.95) —
confirmed correct 2026-07-29, no change needed. Patreon links go to
`https://www.patreon.com/chrisptee` (footer, tier cards) and
`https://www.patreon.com/FeelFamous` (hero button) — inconsistent between
the two, worth Chris confirming which campaign this should point to, not
changed in this pass since it wasn't part of the gating audit.

---

## Gemini API Rules (Ecosystem-Wide)

Two known pitfalls across the -oid ecosystem:

1. **Do NOT set `thinkingConfig: { thinkingBudget: 0 }`** — Gemini 2.5 Flash
   rejects it with a silent 400. Omit `thinkingConfig` entirely. Not present
   in this repo's functions — confirmed clean.
2. **Do NOT hardcode `mime_type: "image/jpeg"`** — always extract the real
   type from the data URL first:
   ```js
   const mimeMatch = image.match(/^data:(image\/[\w+.-]+);base64,/);
   const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
   const rawImage = image.replace(/^data:image\/[\w+.-]+;base64,/, '');
   ```
   Fixed in `analyze-image.js` 2026-07-29 — was hardcoded, now extracts the
   real type inline.

---

## Deploy

Push to `main` → Netlify auto-deploys. Never drag-to-Netlify. `git pull`
before every push.

---

## Session History

### 2026-07-29 — Claude (de-gate audit)
- Ecosystem-wide de-gate pattern applied. Result: nothing to unlock — this
  repo never had a Patreon gate on any core functionality. Full findings
  above under "Repo-specific facts."
- Added honesty-box message after identify/roast results.
- Fixed hardcoded `image/jpeg` MIME type in `analyze-image.js` to extract
  the real type from the uploaded data URL.
- Pricing checked against £4.95/Earned/£14.95 standard — already correct.
- Wrote this CLAUDE.md — none existed before.
