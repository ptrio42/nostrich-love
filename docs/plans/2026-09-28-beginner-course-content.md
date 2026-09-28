# Beginner Course Content Implementation Plan

> For implementation: work through the tasks in order in the current repository, review each changed guide in all seven locales, and preserve unrelated work already in the worktree.

**Goal:** Make the existing 16-guide course useful to people new to Nostr whether they first want to read, talk, publish, or understand how the network works.

**Architecture:** Keep the existing 16 slugs, three skill levels, progress data, and visual system. Improve the entry points, practical steps, prerequisite metadata, factual claims, and quiz questions in existing pages. Write the English source first, then update the six translations before considering a task complete.

**Tech Stack:** Astro, React, MDX content collections, JSON translations, Tailwind, Vitest.

---

## Decisions already made

- The audience is anyone starting on Nostr. An example about a writer or artist is fine; an instruction that assumes every reader publishes work is not.
- Keep `quickstart` as a first-post guide. It already leads from app installation to a checked post. Give readers a clear route to explore before posting through the existing discovery material.
- Preserve `src/data/learning-paths.ts` levels and guide order in this pass. Changing them also changes progress and certificate semantics for existing readers. Improve the path into and through the current guides instead.
- Improve existing content before adding a seventeenth guide. Long-form and media publishing are real gaps, but they serve a narrower task than first discovery and conversation.
- Preserve the existing visual redesign work. Content edits may change headings and layout density; they do not reopen the general card, graphic, or footer design decisions.
- No publishing, deployment, push to `main`, Nostr event publication, relay changes, or migration of saved progress is part of this plan.

## Evidence and priorities

| Priority | Finding in the repository | Reader cost | Work |
| --- | --- | --- | --- |
| P0 | `finding-community.mdx` requires `keys-and-security` and `quickstart`, although its follow-pack and explorer sections explicitly allow browsing without an account. | A new reader is warned that they skipped a post before they can find people. | Correct prerequisites and entry links. |
| P0 | The first sections of `finding-community.mdx` teach hashtags and relay feeds. Following people and replying appear much later, with no short task and completion check. | The most useful early action is buried in a roughly 2,100-word guide. | Rewrite the guide around a first useful feed and optional first reply. |
| P0 | `follow-pack.astro` opens with "You made an account. Now fill the feed" while the tool also advertises browsing without registration. | The public copy contradicts a valuable read-first route. | Align its introduction with both visitors and account holders. |
| P0 | `keys-and-security.mdx` says readers will be safer than 99% of users; `what-is-nostr.mdx` says no one can ban them; `zaps-and-lightning.mdx` describes payments as having no company in the middle. | Unqualified claims weaken trust and can distort security or payment decisions. | Source-backed corrections in all locales. |
| P1 | `faq.mdx` has 29 accordions and roughly 4,600 words, yet it is guide 5 in the beginner sequence. `relays-demystified`, `outbox-model`, and `relay-guide` repeat the missing-post and relay-list explanations. | Reference material feels like compulsory linear reading; repeated explanations compete and can disagree. | Make FAQ scannable and give each relay guide a distinct job. |
| P1 | The 13 quizzes contain 71 questions. The security quiz asks about wallets, persona separation, and relay strategy; community and troubleshooting quizzes include implausible distractors. | A pass can reward guessing or test material taught elsewhere. | Review every question against its own guide and rewrite the weak ones. |
| P1 | `troubleshooting.mdx` is a reference guide but carries `quickstart` and keys as prerequisites and sits in the intermediate sequence. | Someone with a broken first session sees a warning before help. | Remove false prerequisites and link to it at the point of failure. |
| P2 | Quickstart uses a phone app only. Media and long-form publication have mentions but no complete workflow. | Desktop-only and specialized publishers have a narrower route. | Add a verified desktop option; defer a new publishing guide until the core route is complete. |

These are repository observations, not analytics about how often real visitors encounter each issue. Priorities reflect the likely effect on a first visit and the risk of inaccurate advice.

## Task 0: Establish the execution baseline

**Files:** Read `CLAUDE.md`, `.agents/skills/nowy-poradnik/SKILL.md`, `docs/internal/TEACHING_METHODS.md`, `docs/internal/CONTENT_TRANSLATION.md`, `docs/internal/VISUAL_SYSTEM.md`; inspect target-file diffs before editing.

1. Run `git status --short` and record which target files already have unrelated edits. Do not reset or overwrite them.
2. Read `src/data/learning-paths.ts`, `src/i18n/paths.ts`, and `src/config/locales.ts` before changing links or locale copy.
3. Confirm all 16 guide slugs exist in each locale. Treat `en` as the source for the editorial pass.
4. Preserve quiz question IDs and guide slugs unless a concrete correctness problem requires changing them. Saved progress is keyed to guides and quiz outcomes.

**Done when:** The starting diff and guide inventory are known, and no task depends on moving guides between levels or changing progress storage.

## Task 1: Make reading and discovery a valid first action

**Files:** `src/content/guides/{en,pl,es,de,zh,ar,hi}/finding-community.mdx`, `src/content/guides/{en,pl,es,de,zh,ar,hi}/troubleshooting.mdx`, `src/pages/index.astro`, `src/pages/[...lang]/guides/index.astro`, `src/pages/follow-pack.astro`, `src/i18n/locales/*.json`, `src/i18n/types.ts` if new typed keys are needed.

1. Remove the `quickstart` and keys prerequisites from `finding-community` in all locales. Its account-free discovery instructions must stand alone. Remove the same prerequisites from `troubleshooting`, whose job is to help a reader who may be stuck before completing either guide.
2. Add a short task choice to the guide hub, using localized links: understand Nostr, find people to read, or publish a first post. Keep the existing course order and level display. Use `guidePath()` and translation data, never a literal `/en/` path or new hardcoded strings.
3. On the English homepage, make the existing first-steps area say clearly that readers can start by exploring people or by setting up an identity. Keep its current visual structure.
4. Change the follow-pack introduction so it welcomes someone browsing without an account and explains that following or importing requires an identity. Remove unsupported claims such as "number one reason beginners quit" and arbitrary follow-count targets unless a credible source supports them.
5. The follow-pack tool currently ships in English only. A localized discovery guide must remain useful without it. If linking to the tool from a non-English guide, label the tool's language clearly.

**Done when:** From `/guides/` and each localized guide hub, a first-time visitor can reach discovery without completing or being warned about Quickstart. The reader can understand what can be done before sign-in and what needs an identity. Check the rendered links for `en`, `pl`, and `ar`, including at a narrow viewport.

## Task 2: Rewrite Finding Community as an action guide

**Files:** `src/content/guides/{en,pl,es,de,zh,ar,hi}/finding-community.mdx`, its quiz strings in `src/i18n/locales/*.json`, and existing relevant descriptions in those locale files.

1. Open with a one-sentence outcome: find a few people worth reading and make the feed useful. State that posting is optional.
2. Put the shortest workable sequence first: choose an interest, open a few profiles, read recent posts, follow a few accounts if signed in, return to the feed, and reply to a post only if ready. After each step, say what the reader should see or what to try if it fails.
3. Give two concrete ways to discover accounts: search inside the chosen client and browse the site's curated follow pack. Verify any client-specific button labels against a current official interface; otherwise describe the action without inventing labels.
4. Move hashtags, relay feeds, long-form apps, events, and DM etiquette after the core task as optional discovery methods. Keep useful caveats, especially that clients and relay feeds differ.
5. Remove invented universal rules such as "50-100 follows", "80/20", a weekly posting minimum, mandatory hashtag counts, and "brand new accounts" as a blanket red flag. Replace with observable criteria: read recent posts, decide whether the person interests you, and adjust follows over time.
6. End with two checkable outcomes: a populated feed for a signed-in reader; several interesting profiles found for someone browsing without an account. Link to the specific empty-feed section of `troubleshooting`.
7. Rewrite the community quiz after the guide is stable. Ask about the action and its result, with plausible options. Keep the quiz IDs stable where possible.

**Done when:** A reader can finish the main task without learning relay configuration, posting on a schedule, or using a specific external tool. The guide still offers its deeper discovery material as optional reading. All seven locales preserve the same steps and safety caveats.

## Task 3: Remove friction from the first-use and help guides

**Files:** `src/content/guides/{en,pl,es,de,zh,ar,hi}/quickstart.mdx`, `.../keys-and-security.mdx`, `.../troubleshooting.mdx`, and `src/pages/[...lang]/guides/[slug].astro` only if a page-level link needs adjustment.

1. Preserve Quickstart's current first-post sequence and verification. Add a short link to the account-free discovery route before the installation step, without turning Quickstart into two full tutorials.
2. Verify a current browser client can create or reuse an identity and publish a text post. If verified, add a concise desktop option to Quickstart with the same safety and success checks. If current behavior cannot be verified, keep Quickstart explicitly phone-scoped and record the desktop gap rather than guessing app screens.
3. In the security guide, distinguish the minimum safe first backup from the optional stronger 3-2-1 setup. Avoid making a complex backup ceremony appear mandatory before someone can understand Nostr. Preserve the warning that `nsec` must remain private.
4. In troubleshooting, put first-session problems near the top and answer each with a symptom, likely cause, one action, and a visible check. Avoid a universal relay-count recipe or promising that a post is still available when storage has not been checked.
5. Keep contextual links from Quickstart and Finding Community to the exact help section. Do not move Troubleshooting between levels or alter completion data.

**Done when:** A mobile beginner can still complete the existing first-post task, a reader can find an alternative entry, and a person whose feed or post is missing reaches a usable fix without a prerequisite warning.

## Task 4: Audit claims that can change a security or payment decision

**Files:** English and localized versions of `what-is-nostr.mdx`, `keys-and-security.mdx`, `zaps-and-lightning.mdx`, `relays-demystified.mdx`, `outbox-model.mdx`, `privacy-security.mdx`, `nip17-private-messages.mdx`, plus affected FAQ answers and quiz strings. Record durable source notes in the existing `docs/internal/NOSTR_KNOWLEDGE.md` where useful.

1. Check every absolute claim about bans, portability, storage, deletion, key recovery, DM privacy, relay discovery, wallet custody, payment fees, and client interoperability. Name the conditions under which a benefit holds.
2. Correct "No one can ban you" and equivalent copy. [NIP-01](https://github.com/nostr-protocol/nips/blob/master/01.md) explicitly allows a relay to reject a publication, including for a ban. Explain that the identity can be reused with other relays while visibility still depends on where clients look.
3. Correct the claim that a zap has no company or service in the middle. [NIP-57](https://github.com/nostr-protocol/nips/blob/master/57.md) routes a request through the recipient's LNURL endpoint and wallet service. Describe the actual flow in beginner language and avoid blanket claims about fees.
4. Check diagrams and wording that say two people with no shared relay cannot see each other. [NIP-65](https://github.com/nostr-protocol/nips/blob/master/65.md) lets supporting clients discover an author's write relays; the result depends on client behavior and relay availability. Keep the specification's small-list guidance rather than flagging its 2-4 recommendation as an error.
5. Check current DM advice against [NIP-17](https://github.com/nostr-protocol/nips/blob/master/17.md) and current client documentation. Keep NIP-17's support status and client compatibility separate from the protocol's design. Do not claim that every Nostr DM has the same metadata properties.
6. Remove unsupported numerical or universal assurances, including "safer than 99%". For prices, client support, user counts, and product availability, use a dated primary source or replace the fragile detail with a durable decision rule.
7. Update all seven locale versions of a corrected claim in the same task. Check matching FAQ and quiz explanations before closing the item.

**Done when:** A claim about security, privacy, money, or availability has a primary source or clear qualification. No localized page retains a stronger claim than the corrected English source.

## Task 5: Give FAQ and relay guides distinct jobs

**Files:** `src/content/guides/{en,pl,es,de,zh,ar,hi}/{faq,relays-demystified,outbox-model,relay-guide}.mdx`, `src/i18n/locales/*.json` if descriptions change.

1. Make the FAQ a lookup page: group the 29 questions under clear headings or equivalent navigable anchors, answer each question immediately, and link to the relevant guide for detail. Remove repeated tutorials that force a reader to read the same setup in two places.
2. Make `relays-demystified` answer what a relay does and what to check when a post is missing. Keep the first explanation independent of NIP numbers or server administration.
3. Make `outbox-model` explain relay-list discovery to a curious reader, with its technical event example explicitly optional. Review claims that clients update or find relay lists automatically in every case.
4. Make `relay-guide` the place for deliberate relay configuration and operating trade-offs. Link back to the short explanation instead of repeating it.
5. Review the FAQ's links and anchors after editing. Keep its URL and its place in the course; do not change progress or certificate requirements in this pass.

**Done when:** The same beginner question has one primary answer and any deeper explanation is linked. A reader can find a specific FAQ answer without opening unrelated questions, and the three relay guides each have a clear purpose.

## Task 6: Review all quizzes against what their guide actually teaches

**Files:** Quiz objects under `guides` in `src/i18n/locales/{en,pl,es,de,zh,ar,hi}.json`; relevant guide paragraphs if a quiz exposes a content gap.

1. Inventory all 71 English questions in the 13 quiz-bearing guides. For each, record the guide section that teaches the answer and the decision or concept being assessed.
2. Replace questions that require another guide's material. In particular, keep wallet setup, persona separation, and relay strategy out of the first security quiz unless the security guide actually teaches the specific decision at that point.
3. Replace implausible distractors such as a Nostr headquarters, email support team, zodiac sign, or Tuesday-only DMs. Wrong choices should resemble mistakes a real beginner might make.
4. Replace protocol trivia in beginner quizzes when an action-oriented question can test the same understanding. Preserve advanced detail where the corresponding guide intentionally teaches it.
5. Keep question IDs and option IDs stable when changing wording. Recheck `correctId`, feedback, severity, and placeholder syntax: quiz copy uses `{{double}}` tokens.
6. Translate changed quiz copy into all six other locales, preserving the meaning and answer mapping. Run the existing parity and integrity tests.

**Done when:** Every quiz question is answerable from its own guide, has one defensible correct choice, and helps the reader make or understand a real decision. Existing saved quiz progress remains readable.

## Task 7: Maintenance pass on the remaining guides

**Files:** The remaining EN guides and their six translations: `nip05-identity`, `zaps-and-lightning`, `nostr-tools`, `multi-client`, `troubleshooting`, `privacy-security`, `nip17-private-messages`, `protocol-comparison`.

| Guide | Specific review |
| --- | --- |
| `nip05-identity` | Make optionality clear, check current provider features and dated prices, keep own-domain setup separate from the beginner choice. |
| `zaps-and-lightning` | Lead with sending and receiving, keep creator earning tactics optional, reconcile wallet custody and public-receipt advice with the quiz. |
| `nostr-tools` | Show what problem each tool solves, separate a short starter set from the directory, verify external links and service terms before recommending media hosting. |
| `multi-client` | Check what moves with the identity and what remains client-specific; keep backup and signing advice consistent with the security guide. |
| `troubleshooting` | Cross-check each fix against the guide that teaches the underlying concept; avoid loops between FAQ and relay pages. |
| `privacy-security` | Avoid declaring two identities the normal requirement for all readers; retain threat-model examples as examples. |
| `nip17-private-messages` | Keep the practical compatibility check visible before event kinds and crypto mechanics; date or source client support claims. |
| `protocol-comparison` | Date and source changing platform figures; keep protocol trade-offs separate from predictions or marketing conclusions. |

**Done when:** Each guide has a clear job in the course, optional specialist detail is identifiable, and fragile product facts are either sourced and dated or removed.

## Task 8: Translation, rendered-page, and documentation review

**Files:** All modified guide MDX and locale JSON files, `docs/internal/CONTENT_AUDIT_AND_KNOWLEDGE_MAP.md`, and existing documentation directly affected by changed guidance.

1. Compare every changed EN paragraph, warning, link, quiz answer, and frontmatter field with its six localized counterparts. Structural parity alone does not prove semantic parity.
2. Inspect the rendered guide hub, Quickstart, Finding Community, FAQ, and Troubleshooting in `en`, `pl`, and `ar` at approximately 360px and desktop width. Inspect one additional non-Latin locale for line wrapping and broken links. Confirm no text or controls overflow and RTL direction is correct.
3. Use `guidePath()` / `guidesIndexPath()` / `localePath()` for links in Astro and React. In MDX, use each guide's own locale path. English links remain unprefixed.
4. Update the existing content map's guide descriptions, counts, and priorities to match what ships. Its March 2026 counts and claims are currently stale; do not treat the old scorecard as a current measurement.
5. Run the complete project gates:

   ```bash
   npm run typecheck
   npm run test
   npm run build
   npm run check:links
   npm run verify-seo
   ```

6. Read build output for missing translation keys, not only the exit code. Run `git diff --check`. Verify no new guide slug, level change, progress migration, or `/en/` link entered the diff.

**Done when:** All gates pass, changed pages are readable at mobile and desktop widths, and the content map accurately describes the shipped material. Report any client behavior or translation nuance that could not be verified instead of inventing certainty.

## Completion standard

The pass is complete when a new visitor can choose to understand Nostr, discover people without first posting, or publish a first post; each route has a visible next action and a way to check the result. Safety and payment advice is qualified and sourced. Reference pages answer questions quickly. Quizzes test their own lessons. Every changed instruction exists in all seven guide locales. The 16-guide structure and saved progress remain intact.

Do not add a new media or long-form publishing guide during this pass. After the core work, re-evaluate that gap against the same task test: a verified end-to-end action that cannot fit clearly into an existing guide. Record the result in the content map for the next planning cycle.
