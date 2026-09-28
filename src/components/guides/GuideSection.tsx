'use client';

import React, { useState, useEffect, useId } from 'react';
import { GuideCard, type Guide } from './GuideCard';
import { LevelProgressBar } from './LevelProgressBar';
import { getCompletedGuidesInLevel } from '../../lib/progress';
import { useTranslation } from '../../hooks/useTranslation';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export interface GuideSectionProps {
  level: SkillLevel;
  startIndex: number;
  completedCount?: number;
  totalCount: number;
  guides: Guide[];
  completedGuideIds?: string[];
  inProgressGuideIds?: string[];
  visibleGuideIds?: ReadonlySet<string> | null;
}

// The 🌱 / 🚀 / ⚡ in tinted circles are gone, and with them the green/yellow/red
// per-level tints. Two reasons. The emoji only repeated the level name next to
// it, and green on this site means "completed" — a green ring on the Beginner
// header put the success colour on a section nobody had finished yet. Level is
// carried by the heading and the progress bar now; green stays semantic.

/**
 * GuideSection Component
 * Displays a skill level section with a header, progress bar, and ordered guide list.
 * Reads completion progress from localStorage
 */
export const GuideSection: React.FC<GuideSectionProps> = ({
  level,
  startIndex,
  completedCount: completedCountProp,
  totalCount,
  guides,
  completedGuideIds: completedGuideIdsProp,
  inProgressGuideIds = [],
  visibleGuideIds = null,
}) => {
  const { t } = useTranslation();
  const headingId = useId();
  
  const title = t(`skillLevels.${level}.title`);

  const [completedCount, setCompletedCount] = useState(completedCountProp ?? 0);
  const [completedGuideIds, setCompletedGuideIds] = useState<string[]>(completedGuideIdsProp ?? []);

  // Hydrate from localStorage on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {

      const completed = getCompletedGuidesInLevel(level);
      setCompletedCount(completed.length);
      setCompletedGuideIds(completed);
    }
  }, [level]);

  // Search changes visibility only; the original list determines each number.
  const visibleGuides = visibleGuideIds
    ? guides.filter((guide) => visibleGuideIds.has(guide.id))
    : guides;

  if (visibleGuides.length === 0) return null;

  // A numbered list exposes the course order and keeps it stable during search.
  return (
    <section
      className="border-t border-gray-200 pt-10 first:border-t-0 first:pt-0 dark:border-gray-800"
      aria-labelledby={headingId}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id={headingId} className="text-h2 font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          {completedCount === totalCount && (
            <span className="inline-flex items-center rounded-full border border-success-300 px-2.5 py-0.5 text-micro font-semibold uppercase text-success-700 dark:border-success-800 dark:text-success-400">
              {t('guideSection.complete')}
            </span>
          )}
        </div>
      </div>

      {completedCount > 0 && (
        <div className="mb-6">
          <LevelProgressBar completed={completedCount} total={totalCount} level={level} />
        </div>
      )}

      <ol className="border-t border-gray-200 dark:border-gray-800">
        {visibleGuides.map((guide) => (
          <li key={guide.id}>
            <GuideCard
              guide={guide}
              isCompleted={completedGuideIds.includes(guide.id)}
              isInProgress={inProgressGuideIds.includes(guide.id)}
              position={startIndex + guides.findIndex((item) => item.id === guide.id) + 1}
            />
          </li>
        ))}
      </ol>

    </section>
  );
};

export default GuideSection;
