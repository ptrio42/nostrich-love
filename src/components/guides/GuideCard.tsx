import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Guide {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  difficulty: SkillLevel;
  href: string;
  tags?: string[];
}

export interface GuideCardProps {
  guide: Guide;
  isCompleted?: boolean;
  isInProgress?: boolean;
  position: number;
}

/** A course entry. Its number preserves the syllabus order when a filter is active. */
export const GuideCard: React.FC<GuideCardProps> = ({
  guide,
  isCompleted = false,
  isInProgress = false,
  position,
}) => {
  const { t, locale } = useTranslation();
  const displayPosition = new Intl.NumberFormat(locale, {
    minimumIntegerDigits: 2,
    useGrouping: false,
  }).format(position);
  const status = isCompleted
    ? t('guideCard.status.completed')
    : isInProgress
      ? t('guideCard.status.continueReading')
      : t('guideCard.status.startLearning');

  return (
    <a
      href={guide.href}
      className="group grid grid-cols-[2.5rem_minmax(0,1fr)_auto] gap-x-3 border-b border-gray-200 py-5 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:items-start sm:gap-x-6 sm:px-3"
      aria-label={`${displayPosition}. ${guide.title}. ${status}`}
    >
      <span className="font-display text-h2 tabular-nums text-gray-400 dark:text-gray-500" aria-hidden="true">
        {displayPosition}
      </span>

      <div className="min-w-0">
        <h3 className="text-h3 font-semibold text-gray-900 underline-offset-2 group-hover:underline dark:text-white">
          {guide.title}
        </h3>
        <p className="mt-1 max-w-measure text-body-sm text-gray-600 dark:text-gray-400">
          {guide.description}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-gray-500 dark:text-gray-400">
          {guide.estimatedTime && (
            <span>{guide.estimatedTime}</span>
          )}
          {(isCompleted || isInProgress) && (
            <span className={`inline-flex items-center gap-1.5 font-medium ${isCompleted ? 'text-success-700 dark:text-success-400' : 'text-primary-text dark:text-primary-400'}`}>
              {isCompleted && <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />}
              {status}
            </span>
          )}
        </div>
      </div>

      <span className="col-start-3 mt-1 inline-flex items-center text-primary-text dark:text-primary-400">
        <ArrowRight className="h-4 w-4 shrink-0 rtl:rotate-180" strokeWidth={1.5} aria-hidden="true" />
      </span>
    </a>
  );
};

export default GuideCard;
