import React from 'react';
import Container from '../components/Container';
import PageHeader from '../components/PageHeader';
import FeaturesSection from '../components/FeaturesSection';

/**
 * Features Page
 * Dedicated page containing the 4 rich feature cards and interactive demo playground.
 * Uses unified Container and standard padding (pt-10 md:pt-14 pb-16).
 */
export default function FeaturesPage() {
  return (
    <div className="pt-8 md:pt-12 pb-10 md:pb-14">
      <Container>
        <PageHeader
          title="Arena Features"
          subtitle="Explore the high-speed computer vision systems that power FitNova."
          breadcrumb={[{ label: 'Features' }]}
        />
      </Container>

      {/* Render the full 4-card interactive features playground */}
      <FeaturesSection />
    </div>
  );
}
