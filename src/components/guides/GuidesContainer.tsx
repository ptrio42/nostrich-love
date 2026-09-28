'use client';

import React, { useEffect, useId, useState } from 'react';
import { Search, SearchX } from 'lucide-react';
import { GuideSection } from './GuideSection';
import type { Guide, SkillLevel } from './GuideCard';
import { guideMatchesSearch } from '../../config/guide-topics';
import { type Locale, t as translate } from '../../i18n';

interface GuideLevelData {
  id: SkillLevel;
  guides: Guide[];
}

interface GuidesContainerProps {
  skillLevels: GuideLevelData[];
  locale: Locale;
  heading: string;
  intro: string;
}

function getLastViewedGuide(): { slug: string; timestamp: number } | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('nostrich-last-viewed');
    if (stored) {
      const data = JSON.parse(stored);
      return { slug: data.slug, timestamp: data.timestamp };
    }
  } catch (error) {
    console.error('Error reading last viewed guide:', error);
  }
  return null;
}

/** Server-render the full syllabus; hydrate only the search and reading state. */
export const GuidesContainer: React.FC<GuidesContainerProps> = ({
  skillLevels,
  locale,
  heading,
  intro,
}) => {
  const t = (key: string) => translate(key, locale);
  const searchInputId = useId();
  const [searchQuery, setSearchQuery] = useState('');
  const [inProgressGuideIds, setInProgressGuideIds] = useState<string[]>([]);

  useEffect(() => {
    const lastViewed = getLastViewedGuide();
    if (!lastViewed) return;

    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    if (lastViewed.timestamp > sevenDaysAgo) {
      setInProgressGuideIds([lastViewed.slug]);
    }
  }, []);

  const visibleGuideIds = React.useMemo(() => {
    if (!searchQuery.trim()) return null;

    const matches = new Set<string>();
    for (const level of skillLevels) {
      for (const guide of level.guides) {
        if (guideMatchesSearch(guide, searchQuery, (topic) => translate(`guideTopics.${topic}`, locale))) {
          matches.add(guide.id);
        }
      }
    }
    return matches;
  }, [skillLevels, searchQuery, locale]);

  return (
    <>
      <section className="border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,27rem)] lg:items-center lg:gap-16 lg:px-8 lg:py-10">
          <div>
            <h1 className="text-h1 font-bold text-gray-900 dark:text-white">{heading}</h1>
            <p className="mt-3 max-w-measure text-body text-gray-600 dark:text-gray-400">{intro}</p>
          </div>
          <div className="relative">
            <label htmlFor={searchInputId} className="sr-only">{t('ui.search.placeholder')}</label>
            <Search
              className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <input
              id={searchInputId}
              type="search"
              placeholder={t('ui.search.placeholder')}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-md border border-gray-200 bg-white py-3 pe-4 ps-11 text-body text-gray-900 placeholder-gray-500 transition-colors hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400 dark:hover:border-gray-700"
            />
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-8 dark:bg-gray-900 lg:py-10">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {visibleGuideIds !== null && visibleGuideIds.size === 0 ? (
            <div className="flex flex-wrap items-center gap-3 py-8">
              <SearchX className="h-5 w-5 text-gray-400 dark:text-gray-500" strokeWidth={1.5} aria-hidden="true" />
              <p className="text-body-sm text-gray-600 dark:text-gray-400">{t('ui.search.noResults')}</p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-body-sm font-medium text-primary-text underline underline-offset-2 dark:text-primary-400"
              >
                {t('guidesPage.clearSearch')}
              </button>
            </div>
          ) : (
            <div className="space-y-12">
              {skillLevels.map((level, levelIndex) => (
                <GuideSection
                  key={level.id}
                  level={level.id}
                  startIndex={skillLevels.slice(0, levelIndex).reduce((count, item) => count + item.guides.length, 0)}
                  totalCount={level.guides.length}
                  guides={level.guides}
                  inProgressGuideIds={inProgressGuideIds}
                  visibleGuideIds={visibleGuideIds}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default GuidesContainer;
