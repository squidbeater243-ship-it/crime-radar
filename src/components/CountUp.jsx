import { useEffect, useRef } from 'react';
import { animate, useMotionValue, useMotionValueEvent, useReducedMotion } from 'framer-motion';
import { EASE_OUT_STRONG } from '../utils/motion';

// Animates a number counting up from its previous value to `value` whenever
// `value` changes. Falls back to an instant jump when the user prefers
// reduced motion, so nothing here fights that OS-level setting.
export default function CountUp({ value, duration = 0.8, format, className }) {
  const numericValue = Number(value) || 0;
  const motionValue = useMotionValue(numericValue);
  const prefersReducedMotion = useReducedMotion();
  const spanRef = useRef(null);
  const render = (v) => (format ? format(v) : Math.round(v).toLocaleString());

  useEffect(() => {
    if (spanRef.current) spanRef.current.textContent = render(motionValue.get());
    // Only the initial mount needs to seed the DOM directly; every later
    // change is handled by the animate()/subscribe pair below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      motionValue.set(numericValue);
      if (spanRef.current) spanRef.current.textContent = render(numericValue);
      return undefined;
    }
    const controls = animate(motionValue, numericValue, { duration, ease: EASE_OUT_STRONG });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numericValue, prefersReducedMotion]);

  useMotionValueEvent(motionValue, 'change', (v) => {
    if (spanRef.current) spanRef.current.textContent = render(v);
  });

  return <span ref={spanRef} className={className} />;
}
