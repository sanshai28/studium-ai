import React from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import GradientMeshBackground from './GradientMeshBackground';
import ParticleBackground from './ParticleBackground';
import '../../styles/AnimatedBackground.css';

type BackgroundVariant = 'auth' | 'dashboard';

interface AnimatedBackgroundProps {
  variant: BackgroundVariant;
  className?: string;
}

/**
 * Animated Background Component
 * Renders the appropriate animated background based on the variant.
 * Respects user's reduced motion preferences for accessibility.
 */
const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  variant,
  className = '',
}) => {
  const prefersReducedMotion = useReducedMotion();

  // Show static fallback for users who prefer reduced motion
  if (prefersReducedMotion) {
    return (
      <div
        className={`animated-bg--static animated-bg--${variant} ${className}`}
        aria-hidden="true"
      />
    );
  }

  // Render the appropriate animated background
  if (variant === 'auth') {
    return <GradientMeshBackground className={className} />;
  }

  return <ParticleBackground className={className} />;
};

export default AnimatedBackground;
