import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export interface ReactiveResultPanelProps {
  resultKey: string | number;
  children: React.ReactNode;
  className?: string;
  direction?: 'right' | 'up';
}

export const ReactiveResultPanel: React.FC<ReactiveResultPanelProps> = ({
  resultKey,
  children,
  className = '',
  direction = 'right',
}) => {
  const shouldReduceMotion = useReducedMotion();

  const initialVariant = shouldReduceMotion
    ? { opacity: 0 }
    : direction === 'right'
      ? { opacity: 0, x: 18, y: 4 }
      : { opacity: 0, y: 14 };

  const animateVariant = shouldReduceMotion
    ? { opacity: 1 }
    : { opacity: 1, x: 0, y: 0 };

  return (
    <motion.div
      key={resultKey}
      initial={initialVariant}
      animate={animateVariant}
      transition={{
        duration: shouldReduceMotion ? 0.12 : 0.26,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
