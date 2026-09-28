import { SKILL_LEVELS } from '../data/learning-paths';

/**
 * Topic map for searching the guide syllabus by subject.
 *
 * SINGLE SOURCE OF TRUTH for which guide belongs to which topic. The guide set
 * is identical in all seven locales (same 16 slugs under src/content/guides/<locale>/),
 * so one map keyed by slug serves every locale.
 *
 * Titles and descriptions do not name every topic covered by a guide. The
 * search also matches these topic IDs and their translated labels, so a topic
 * query can find broad references such as the FAQ and tools directory.
 *
 * How topics were assigned: by what a guide is actually about, not by what it
 * mentions in passing. Two guides are deliberately broad because they really are
 * cross-cutting references whose top-level sections map one-to-one onto these
 * topics: faq (29 questions spanning keys, clients, relays, DMs, zaps and
 * finding people) and nostr-tools (a directory whose H2 sections are Key
 * Management, Media Hosting, Identity, Relay Tools, Lightning & Zaps, Privacy &
 * Security, Community Resources).
 *
 * Two guides carry no topic on purpose: what-is-nostr and protocol-comparison
 * are orientation pieces about the protocol as a whole. They remain visible
 * in the full syllabus and searchable by title or description.
 */

export const GUIDE_TOPIC_IDS = [
  'bitcoin',
  'privacy',
  'security',
  'relays',
  'tools',
  'community',
] as const;

export type GuideTopicId = (typeof GUIDE_TOPIC_IDS)[number];

const GUIDE_TOPICS = {
  // Beginner
  'what-is-nostr': [],
  'keys-and-security': ['security'],
  quickstart: ['tools'],
  'finding-community': ['community'],
  faq: ['bitcoin', 'privacy', 'security', 'relays', 'tools', 'community'],
  'relays-demystified': ['relays'],
  'outbox-model': ['relays'],

  // Intermediate
  'nip05-identity': ['tools'],
  'zaps-and-lightning': ['bitcoin'],
  'nostr-tools': ['bitcoin', 'privacy', 'security', 'relays', 'tools', 'community'],
  troubleshooting: ['relays', 'tools'],
  'multi-client': ['tools'],
  'relay-guide': ['relays'],

  // Advanced
  'privacy-security': ['privacy', 'security'],
  'nip17-private-messages': ['privacy', 'security'],
  'protocol-comparison': [],
} as const satisfies Record<string, readonly GuideTopicId[]>;

export type GuideSlug = keyof typeof GUIDE_TOPICS;

/** Topics for a guide slug. Unknown slugs get an empty list rather than throwing. */
export function getGuideTopics(slug: string): readonly GuideTopicId[] {
  return (GUIDE_TOPICS as Record<string, readonly GuideTopicId[]>)[slug] ?? [];
}

/** Match guide copy and localized topic names without changing syllabus order. */
export function guideMatchesSearch(
  guide: { id: string; title: string; description: string },
  query: string,
  topicLabel: (topic: GuideTopicId) => string
): boolean {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return true;

  const topics = getGuideTopics(guide.id);
  return [guide.title, guide.description, ...topics, ...topics.map(topicLabel)]
    .some((value) => value.toLocaleLowerCase().includes(normalizedQuery));
}

/**
 * Dev-only drift guard: a new guide without a topic entry might not appear in
 * subject searches. An empty topic list is explicit for orientation guides.
 */
if (import.meta.env?.DEV) {
  const missing = Object.values(SKILL_LEVELS)
    .flatMap((level) => level.sequence)
    .filter((slug) => !(slug in GUIDE_TOPICS));
  if (missing.length > 0) {
    console.warn(
      `[guide-topics] No topic entry for: ${missing.join(', ')}. ` +
        'Add a topic list so subject search includes these guides.'
    );
  }
}
