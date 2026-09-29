// The /nostr-vs-* pages, in one place.
//
// These are top-level English routes (src/pages/nostr-vs-*.astro) with no
// [...lang] variants — see the gate in [...lang]/guides/index.astro. They are
// linked from the homepage; before that they had
// three in-content inbound links each, all from /guides/protocol-comparison and
// from one another, which left the site's most comparison-intent pages three
// clicks deep behind a single advanced guide.
//
// When they gain locale variants, add them to localizedLocales() in
// src/i18n/paths.ts and drop the English-only gate.
export const COMPARISON_PAGES = [
  {
    id: 'twitter',
    href: '/nostr-vs-twitter',
  },
  {
    id: 'mastodon',
    href: '/nostr-vs-mastodon',
  },
  {
    id: 'bluesky',
    href: '/nostr-vs-bluesky',
  },
] as const;
