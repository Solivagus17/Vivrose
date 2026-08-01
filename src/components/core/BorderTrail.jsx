'use client';
import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export function BorderTrail({
  className,
  size = 60,
  transition,
  onAnimationComplete,
  style,
}) {
  const defaultTransition = {
    repeat: Infinity,
    duration: 5,
    ease: 'linear',
  };

  return (
    <div
      className="absolute inset-0 border border-transparent"
      style={{
        pointerEvents: 'none',
        borderRadius: 'inherit',
        maskImage: 'linear-gradient(transparent, transparent), linear-gradient(#000, #000)',
        maskClip: 'padding-box, border-box',
        maskComposite: 'intersect',
        WebkitMaskImage: 'linear-gradient(transparent, transparent), linear-gradient(#000, #000)',
        WebkitMaskClip: 'padding-box, border-box',
        WebkitMaskComposite: 'xor',
      }}
    >
      <motion.div
        className={cn('mp-trail-dot absolute', className)}
        style={{
          width: size,
          height: size,
          offsetPath: `rect(0 auto auto 0 round ${size}px)`,
          ...style,
        }}
        animate={{ offsetDistance: ['0%', '100%'] }}
        transition={transition || defaultTransition}
        onAnimationComplete={onAnimationComplete}
      />
    </div>
  );
}
