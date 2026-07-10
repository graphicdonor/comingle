# Content moderation

Pre-publish AI moderation for user-submitted text and images, using OpenAI's
`omni-moderation-latest` model. Content is checked *before* it becomes
visible to anyone but its author — never after.

## Scope

Covered, with a full pending → published/blocked pipeline:
- **Posts** (title, content, image, or a 15-second video)
- **Matrimonial profiles** (about-me text, photos)

Covered, with a synchronous precheck (see "Two enforcement tiers" below):
- Profile bio
- Community description
- Community rules
- Avatar upload
- Community cover upload

**Video posts, specifically:** OpenAI's moderation endpoint has no video
input modality, so a video post is moderated via one extracted preview
frame (captured client-side around the same moment used for the feed
thumbnail, see `src/lib/video.ts`) run through the exact same
image-moderation path a photo post already goes through — no separate
pipeline. This means the check inspects a single representative frame, not
every frame and not the audio track; see "Known limitations" below.

**Deliberately not covered:**
- **Comments.** The `comments` table and RLS policies exist in the schema,
  but there is no comment-creation UI anywhere in the app — nothing to hook
  moderation into. Wire it in if a comment feature is ever built.
- **Matrimonial chat messages.** These are private 1:1 messages, not
  published content in the sense the rest of this system deals with, and a
  synchronous per-message AI check would add real latency to a real-time
  chat. Left unmoderated as a deliberate scope decision.

## Required setup

**`OPENAI_API_KEY` must be set** for this to actually call OpenAI. Without
it, every check fails closed to `hold_for_review` — nothing is silently
allowed through, but nothing gets auto-published either; everything piles
into the admin queue until a key is configured. See `.env.example`.

## Architecture

This app has no Server Actions and no middleware layer in the Express
sense — every existing mutation is a `"use client"` component calling
Supabase directly from the browser (see `create-post.tsx`,
`community-settings-form.tsx`, etc). Moderation needs a secret API key
that can never reach the browser, so the two full-pipeline flows
(posts, matrimonial profiles) go through **Route Handlers** instead:

- `POST /api/moderation/posts` — replaces the old direct
  `supabase.from("posts").insert(...)` in `create-post.tsx`.
- `POST /api/moderation/matrimonial-profile` — replaces the direct
  `.upsert(...)` in the matrimonial profile edit page.
- `POST /api/moderation/precheck` — generic synchronous check used by the
  lighter settings-style fields (see below).
- `POST /api/moderation/appeals` — a user appealing a held/blocked decision.
- `POST /api/admin/moderation/[id]` — admin approve/reject on a queued item.
- `POST /api/admin/moderation/appeals/[id]` — admin approve/deny an appeal.

Core logic lives in `src/lib/moderation/`:
- `service.ts` — calls the OpenAI moderation endpoint, turns category
  scores into a decision.
- `pipeline.ts` — `runModerationPipeline()`, the single entry point every
  Route Handler calls: runs the check (skipped for suspended users, who
  always hold), logs it, queues it if held, updates the violation count
  if blocked.
- `db.ts` — the Supabase reads/writes behind that, all via the
  service-role admin client.
- `config.ts` — thresholds, read from env vars.

### Enforcement is at the database layer, not just app code

`posts` and `matrimonial_profiles` both have a `moderation_status` column
(`pending_review` | `published` | `blocked`) and RLS policies with a
`WITH CHECK` clause that only ever lets a user's own insert/update set
`moderation_status = 'pending_review'` — a client cannot mark its own
content published no matter what it sends. The SELECT policy only shows
`published` rows to other users (the author always sees their own,
regardless of status). The only thing that can flip a row to `published`
is a follow-up update from the service-role client, run from the trusted
Route Handler after the AI check resolves.

This was deliberately **not** implemented as a `before insert` trigger
that force-resets the column: `matrimonial_profiles` is edited via
upsert (one row per user, resaved often), and a trigger firing on every
resave would revert an already-published profile back to `pending_review`
on every unrelated edit (changing your city, say). The WITH CHECK
approach avoids that failure mode entirely.

### Two enforcement tiers

**Full pipeline** (posts, matrimonial profiles): genuine "browse other
people's content" surfaces. `allow` → published immediately. `hold_for_review`
→ saved as `pending_review`, visible only to its author, queued for a human
reviewer; approving it flips it to `published`. `block` → saved as
`blocked`, author can appeal.

**Precheck** (bio, community description/rules, avatar, cover): these
update in place with no natural "publish moment" of their own. Anything
other than `allow` simply refuses the save outright — nothing partial gets
persisted. Still logged (so trust-score tracking sees these attempts too),
just without a queue-and-reveal-later flow, since there's no natural
"revealed later" state for a profile field the way there is for a post.

## Decision logic

For each category OpenAI returns a score for:
- Score ≥ that category's block threshold → **block**.
- Otherwise, score ≥ the review threshold → **hold_for_review**.
- OpenAI's own `flagged` boolean for a category, even if under our review
  threshold, still bumps an otherwise-`allow` decision to `hold_for_review`
  — their calibration shouldn't be silently overridden by ours.

`sexual/minors` has a hardcoded near-zero block threshold (0.01) regardless
of the configured global default — see `CATEGORY_BLOCK_OVERRIDES` in
`config.ts`. Per the original spec this came from: for anything
CSAM-adjacent at real scale, pair this with a hash-matching service like
PhotoDNA as a second layer — a single moderation API call should not be the
only line of defense for that category in production.

**API failures fail closed.** A timeout, a network error, a missing API
key — all resolve to `hold_for_review`, never `allow`. An outage should
never be the reason something unsafe gets published.

## Auto-suspend

Tracked in `user_trust_scores`. After every `block` decision (automatic or
a human rejecting a held item), the app counts that user's blocks in the
last `AUTO_BAN_WINDOW_DAYS` days directly from `moderation_logs` — not a
decaying counter, since a plain incrementing count can't "forget" old
violations on its own — and suspends the account if the count reaches
`AUTO_BAN_VIOLATION_COUNT`. Once suspended, all of that user's future
submissions skip the AI call entirely and go straight to `hold_for_review`.

An appeal being approved decrements the violation count and un-suspends
the account (restoring the content too).

## Reviewing content

`/admin/moderation` (gated by the same shared-password cookie as the rest
of `/admin` — there's no per-admin-account system in this app, so unlike
the original spec's "reviewer id," there's no individual reviewer identity
to record, only the outcome and timestamp). Two tabs: Pending Review and
Appeals. Each entry shows the flagged categories with their scores, the
input text/images, and Approve/Reject (or Restore/Deny for appeals).

Users are notified of both outcomes (held item resolved, appeal resolved)
through the existing in-app notification system — see
`notify_moderation_decision`/`notify_appeal_outcome` in `schema.sql`,
following the same DB-trigger pattern already used for chat notifications
(never inserted by app code directly).

## Known limitations

- **Video posts are checked via one representative frame, not the whole
  clip.** There's no server-side video pipeline in this app (no ffmpeg, no
  frame-sampling worker) and OpenAI's moderation endpoint doesn't accept
  video input at all — so a single frame extracted client-side stands in
  for the full 15 seconds. Content that's only unsafe in a frame other than
  the sampled one, or in the audio track, isn't caught by this check.
  Tightening this would mean sampling multiple frames server-side (and,
  for audio, adding a transcription step) — a real video pipeline, not a
  client-side approximation.
- **Images already in a public bucket become reachable at their exact URL
  the moment they're uploaded**, before moderation ever runs — the
  `post-images`/`matrimonial-photos` buckets are fully public. This system
  guarantees a flagged image is never *surfaced or linked* anywhere in the
  app to other users until approved; it does not guarantee the raw file is
  completely unreachable to someone who already has (or guesses) the exact
  URL. Closing that gap fully would mean uploading to a private staging
  bucket first and only moving approved files to the public one — a larger
  storage-architecture change than this pass covers.
- **No per-admin reviewer identity.** This app's admin panel is a single
  shared password, not individual accounts, so "who reviewed this" isn't
  tracked, only "was it reviewed and when."

## Tuning

All thresholds are environment variables — see `.env.example`. Lower
`MODERATION_REVIEW_THRESHOLD` to send more borderline content to human
review; lower `MODERATION_BLOCK_THRESHOLD` to auto-reject more
aggressively. Per-category overrides (currently just `sexual/minors`) live
in `CATEGORY_BLOCK_OVERRIDES` in `src/lib/moderation/config.ts`.
