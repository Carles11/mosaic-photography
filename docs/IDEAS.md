# IDEAS — Mosaic (web + mobile)

> Idea backlog, not yet scheduled. When an idea is approved it moves into
> `TASKS.md` (web) and gets ported to the mobile app per the usual flow.
> Status: `💡 idea` · `🔍 exploring` · `✅ promoted to TASKS` · `❌ dropped`
> Last reviewed: 2026-09-25 (updated)

---

## Idea 1 — "Pic to life" AI animations (free teaser + paid extended)  `💡 idea`

**Pitch (Carles, 2026-09-25):**
- Like Pinterest: gallery tiles show a very short AI clip where the subject briefly "comes to life".
- On zoom (lightbox), show the still photo plus a small, appealing **"Buy extended version"** button (15 s / 30 s / 60 s — TBD).
- Only the short gallery teasers are free.
- Global **"AI animations" on/off** in filters. Opt-outs must be tracked to measure how much users actually like the feature.
- Price per extended clip derived from generation cost.

### Cost reference (API list prices, image-to-video, mid-2026 — re-check before building)

| Model | $/second |
|---|---|
| MiniMax Hailuo 02 | ~0.045 |
| Wan 2.6 / Veo 3.1 Lite / Grok Imagine | ~0.05 |
| Kling 3.0 | ~0.075 |
| Seedance 2.0 | ~0.09 |
| Runway Gen-4.5 | ~0.12 |
| Veo 3.1 Fast / Standard | ~0.15 / ~0.75 |

Source: buildmvpfast.com/api-costs/ai-video (July 2026).

**Rough numbers (budget tier ~$0.05/s):**
- Teasers: ~1,010 images × 3 s ≈ **$150 one-off** (grows with each new photographer — see Task 1).
- Extended: 15 s ≈ $0.75 · 30 s ≈ $1.50 · 60 s ≈ $3 raw cost (2–3× with a premium model).
- Most models cap at ~5–15 s per generation; 30–60 s means chaining/extending clips → higher cost, more quality drift. 15 s is the realistic sweet spot to start.
- Suggested price shape: ~3–5× raw cost to cover retries, failed/rejected generations, storage/CDN and store fees → e.g. 15 s ≈ $2.99.

### Design notes
- **Generate extended clips on demand** (pay → generate → notify/deliver, ~1–3 min) so we never pay for unsold clips. Teasers are pre-generated in batch.
- **Format:** short looping muted MP4/WebM (not GIF — GIFs are 5–10× heavier). Teasers under ~300–500 KB.
- **Storage:** new S3 folder per photographer (e.g. `{author}/ai-teaser/`, `{author}/ai-extended/`) + URL helpers in `src/utils/imageResizingS3.ts` (Rule 1). New Supabase table e.g. `ai_animations` (image_id, kind, url, model, cost, status) and `ai_purchases`.
- **Performance:** only autoplay teasers in-viewport (IntersectionObserver), respect `prefers-reduced-motion` and data-saver; no preloading (Rule 2).
- **Opt-out tracking:** add `ai_animations` to `FiltersProvider` (persisted in `user_profiles.filters`, Rule 10) + an analytics event on toggle so anonymous users count too. Also track teaser views → lightbox opens → buy clicks → purchases (conversion funnel).
- **Payments:** web can use Stripe. On iOS/Android, digital goods must go through App Store / Play billing (15–30% cut) — factor into price, or sell web-only initially.

### Risks / open questions — resolve BEFORE any build
1. **Nudity & minors (blocker).** The gallery defaults to `nudity: "nude"`, and parts of the collection include nude subjects, some of whom may be minors (e.g. parts of the von Gloeden archive). Animating those with AI is a hard no — legally and ethically — and most video APIs will refuse or flag nude inputs anyway. Needs an **explicit eligibility whitelist**: only images tagged non-nude and clearly adult subjects; exclude any image where age is uncertain.
2. **Brand / trust:** Mosaic's identity is *authentic public-domain photography*. Clips must be clearly labelled "AI-generated", never replace the original, and never be sold as CC PDM (the original is PD; our derivative is a product). Consider SEO/JSON-LD impact (keep `ImageObject` pointing to the original).
3. **Provider terms:** confirm commercial resale of outputs is allowed and outputs aren't watermarked on the chosen tier.
4. **Quality:** historical photos (grain, sepia, blur) animate unevenly — run a pilot on ~20 images across 3 models before committing.

### Decision (2026-09-25)
- Carles owns the age/nudity eligibility rules. **AI animations are applied to non-nude, clearly-adult images only.**
- Reason beyond ethics: the stores accept our nude content because it is *authentic historical/educational* photography. AI-animated nudity is synthetic content and could put the app's whole listing at risk. Keep the two worlds strictly separate (see Idea 2).

### Suggested next step
Pilot (cheap, ~$10–20): pick ~20 eligible images, generate 3 s teasers + one 15 s clip with 2–3 models, compare quality/cost. Decide model + eligibility rules, then write the TASKS entry.

---

## Idea 2 — Use our "historical nude photography" niche as a differentiator  `💡 idea`

**Context (Carles, 2026-09-25):** Mosaic is one of the few store-approved apps with nude imagery, allowed because of its clear historical and educational context. We want to turn that into an advantage.

**Principle:** the *authenticity* of the archive is the asset that keeps us in the stores. Anything that makes the nude content look less documentary (AI edits, sexualised framing, "hot"/clickbait wording) puts the asset at risk.

**Directions to explore:**
- **ASO/SEO around the niche:** art history, fine-art nude, pictorialism, figure study, named photographers (Stieglitz, Weston, Demachy…). Keep all wording educational.
- **Figure-drawing / artist reference use case:** see Idea 3.
- **Strengthen the educational context:** photographer bios, timelines, captions with year and movement, short "why this photo matters" notes. This helps SEO and also serves as evidence during store review.
- **Store compliance kit:** keep a written justification (historical/educational use, PD sources, age gate, default filters, age rating) ready for App Store / Play review and appeals.

**Guardrails:** age rating and age gate stay in place; no AI on nude images (Idea 1); no marketing creatives showing nudity (the ad networks' own policies apply).

---

## Idea 3 — "Draw mode": timed figure-drawing sessions  `💡 idea` (Carles likes it)

**What it is:** artists, art students and illustrators practise by sketching a person from a photo in a fixed time (30 s – 5 min), then moving to the next pose, usually 20–40 poses per session. Sites like Line of Action and Quickposes serve this audience, and finding reference photos that can be used freely is their main problem. Our collection is CC PDM, high quality and historical, so it's an ideal fit.

**User flow:**
1. **Start a session.** Choose photos using the existing filters (nudity, gender, orientation, photographer) or a saved set/favourites.
2. **Set it up:** time per pose (30 s / 1 / 2 / 5 / 10 min / custom) and number of poses (10 / 20 / 40 / unlimited). Optional "class mode" with a rising sequence (e.g. 10×30 s → 5×1 min → 2×5 min → 1×10 min).
3. **Draw along.** Full-screen photo, countdown, automatic advance, soft sound/vibration at the switch. The artist draws on paper or a tablet.
4. **Controls:** pause, skip, back, black-and-white toggle, mirror flip, screen kept awake.
5. **End of session:** a grid of the poses drawn and a "save this set" option. Later: streaks/history for logged-in users.

**Implementation notes (for the TASKS entry later):**
- Reuses gallery data + `FiltersProvider` (Rule 10). Images through `src/utils/imageResizingS3.ts` only (Rule 1). No manual preloading (Rule 2) — rely on Next `<Image>`; only revisit if a switch visibly stalls.
- Web: new public page (e.g. `/draw`) with metadata + JSON-LD (Rule 8); the session runner itself can be client-only. Chrome stays in `ClientLayout` (Rule 9), with a full-screen/immersive mode during the session.
- Mobile: Expo — `expo-keep-awake`, haptics on pose change, portrait/landscape support.
- The random pick must be driven by the server (SSR helper, Rule 7) or a Supabase RPC so filters are applied consistently.
- Optional DB: `drawing_sessions` (user_id, settings, image_ids, created_at) for history/streaks — phase 2.

**Why it's worth it:** it draws users who come back every day, brings in search traffic ("figure drawing reference", "gesture drawing", "croquis", "pose reference"), strengthens the educational case with Apple/Google, and costs little to build (timer + slideshow on top of what exists).

**Open questions:**
- Should nude photos be included by default in draw mode? (Suggestion: follow the user's gallery filter; show the age gate first.)
- Is the collection big enough? ~1,000 images is fine to start. Check how many are full-body / figure shots, and consider a `pose`/`full_body` tag later.
- Free vs paid: keep the basics free; possible premium later (custom sequences, history, larger sets).

### Monetization — "honest" model (draft, 2026-09-25)

**Ground rule:** the photos are public domain, so we **never charge for access to the images**. We charge for tools, curation work and convenience, and say so openly.

| # | Stream | What the user pays for | Notes |
|---|---|---|---|
| 1 | **Affiliate art supplies** | Nothing. We earn a commission. | End-of-session "Draw with" block (sketchbooks, charcoal, graphite, tablets). Clearly labelled. Plugs into the affiliate partners list (Task 2). Launch on day 1. |
| 2 | **Support the archive** (tip jar / patron) | Voluntary | "Help us digitise the next photographer" — ties directly to Task 1. Fits the PD spirit. Launch on day 1. |
| 3 | **Draw Pro** (subscription, ~$2.99/mo or ~$19/yr — TBD) | Tools | Class mode / custom sequences, session history + streaks, saved sets, offline packs (mobile), pose-tag filters. The free tier keeps the basic timer + **all** images. |
| 4 | **Curated pose sets** | Our curation/tagging work | Standing, seated, reclining, hands, torso, drapery… Probably bundled in Pro rather than sold one by one. Requires a `pose` tag on `images_resize`. |
| 5 | **Teacher / atelier plan** (~$49–99/yr — TBD) | Running a class | Projector mode, shareable session links, class sequences. Small but loyal market. Phase 3. |
| 6 | **Printable reference sheets (PDF)** | Convenience | Contact sheets of a set for offline classes. Cheap one-off, or included in Pro. |

**What we avoid:** ads (ad networks + nudity don't mix), paywalling images, dark patterns (streak guilt, fake scarcity, hard-to-cancel subscriptions), unlabelled affiliate links.

**Payments:** web → Stripe. Mobile → App Store / Play in-app purchases (15–30% fee) for Pro. Tips and affiliate links follow each store's rules.

**Rollout:**
1. Free MVP + affiliate block + tip jar. **Measure:** sessions per week, returning drawers, average session length, affiliate click-through.
2. If retention is good (e.g. a meaningful share of drawers return weekly), add Pose tags → Draw Pro.
3. Teacher plan only if asked for / signs of classroom use.

**Suggested next step:** web MVP first (setup screen + runner, no DB). A good first openCode task. Then port to mobile.
