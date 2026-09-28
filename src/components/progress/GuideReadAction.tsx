import { useEffect, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { isTrackingEnabled } from '../../lib/progressService';
import { isGuideCompleted } from '../../utils/gamification';
import { GAMIFICATION_UPDATED_EVENT, markGuideComplete } from '../../utils/gamificationEngine';

interface GuideReadActionProps {
  guideSlug: string;
}

export function GuideReadAction({ guideSlug }: GuideReadActionProps) {
  const { t } = useTranslation();
  const [completed, setCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isTrackingEnabled()) return;
    const sync = () => setCompleted(isGuideCompleted(guideSlug));
    sync();
    window.addEventListener(GAMIFICATION_UPDATED_EVENT, sync);
    return () => window.removeEventListener(GAMIFICATION_UPDATED_EVENT, sync);
  }, [guideSlug]);

  if (completed === null) return null;

  return (
    <section data-guide-read-action className="not-prose mt-10 border-t border-gray-200 pt-6 dark:border-gray-800">
      <p className="text-body-sm text-gray-600 dark:text-gray-300">
        {t('guideReadAction.prompt')}
      </p>
      {completed ? (
        <p aria-live="polite" className="mt-3 text-body-sm font-semibold text-success-700 dark:text-success-400">
          {t('guideReadAction.markedAsRead')}
        </p>
      ) : (
        <button
          type="button"
          onClick={() => setCompleted(markGuideComplete(guideSlug))}
          className="mt-3 inline-flex min-h-11 items-center rounded-md border border-gray-300 px-4 py-2 text-body-sm font-semibold text-gray-900 transition-colors hover:border-primary-600 hover:text-primary-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-gray-700 dark:text-white dark:hover:border-primary-400 dark:hover:text-primary-400"
        >
          {t('guideReadAction.markAsRead')}
        </button>
      )}
    </section>
  );
}
