import React from 'react';
import Container from '../components/Container';
import PageHeader from '../components/PageHeader';
import DashboardPage from './DashboardPage';

/**
 * LiveArena Page
 * Wraps the existing camera dashboard (MediaPipe vision, skeleton tracking,
 * real-time rep counter, workout/game/visibility panels) with a dedicated
 * route header.
 * 
 * Preserves 100% of camera, MediaPipe and pose-detection logic without modifications.
 * Uses unified Container and standard padding (pt-10 md:pt-14 pb-16).
 */
export default function LiveArena({ setIsOffline }) {
  return (
    <div className="pt-8 md:pt-12 pb-10 md:pb-14">
      <Container>
        <PageHeader
          title="Live Arena"
          subtitle="Step back in front of your camera, verify your body landmarks, and start your verified training session."
          breadcrumb={[{ label: 'Live Arena' }]}
        />

        {/* Existing camera + skeleton + workout dashboard */}
        <DashboardPage setIsOffline={setIsOffline} />
      </Container>
    </div>
  );
}
