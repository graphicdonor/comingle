# Architecture

A Next.js 16 + Supabase social/community platform: users join topic-based
communities, post into them, build a profile, optionally create a
matrimonial (matchmaking) profile or a business/job/event directory
listing, and are protected by a pre-publish AI content moderation layer
(backed up by viewer-initiated reports) reviewed through an internal admin
console. This doc is the map of how all of that actually fits together —
conventions, data model, feature-by-feature logic, and the
gaps/inconsistencies worth knowing about before touching a given area.

Feature-specific docs that already exist stand on their own and aren't
duplicated here: **`MODERATION.md`** covers the content moderation system
in full (scope, decision logic, auto-suspend, appeals, tuning). This doc
covers everything else, plus how moderation *fits into* the rest of the app.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (`next@16.2.9`), App Router, React 19 |
| Backend | Supabase (Postgres + Auth + Storage), no separate API server |
| Auth | Supabase Auth — phone OTP (primary) + Google OAuth |
| AI moderation | OpenAI Moderations API (`omni-moderation-latest`), `openai@^6` SDK |
| Styling | Tailwind CSS v4 (CSS-first/PostCSS setup) |
| Animation | Framer Motion (`^12`) |
| Icons | `lucide-react` |
| Testing | Playwright (`@playwright/test`) — no unit test runner configured |
| Deployment | Netlify (`@netlify/plugin-nextjs`) |
| DB migrations | Supabase CLI (`npx supabase`), linked to the hosted project |

No state-management library, no data-fetching library (no React Query/SWR),
no ORM. Data fetching is Supabase's JS client called directly from Server
Components or Route Handlers; client state is local `useState`.

## Conventions & patterns

These are the load-bearing decisions that repeat across every feature. Read
this section before adding a new mutation or table — it'll save you from
re-deriving something that was already deliberately decided.

### No Server Actions — Route Handlers only

`grep -rln '"use server"' src/` returns nothing. Every mutation that needs a
server-only secret (an admin key, the OpenAI key) goes through a `route.ts`
Route Handler instead. Simple, RLS-safe mutations that don't need a secret
(joining a community, liking a post, editing your own profile) skip the
server entirely and call Supabase directly from a `"use client"` component
via the browser client. There is no middle ground — no tRPC, no generic
"API layer." If you're adding a mutation, the decision is just: *does this
need a secret or elevated privilege the browser can't hold?* If yes, Route
Handler. If no, call Supabase directly from the component.

### Three Supabase clients, three trust levels

- **`src/lib/supabase/client.ts`** — browser client (anon key). The only
  one usable in `"use client"` components. Session lives in cookies via
  `@supabase/ssr`'s `createBrowserClient`.
- **`src/lib/supabase/server.ts`** — server/SSR client (anon key, but reads
  the caller's session from the request's cookies via `createServerClient`).
  Used in Server Components and Route Handlers that need to act *as the
  calling user* — RLS still applies, so this can't do anything the user
  themself couldn't.
- **`src/lib/supabase/admin.ts`** — service-role client. Bypasses RLS
  entirely. Used narrowly: admin pages, the moderation pipeline's DB writes,
  and the specific moment a Route Handler needs to flip a row from
  `pending_review` to `published`/`blocked` after the calling user's own
  RLS-scoped insert already happened. Never exposed to the browser.

Rule of thumb: reach for the admin client only when you need to act across
users' data with no owning session (admin panel) or to perform the one step
in a pipeline that a real user's own RLS grants could never allow. Default
to the server/browser client otherwise.

**`server.ts`'s `getUser()` is not the real Auth-server call.** It's
wrapped to delegate to `getSession()` (which just decodes the JWT already
sitting in the request's cookies) whenever it's called with no explicit
token argument. `proxy.ts` already makes the one real `getUser()`
network round-trip that validates the session against the Auth server for
every request that needs it — every Server Component and Route Handler
downstream of that middleware would otherwise redundantly re-validate the
same token over the network again, which was costing every server-rendered
page an extra ~300-400ms. Server Components and Route Handlers trust that
middleware already ran; the one place that still needs the real network
check is `proxy.ts` itself, which is why it wasn't touched by this change.
Don't "fix" this wrapper back to a real network call without checking
whether that reintroduces the exact page-load regression it was added to
remove.

### Hard navigation after an async mutation, not `router.push()`

A recurring, confirmed bug in this app/Next.js version: calling
`router.push(...)` immediately after an `await fetch(...)`/Supabase mutation
intermittently never commits the navigation — the URL doesn't change and
the old page just sits there, with no thrown error to catch. It's shown up
independently in the matrimonial profile edit flow and the admin login
page. The established workaround, applied both times, is a hard navigation
instead: `window.location.href = "..."` rather than `router.push(...)`.
If you're adding a redirect that immediately follows an async mutation and
it seems to intermittently "just not fire," reach for this before assuming
your own logic is wrong.

### Community feed companion posts

Matrimonial profiles, business listings, job listings, and event listings
can each optionally publish a real row into the shared `posts` table, into
a community the author picks — reusing posts' existing likes, comments,
moderation, and deletion machinery for free instead of building a parallel
engagement system per listing type. `posts.post_type` (`standard |
matrimonial_profile | business_listing | job_listing | event_listing`)
discriminates the row, paired with one nullable FK column per type
(`matrimonial_profile_id`, `business_listing_id`, `job_listing_id`,
`event_listing_id`) rather than a single polymorphic reference column, so
each FK can still point at its target table with real referential
integrity. `src/lib/community-feed-post.ts` centralizes this: per-type
content-formatting helpers (`matrimonialFeedPostContent`,
`businessFeedPostContent`, `jobFeedPostContent`, `eventFeedPostContent`),
`isCommunityMember` (the author must actually belong to the community
they're posting into), and `upsertCommunityFeedPost`/
`syncCommunityFeedPostIfExists` — the latter keeps the companion post's
content in sync if the underlying listing is edited later, rather than
leaving a stale snapshot in the feed. `post-card.tsx` renders a
type-specific badge and links "Details" through to the listing's own page
(`/services/{businesses,jobs,events}/[id]` or the matrimonial profile
view) rather than treating it as a plain text/image post.

### RLS is the actual enforcement layer — and it fails silently

Every real permission check in this app lives in a Postgres RLS policy, not
in application code. App code's job is to *reflect* what RLS will do (so
the UI doesn't show a button that's going to fail), not to be the source of
truth for who can do what.

The sharp edge: **a blocked `UPDATE`/`DELETE` returns zero rows affected,
not an error.** If you write `.update({...}).eq("id", x)` and only check
`{ error }`, a write silently blocked by a policy looks identical to a
write that succeeded. The fix used everywhere in this codebase: always
chain `.select()` after the mutation and check the returned row count —
`community-settings-form.tsx`'s `handleSave`/`handleDelete` are the
canonical example, with an inline comment explaining exactly this. This bit
twice during this app's development (community edit and delete both
originally missed it) before becoming a fixed convention — a new mutation
that doesn't do this should be treated as a bug.

One live inconsistency: `community-rules.tsx`'s save handler does **not**
follow this pattern (no `.select()`, no blocked-write detection) — currently
harmless only because its edit control is gated to admins client-side, but
worth fixing if that gating ever loosens.

### Status enforcement via `WITH CHECK`, not triggers

`posts` and `matrimonial_profiles` both carry a `moderation_status` column
(`pending_review | published | blocked`). Rather than a `before insert`
trigger that force-resets the column, the RLS policy's `WITH CHECK` clause
constrains what a client's own insert/update can set it to
(`pending_review`, always) — the only path to `published`/`blocked` is a
follow-up write from the service-role client after the AI check resolves.
This was a deliberate choice over a trigger specifically because
`matrimonial_profiles` is edited via `upsert`: a trigger firing on every
resave would revert an already-published profile back to pending on every
unrelated edit (changing your city, say). See `MODERATION.md` for the full
decision-logic writeup.

### Notifications: SECURITY DEFINER triggers, never app-inserted

The `notifications` table has no INSERT policy for regular users at all —
rows only ever come from `SECURITY DEFINER` trigger functions
(`notify_new_matrimonial_message`, `notify_moderation_decision`,
`notify_appeal_outcome`, `notify_new_comment`, `notify_new_like` — all in
`schema.sql`), which bypass RLS by design.
`increment_member_count`/`decrement_member_count`/`increment_like_count`/
`decrement_like_count` are the same pattern applied to counters: no general
UPDATE policy grants a plain member the ability to bump `member_count` or
`like_count` directly, so a `security definer` RPC is the sanctioned
bypass. If a new feature needs a side-effecting write that no RLS policy
should grant broadly, this is the established shape for it — not a new
service-role Route Handler for something this narrow.

The matrimonial-message trigger also demonstrates the dedup pattern worth
reusing: it tries an `UPDATE` on an existing *unread* notification first
(bump `count`, refresh `created_at`) and only `INSERT`s if that affected
zero rows — so a burst of activity from one source collapses into one
badge-worthy row instead of piling up.

### Admin auth is a separate, simpler model — not Supabase Auth

`/admin/*` has nothing to do with Supabase Auth or the `profiles` table.
It's a single shared secret (`ADMIN_SECRET` env var) with no per-admin
accounts — `src/lib/admin-auth.ts` hashes the secret with a fixed salt
(`computeAdminToken`) and compares via `timingSafeEqual` on SHA-256 digests
(so a length mismatch can't throw and leak length). The token is stored as
an httpOnly `admin-token` cookie, deliberately scoped `path: "/"` rather
than `path: "/admin"` — the moderation action routes live at
`/api/admin/...`, a sibling path, not a sub-path, so a narrower cookie
scope would silently never reach them (this caused a real bug once: admin
approve/reject actions 401'd until both login and logout were fixed to use
`path: "/"`).

`proxy.ts` gates `/admin/*` **page** routes via this cookie. It does *not*
cover `/api/admin/*` Route Handlers — proxy matchers only see page paths —
so every admin API route re-implements the identical cookie check inline
(see `api/admin/moderation/[id]/route.ts`'s `isAuthed()`, with a comment
explaining exactly why it's duplicated rather than shared middleware).
There is no admin "user" row anywhere; this system never touches Supabase
Auth at all.

### `DEV_MODE`: a parallel, localStorage-backed mock

`NEXT_PUBLIC_DEV_MODE=true` plus a hardcoded phone/OTP pair
(`NEXT_PUBLIC_DEV_PHONE`/`NEXT_PUBLIC_DEV_OTP`) switches the entire
onboarding funnel and most of the main app over to a fixture-data mode that
never touches Supabase — useful for exercising the UI without a fully
configured Supabase project (real phone OTP delivery, notably, is not
configured in this project's `supabase/config.toml` today — SMS/Twilio are
both explicitly disabled — so `DEV_MODE` is currently the *only* way to
walk through phone signup end to end).

`src/lib/dev-auth.ts` keeps state in two `localStorage` keys (`dev_user`,
`dev_profile`) plus a plain (non-httpOnly) `dev-session` cookie — the
cookie exists purely so `proxy.ts`, which runs server-side and can't read
`localStorage`, has something to check for route-protection purposes.
`src/lib/dev-data.ts`/`src/lib/dev-matrimonial.ts` supply matching fixture
data for communities and matrimonial profiles.

This is a **per-page opt-in**, not a request-level mock: every screen in the
primary onboarding funnel and the most-used main-app surfaces has an
explicit `if (DEV_MODE) {...}` branch, but several deeper pages (community
detail, survey pages, matrimonial chat/invites/profile-detail) have no such
branch and always attempt a real Supabase call — which simply resolves to
"logged out" under `DEV_MODE` since no real session exists. Don't assume
`DEV_MODE` coverage is total; check the specific page.

### Route protection (`src/proxy.ts`)

Next.js 16 renamed `middleware.ts` to `proxy.ts` (`export function proxy()`
instead of `middleware()`) — see `node_modules/next/dist/docs/`, and see
`AGENTS.md`'s warning at the top of this repo about exactly this kind of
breaking rename. Functionally it's the same request-interception mechanism
under a new name.

Two independent gates, checked in order:
1. **Admin gate** — `pathname.startsWith("/admin")` (except `/admin/login`
   itself) checks the `admin-token` cookie and returns early, never
   touching Supabase.
2. **User gate** — for every other matched path, it builds a per-request
   Supabase SSR client and refreshes the session token. This refresh
   deliberately runs on *every* request that could carry a session, not
   just protected ones — otherwise a user who only ever browses public
   pages (home, communities, profiles) would never trigger a refresh and
   would silently get logged out when their ~1hr access token expired. It's
   skipped only when in `DEV_MODE` or when no `auth-token`-named cookie is
   present at all, to avoid a wasted round trip for anonymous visitors.

The protected-path list is explicit and short:
```
/communities/create, /posts/create, /settings, /notifications,
/signup-details, /pin, /select-communities, /profile/edit,
/services/matrimonial, /services/businesses/register,
/services/jobs/register, /services/events/register, /reels
```
plus any `/communities/*/manage` route. **Failing the check always
redirects to `/signup`, never `/login`** — worth remembering since it's an
easy default to get backwards.

### Testing methodology

There's no seeded test-fixture system and no mocked Supabase in tests.
Verification for anything involving real auth/data flow follows this
pattern (used repeatedly during this app's development):

1. Seed a real user via the service-role admin client:
   `admin.auth.admin.createUser({ email, email_confirm: true })` +
   a matching `profiles` row.
2. Get a real session via `admin.auth.admin.generateLink({ type:
   "magiclink", email })` + `anon.auth.verifyOtp({ token_hash, type:
   "magiclink" })`.
3. Inject that session into a fresh Playwright browser context as a
   `sb-{project-ref}-auth-token` cookie (base64url JSON, `"base64-"`
   prefix) — this makes the *real* production or dev-server UI treat the
   browser as genuinely logged in, no UI login flow needed.
4. Drive the actual UI with Playwright, then verify outcomes through
   **both** the UI and a direct database query — never one alone, since a
   200 response or "gone from the UI" can mask a silent partial failure
   (see the RLS-silent-no-op gotcha above).
5. Clean up seeded users/rows afterward (a recognizable `@test.<domain>`
   email pattern makes them easy to find and delete).

For verifying a production deploy actually went out: a bundle-hash check
(CSS or JS chunk filenames changing) only works for changes that touch
client-shipped code. Pure server-side logic changes (anything in
`src/lib/moderation/`, a Route Handler body) never change a client bundle
at all — for those, either hit a route that's new/changed and check its
actual response, or just re-run the functional test above against the
production URL once a reasonable build window has passed.

## Data model

All tables live in `supabase/schema.sql` (the up-to-date reference copy)
and are built up incrementally through `supabase/migrations/*.sql`. Every
table has RLS enabled; policies are summarized per-feature below rather
than repeated here.

| Table | Purpose |
|---|---|
| `profiles` | 1:1 with `auth.users`. Username, name, avatar, bio, DOB, gender, state/city, `pin_hash`, phone, `last_active_at`. |
| `communities` | Name, slug, description, cover, rules, `creator_id`, `member_count`. |
| `community_members` | `(community_id, user_id, role)` — role is `member \| moderator \| admin`. |
| `posts` | Title, content, image or video, `community_id`, `author_id`, `like_count`, `comment_count`, `moderation_status`, `post_type` + 4 nullable listing FK columns (see Community feed companion posts). |
| `post_likes` | `(post_id, user_id)`. |
| `comments` | Text, `post_id`, `author_id`, `moderation_status` — full moderated comments feature, see Comments below. |
| `post_reports` | `(post_id, reporter_id)` unique, `reason`, `status` (`pending \| resolved \| dismissed`) — viewer-initiated reports, see Post reports below. |
| `matrimonial_profiles` | 1:1 per user (PK `user_id`). Full matchmaking field set — see the Matrimonial service section. |
| `matrimonial_invites` | Directional connection requests between two users. |
| `matrimonial_messages` | 1:1 chat, only after an accepted invite. |
| `matrimonial_shortlist` | Private per-user bookmark list. |
| `business_listings` | Directory listing for a business — see Directory listings below. |
| `job_listings` | Directory listing for a job opening — see Directory listings below. |
| `events` | Directory listing for an event — see Directory listings below. |
| `notifications` | In-app notification center — DB-trigger-populated only, see above. Now 5 `type` values, see Notifications below. |
| `moderation_logs` / `moderation_queue` / `user_trust_scores` / `moderation_appeals` | Full detail in `MODERATION.md`. |
| `survey_responses` | `(survey_id, user_id)` unique, `answers` jsonb. Survey *questions* live in code (`src/lib/surveys.ts`), not the DB. |

## Features

### Auth & onboarding

Two entry paths converge on the same funnel:

- **Phone OTP**: `signup`/`login` pages call `supabase.auth.signInWithOtp
  ({ phone })`, stash the phone + intent (`signup`/`login`) in
  `sessionStorage`, and route to `/otp`. `/otp` calls `verifyOtp` and then
  branches: a signup OTP always goes to `/signup-details`; a login OTP goes
  home if a profile already exists, or falls back to `/signup-details`
  for a verified-but-incomplete signup.
- **Google OAuth**: `google-button.tsx` → `signInWithOAuth` →
  `/auth/callback` (a real route, not a group, since the OAuth provider
  redirects there directly) → the identical "does a profile exist" check
  and the same fork.

From there both paths share: **`signup-details`** (name/username/DOB/
gender → state/city → optional avatar, a 3-step wizard) → **`pin`**
(creates a 4-digit PIN, hashed via SHA-256 into `profiles.pin_hash`) →
**`select-communities`** (join one or more to seed the home feed) → `/`.

Two things worth flagging precisely: the PIN is currently **write-only** —
nothing anywhere reads `pin_hash` back to gate a later app open, so despite
the "Create PIN for future login" copy, there is no PIN-entry screen yet;
it's captured and stored but not wired into any check. And real phone OTP
delivery is not currently configured (`supabase/config.toml` has SMS/Twilio
explicitly disabled) — `DEV_MODE` is the practical way to exercise this
flow today.

`/onboarding` is not a forced landing page for new anonymous visitors — an
anonymous user hitting `/` sees the real home feed rendered logged-out.
`/onboarding` is specifically where both logout handlers send you.

### Communities

Anyone can create one (any authenticated user, no approval gate) — the
creator becomes its sole `admin` via a `community_members` insert with
`role: "admin"`. Roles: `member` (can post, like, leave), `moderator` (can
also delete other members' posts and remove plain members),
`admin` (all of the above, plus edit community settings/rules, change
roles, remove moderators, and delete the whole community). An admin/mod
distinction that's easy to miss: **moderators can reach `/communities/{id}
/manage`** (the staff gate is `role !== "member"`), but only see the member
list there — the Settings tab is admin-only specifically
(`canEditSettings = role === "admin"`), a narrower check than the page-level
gate.

The home feed (`(main)/page.tsx`) is exactly the union of posts from
communities the viewer has joined, ordered by recency — not global, not
algorithmic. Community deletion cascades: deleting a community cascades to
its posts, memberships, likes, and comment rows via `on delete cascade`
foreign keys.

One RLS gap worth knowing: the community-join INSERT policy checks
`auth.uid() = user_id` but doesn't constrain the `role` column being
inserted — the UI always sends `"member"`, but nothing at the database
layer stops a crafted request from self-inserting as `"admin"`. Also,
community *creation* is not moderation-gated (no precheck on the initial
description/cover), while *editing* those same fields later through
settings is — an inconsistency worth resolving if it matters for your use
case.

### Posts & feed

`create-post.tsx` never inserts into `posts` directly — it POSTs to
`/api/moderation/posts`, which inserts (forcing `pending_review` per the
WITH CHECK convention above), runs the moderation pipeline, and flips
status immediately if the AI resolves synchronously. There is **no UPDATE
policy on `posts` at all** — posts are immutable after creation from a
client's perspective; the only thing that ever changes post-insert is
`moderation_status`, exclusively via the service-role client. Likes
(`post_likes`) work the same way for the same reason: no UPDATE policy on
`posts` means `like_count` can only move through the `security definer`
`increment_like_count`/`decrement_like_count` RPCs.

`post-card.tsx` guards the like toggle with an in-flight `liking` boolean
so a fast double-click can't fire two overlapping increment/decrement calls
and leave the count and the viewer's own `post_likes` row out of sync (the
bug this replaced) — the heart icon is filled/unfilled from the viewer's
own like row, not just from `like_count`. A per-post "•••" menu (rendered
for every signed-in viewer, not just the author) offers Report Post to a
non-author and Delete Post to the author or a community moderator/admin.

The home feed is rendered by a single Postgres RPC (added as part of the
page-load performance work) rather than the app issuing several sequential
queries per page — see Performance below.

On a profile, a user's own published posts render as an Instagram-style
grid (`profile/[username]`); clicking a tile opens
`/profile/[username]/posts/[postId]`, a full-screen post viewer that
continues scrolling into the rest of that user's post grid from that
point, rather than being a dead-end single-post page.

### Comments

Full moderated comments feature, following the same shape as posts: the
comment textbox in `post-comments.tsx` POSTs to a moderation Route Handler
rather than inserting into `comments` directly, forcing `pending_review`
per the `WITH CHECK` convention and running the standard moderation
pipeline. `posts.comment_count` only increments when a comment actually
becomes visible (published immediately, or later approved out of the
queue) — never at the moment of submission — so the on-card count can't
run ahead of what a viewer can actually see. A `notify_new_comment`
`SECURITY DEFINER` trigger notifies the post's author, following the same
dedup-on-unread pattern as the matrimonial-message trigger described
above (a burst of comments from the same commenter collapses into one
notification row rather than one per comment). Held/blocked comments
behave exactly like held/blocked posts: visible only to their own author
until a human reviewer or the AI resolves them.

### Post reports

A viewer can report any post they don't author from its "•••" menu, giving
the same admin moderation queue a second way for content to arrive besides
an AI hold — see `MODERATION.md`'s "Reviewing content" section for the
full mechanics (the `post_reports` table, its unique-per-reporter-per-post
constraint, and the `enqueue_post_report_for_review` trigger). A report
never auto-hides or auto-blocks a post by itself; it only guarantees a
human looks at it.

### Directory listings (business, jobs, events)

Three parallel directory verticals living under `/services/{businesses,
jobs,events}`, all following the identical shape: a listing table
(`business_listings` / `job_listings` / `events`) owned by its creator,
a public browse/detail view, an edit page gated to the listing's owner
(`organizer_id`/equivalent, checked server-side — see
`services/events/[id]/edit/page.tsx` for the canonical shape: redirect to
the detail page if the viewer isn't the owner), full-pipeline moderation
on text fields and photos exactly like posts and matrimonial profiles, and
an optional companion post into a community feed via the shared
`community-feed-post.ts` module (see Community feed companion posts
above). Events additionally register `/services/events/register` as a
protected route (`proxy.ts`) and get their own photo storage bucket
(`event_photos_storage` migration).

### Profiles

View (`profile/[username]`) is public; edit (`profile/edit`) covers name,
username, bio (160 char cap), DOB, gender, state/city, and avatar. Two
fields are moderation-gated via `/api/moderation/precheck` before saving:
bio and avatar — see `MODERATION.md`'s "precheck" tier. One loose end: the
avatar file is uploaded to public storage *before* the precheck call
resolves, so a blocked avatar can be left sitting in the bucket even though
the `profiles.avatar_url` column update itself is skipped (the decision is
still logged either way).

### Notifications

Polling, not realtime — there is no Supabase Realtime/websocket
subscription anywhere in this codebase. The navbar polls an unread count
every 20 seconds (`NOTIFICATIONS_POLL_MS`), a `head:true, count:"exact"`
query that fetches zero rows. Simply visiting `/notifications` marks
everything read server-side before the page renders (no explicit "mark
read" action needed); the navbar badge also clears instantly on navigating
there rather than waiting for the next poll tick.

Five notification types now exist (new matrimonial message, moderation
decision, appeal outcome, post comment, post like), all inserted
exclusively by `SECURITY DEFINER` DB triggers, never app code — see the
pattern above. The two post-engagement types batch differently, and the
difference is deliberate, not an inconsistency: a comment notification
dedups per **same commenter** (someone leaving several comments in a row
collapses to one unread row, updating its count/timestamp), while a like
notification dedups per **post**, not per liker — the row's `actor_id`
updates to whoever liked most recently regardless of who liked before, so
"Alice and 3 others liked your post" always names the latest liker rather
than the first one. `Notification.type` in `src/lib/types.ts` is a proper
union of all five string literals, matching the DB check constraint.

### Bottom navigation

`src/components/layout/bottom-nav.tsx` is a static, flat tab bar (icon +
label, fixed to the viewport bottom), styled after LinkedIn's mobile nav.
This is the nav rendered everywhere in the live app today.

The original bottom nav, `src/components/floating-nav/`, was a custom
drag-to-dock, tap-to-expand physics widget — Framer Motion primitives
(`motionValue`, `useAnimationFrame`) driving a hand-rolled damped-spring
integrator, three modes (idle/dragging/expanded), position persisted to
`localStorage`. It's **no longer used by any production route** — it still
exists in the tree, still works, and is still reachable at the standalone
`/dev/floating-nav-demo` playground, but nothing user-facing renders it
anymore. Left in place as dead code rather than deleted, in case the
physics-dock interaction is revisited later; don't be misled by its
continued presence into thinking it's still live.

### Matrimonial service

An opt-in matchmaking feature layered on top of the base profile system.
Eligibility is gender-gated (`profiles.gender` must be exactly `"Male"` or
`"Female"`) and visibility is community-scoped: browsing only ever surfaces
opposite-gender members who share at least one community with the viewer,
enforced by RLS (an `EXISTS` self-join on `community_members`), not just
hidden in the UI.

Flow: create a matrimonial profile (full name, DOB, time/place of birth,
city, Mangalik Dosh, income bracket, marital status, education, employment
status, "profile created by," free-text about-me capped at 500 chars, up to
5 photos) → browse eligible profiles → send an invite
(`matrimonial_invites`, directional, one row per ordered pair, re-sendable
after a decline by updating the same row back to `pending`) → once
accepted, chat opens (`matrimonial_messages`, simple optimistic-send + ~6s
poll, no websockets — consistent with the rest of the app never using
Realtime). A private per-user shortlist (`matrimonial_shortlist`) is a
bookmark with no eligibility check of its own. Full pipeline moderation
applies to about-me text and photos, following the same `WITH CHECK`
pending/published pattern as posts (chosen over a trigger specifically
because this table is edited via `upsert` — see the convention above).
Gender itself is deliberately **not** duplicated onto the matrimonial
profile row; it's always read from `profiles.gender` so there's one source
of truth feeding both display and the RLS eligibility rules.

### Content moderation

Fully documented in **`MODERATION.md`** — scope, the two enforcement tiers
(full pipeline vs. precheck), decision logic and thresholds, auto-suspend,
appeals, and known limitations (public storage buckets making a
not-yet-approved image's exact URL technically reachable before review;
no per-admin reviewer identity, since admin auth has no individual
accounts). Read that file directly rather than a summary here — it stays
current on its own.

### Admin console

`/admin/*` — Dashboard (user tracking), Moderation (pending review +
appeals queue), Communities (list + delete any community), Surveys
(response viewer). Entirely separate chrome from the main app
(`admin/layout.tsx`'s own dark-themed shell + `AdminNav`), and entirely
separate auth (the shared-secret cookie model above, not Supabase Auth).
Every admin page is a Server Component calling the service-role client
directly — no separate Route Handler needed for read-only views; Route
Handlers only exist for the actual mutations (approve/reject a queued
item, approve/deny an appeal, delete a community). Deleting a community
here uses the service-role client specifically because an admin has no
`community_members` row (and thus no RLS-granted delete right) of their
own on an arbitrary community — cascades the same way a self-service
delete by the community's own admin would (posts, memberships, likes,
comments via `on delete cascade`).

### Performance

Two distinct fixes, both aimed at cutting redundant network round trips
rather than changing what any page renders:

- **`getUser()` → `getSession()` delegation.** See "Three Supabase
  clients" above — the short version is `server.ts`'s `getUser()` now
  reads the already-validated session out of cookies instead of making its
  own Auth-server round trip, since `proxy.ts` already made that real call
  earlier in the same request.
- **Fewer sequential round trips per page.** PostgREST can't express "rows
  whose FK is in the result of a subquery" as a single `.from(...)`
  filter, so a few pages used to fetch an intermediate ID list first and
  then a second, dependent query — a waterfall, not a single request. Two
  fixes for the same underlying shape: the home feed now calls a Postgres
  RPC, `get_home_feed(p_user_id, p_limit)` (`security invoker`, so RLS on
  `posts` still applies as the calling user), which does the "communities
  I've joined → posts in those communities" join server-side in one
  statement; the profile page and the matrimonial browse page instead use
  an `!inner` embed (e.g. `posts` filtered via
  `profiles!posts_author_id_fkey!inner(*)` + `.eq("profiles.username",
  ...)`), which lets PostgREST filter on a joined table's column within a
  single query. Either way, the page's independent queries (profile, posts,
  memberships, likes, etc.) now all fire together inside one `Promise.all`
  instead of some of them waiting on an earlier one to resolve first.

Measured combined effect: roughly a 30% reduction in server-rendered
page load time. Netlify's own serverless cold-start/warm-request overhead
(observed separately, roughly 5s cold / 700-900ms warm) is a hosting
characteristic, not an application bottleneck, and was deliberately left
uninvestigated further as out of scope for this pass.

### Surveys

Two home-page survey cards, backed by `src/lib/surveys.ts` (question
definitions live in code, mirroring how `COMMUNITY_SERVICES` is also a
plain code array — only submitted *answers* need a database row). Four
question types (rating, single-choice, multi-choice, free text) rendered
by one shared dynamic form component. One response per user per survey,
enforced by a DB unique constraint and checked server-side before insert
(friendly 409, not a raw Postgres error). Home page cards flip to a
"Submitted" state once completed. Admin visibility shows both an aggregate
breakdown per question (option percentages, average rating) and every
individual response with its respondent.

## Known gaps and inconsistencies

Collected here so they're easy to find in one place rather than buried in
each feature section above:

- **PIN is captured but never verified** — `profiles.pin_hash` is written
  once at signup and never read back anywhere. No PIN-entry/app-lock screen
  exists yet.
- **Phone OTP delivery isn't configured** — `supabase/config.toml` has
  SMS/Twilio explicitly disabled. `DEV_MODE` is the only way to exercise
  phone signup today.
- **Community role escalation via direct API call** — the
  `community_members` insert policy doesn't constrain the `role` column,
  only `user_id`. The UI never sends anything but `"member"`, but nothing
  in the database stops a crafted request from self-admitting as `"admin"`.
- **Community creation isn't moderation-gated; editing the same fields
  later is** — no precheck on the initial description/cover at creation
  time, but a precheck runs on both when edited afterward.
- **`community-rules.tsx`'s save handler skips the blocked-write check**
  that every other settings mutation uses (no `.select()` + row-count
  check) — currently harmless only because the edit control itself is
  admin-gated client-side.
- **Avatar upload can leave an orphaned file in public storage** — the
  file uploads before the moderation precheck resolves; a blocked result
  skips the `profiles.avatar_url` update but not the upload itself.
- **The "Remember me" checkbox on login/signup is inert** — rendered
  `defaultChecked`, wired to nothing.
- **The community search box is visually present but non-functional**
  (`readOnly`).
- **Post reporting has no rate limit beyond the unique-per-reporter-per-post
  constraint** — a single user can still report many different posts in
  quick succession; nothing throttles report volume itself, only duplicate
  reports of the same post by the same reporter.
- **The original `FloatingNav` physics dock is unused dead code** —
  superseded by the static `BottomNav` (see Bottom navigation above) but
  left in the tree, still reachable at `/dev/floating-nav-demo`, in case
  the interaction is revisited. Don't assume it's live; check which
  component a given layout actually renders.

## Deployment & operations

- **Migrations**: `npx supabase migration list` shows local-vs-remote
  status; `npx supabase db push` applies pending ones (prompts for
  confirmation, applies transactionally). `supabase/schema.sql` is kept as
  a full, current reference copy alongside the incremental migration files
  — update both when adding a table/policy.
- **Environment variables**: `.env.local` for local dev (gitignored;
  `.env.example` is explicitly un-ignored via a `.gitignore` negation, so
  it stays a checked-in template). Production env vars are configured
  separately in Netlify's dashboard — entirely disconnected from
  `.env.local`, nothing to sync automatically.
- **Deploys**: push to `main` → Netlify builds and deploys automatically.
  Verifying a deploy actually went live: for changes that touch
  client-shipped code, a CSS/JS bundle-hash change is a reasonable signal;
  for server-only logic changes, that signal doesn't move at all — check
  functional behavior directly instead (see Testing methodology above).
