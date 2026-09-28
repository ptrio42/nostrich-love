import { useEffect } from 'react';
import { setLastViewedGuide } from '../../lib/progress';
import { recordActivity } from '../../utils/gamificationEngine';

interface ProgressTrackerProps {
  guideSlug: string;
  guideTitle: string;
}

/**
 * Progress Tracker Component
 * 
 * Integrates with the merged progress/gamification system.
 * Tracks guide views for the resume feature.
 */
export function ProgressTracker({ guideSlug, guideTitle }: ProgressTrackerProps) {
  useEffect(() => {
    // Track that user viewed this guide (for resume feature)
    setLastViewedGuide(guideSlug, guideTitle);
    
    // Record view activity (triggers streak)
    recordActivity('viewGuide');
    
  }, [guideSlug, guideTitle]);
  
  return null; // This is a tracking-only component
}
