import confetti from 'canvas-confetti';

/**
 * Trigger celebratory confetti burst
 */
export function triggerSuccessConfetti() {
  if (typeof window === 'undefined') return;

  // Center burst
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.65 },
    colors: ['#2563eb', '#38bdf8', '#10b981', '#f59e0b', '#8b5cf6'],
  });

  // Dual cannons for dramatic flair
  setTimeout(() => {
    confetti({
      particleCount: 40,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ['#3b82f6', '#10b981', '#fbbf24'],
    });
    confetti({
      particleCount: 40,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ['#3b82f6', '#10b981', '#fbbf24'],
    });
  }, 200);
}

/**
 * Trigger gentle stars/sparkles confetti
 */
export function triggerSparklesConfetti() {
  if (typeof window === 'undefined') return;

  confetti({
    particleCount: 35,
    spread: 100,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.1,
    origin: { y: 0.6 },
    colors: ['#ffd700', '#ffb703', '#06d6a0', '#118ab2'],
  });
}
