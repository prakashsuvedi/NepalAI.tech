import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

interface CustomCursorProps {
  theme?: 'light' | 'dark';
}

export const CustomCursor: React.FC<CustomCursorProps> = ({ theme = 'dark' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [hoverLabel, setHoverLabel] = useState<string | null>(null);

  // Raw mouse coordinates
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth spring physics for natural trailing effect
  const springConfig = { damping: 24, stiffness: 320, mass: 0.4 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Check if device supports fine hover (desktop mouse)
    const isPointerFine = window.matchMedia('(pointer: fine)').matches;
    if (!isPointerFine) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => {
      setIsVisible(false);
      setIsHovered(false);
    };

    // Target elements that trigger interactive cursor expanding
    const handleElementHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactiveEl = target.closest(
        'button, a, input, select, textarea, [role="button"], [role="tab"], .cursor-interactive, .card-header-interactive, [data-cursor]'
      );

      if (interactiveEl) {
        setIsHovered(true);
        const customLabel = interactiveEl.getAttribute('data-cursor');
        setHoverLabel(customLabel || null);
      } else {
        setIsHovered(false);
        setHoverLabel(null);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousemove', handleElementHover, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.body.addEventListener('mouseenter', handleMouseEnter);
    document.body.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousemove', handleElementHover);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible, mouseX, mouseY]);

  // If invisible or on mobile/touchscreen devices, do not render DOM
  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden hidden md:block">
      {/* Outer Smooth Trailing Halo Ring */}
      <motion.div
        style={{
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isClicked ? 0.85 : isHovered ? 1.6 : 1,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className={`absolute rounded-full pointer-events-none transition-colors duration-200 flex items-center justify-center ${
          isHovered
            ? 'w-10 h-10 border border-emerald-400/80 bg-emerald-500/15 backdrop-blur-[1px] shadow-[0_0_15px_rgba(16,185,129,0.25)]'
            : theme === 'dark'
            ? 'w-7 h-7 border border-white/30 bg-white/[0.04]'
            : 'w-7 h-7 border border-slate-700/30 bg-slate-900/[0.04]'
        }`}
      >
        {hoverLabel && (
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-300 select-none">
            {hoverLabel}
          </span>
        )}
      </motion.div>

      {/* Center Precise Dot (Tracks raw coordinates without lag) */}
      <motion.div
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isClicked ? 0.6 : isHovered ? 0 : 1,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ duration: 0.1 }}
        className="absolute w-1.5 h-1.5 rounded-full bg-emerald-400 pointer-events-none shadow-[0_0_6px_#34d399]"
      />
    </div>
  );
};
