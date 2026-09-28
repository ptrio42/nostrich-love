import { describe, expect, it } from 'vitest';
import { guideMatchesSearch, type GuideTopicId } from '../src/config/guide-topics';

const topicLabels: Record<GuideTopicId, string> = {
  bitcoin: 'Bitcoin',
  privacy: 'Prywatność',
  security: 'Bezpieczeństwo',
  relays: 'Przekaźniki',
  tools: 'Narzędzia',
  community: 'Społeczność',
};
const label = (topic: GuideTopicId) => topicLabels[topic];

describe('guide search', () => {
  it('finds broad references by a topic absent from their title and description', () => {
    const faq = { id: 'faq', title: 'Common questions', description: 'Answers about Nostr' };
    expect(guideMatchesSearch(faq, 'bitcoin', label)).toBe(true);
  });

  it('finds a guide by its translated topic name', () => {
    const privacy = { id: 'privacy-security', title: 'Protect your account', description: 'Practical steps' };
    expect(guideMatchesSearch(privacy, 'PRYWATNOŚĆ', label)).toBe(true);
  });

  it('keeps orientation guides in the full syllabus and searches their copy', () => {
    const introduction = { id: 'what-is-nostr', title: 'Nostr explained', description: 'Start here' };
    expect(guideMatchesSearch(introduction, '', label)).toBe(true);
    expect(guideMatchesSearch(introduction, 'explained', label)).toBe(true);
    expect(guideMatchesSearch(introduction, 'bitcoin', label)).toBe(false);
  });
});
