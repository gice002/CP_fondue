'use client';

import React from 'react';
import { motion, AnimatePresence, HTMLMotionProps } from 'motion/react';

export { motion, AnimatePresence };

export interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export interface SpringCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
}

export function SpringCard({ children, className = '', ...props }: SpringCardProps) {
  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2, ease: 'easeOut' } }}
      whileTap={{ scale: 0.99 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export interface SpringButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode;
  className?: string;
}

export function SpringButton({ children, className = '', ...props }: SpringButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function StaggerContainer({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            delayChildren: delay,
            staggerChildren: 0.06,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 14, scale: 0.98 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            type: 'spring',
            stiffness: 300,
            damping: 24,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
