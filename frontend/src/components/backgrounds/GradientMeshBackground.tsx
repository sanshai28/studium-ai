import React from 'react';

interface GradientMeshBackgroundProps {
  className?: string;
}

/**
 * Aurora Mesh Background
 * A CSS-animated gradient mesh with floating orbs for auth pages.
 * Uses GPU-accelerated transforms for smooth 60fps animation.
 */
const GradientMeshBackground: React.FC<GradientMeshBackgroundProps> = ({ className = '' }) => {
  return (
    <div className={`gradient-mesh-bg ${className}`}>
      {/* Animated mesh gradient base */}
      <div className="gradient-mesh-bg__mesh" />

      {/* Floating orbs */}
      <div className="gradient-mesh-bg__orb gradient-mesh-bg__orb--1" />
      <div className="gradient-mesh-bg__orb gradient-mesh-bg__orb--2" />
      <div className="gradient-mesh-bg__orb gradient-mesh-bg__orb--3" />
      <div className="gradient-mesh-bg__orb gradient-mesh-bg__orb--4" />
      <div className="gradient-mesh-bg__orb gradient-mesh-bg__orb--5" />

      {/* Center glow pulse */}
      <div className="gradient-mesh-bg__glow" />
    </div>
  );
};

export default GradientMeshBackground;
