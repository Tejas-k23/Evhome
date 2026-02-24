import React, { useEffect, useRef, useCallback, memo } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * AnimationEffects Component - OPTIMIZED VERSION
 * 
 * Performance optimizations:
 * - Removed heavy canvas particle system
 * - Uses pure CSS animations (GPU accelerated)
 * - Minimal DOM manipulation
 * - Efficient IntersectionObserver usage
 * - Respects prefers-reduced-motion
 * - Properly handles route changes
 */

const AnimationEffects = memo(({ children }) => {
  const observerRef = useRef(null);
  const location = useLocation();

  // Efficient IntersectionObserver for reveal animations
  const initRevealObserver = useCallback(() => {
    // Disconnect existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // Instantly reveal all elements if reduced motion is preferred
      document.querySelectorAll('.gn-reveal, .gn-reveal-left, .gn-reveal-right, .gn-reveal-scale')
        .forEach(el => el.classList.add('gn-revealed'));
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('gn-revealed');
            // Unobserve after revealing for better performance
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -20px 0px'
      }
    );

    // Observe all reveal elements
    document.querySelectorAll('.gn-reveal, .gn-reveal-left, .gn-reveal-right, .gn-reveal-scale')
      .forEach(el => {
        // Reset revealed state for fresh animations on new pages
        if (!el.classList.contains('gn-revealed')) {
          observerRef.current?.observe(el);
        }
      });
  }, []);

  // Re-initialize animations when route changes
  useEffect(() => {
    // Small delay to ensure new page content is rendered
    const timer = setTimeout(() => {
      initRevealObserver();
    }, 50);

    return () => {
      clearTimeout(timer);
    };
  }, [location.pathname, initRevealObserver]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return (
    <>
      {/* Lightweight CSS-only background effects */}
      <div className="gn-bg-effects" aria-hidden="true">
        <div className="gn-gradient-orb gn-gradient-orb--1"></div>
        <div className="gn-gradient-orb gn-gradient-orb--2"></div>
      </div>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>
    </>
  );
});

AnimationEffects.displayName = 'AnimationEffects';

export default AnimationEffects;
