import { motion, useReducedMotion } from 'framer-motion';
import { EASE_OUT_STRONG } from '../utils/motion';

// Shared "fade in while rising slightly" entrance, used for every
// page-level and section-level reveal in the app. Consolidates what used
// to be 7 hand-typed copies of this same pattern (with drifted values)
// into one place, and is the one spot that needs to know about
// prefers-reduced-motion for all of them: reduced motion keeps the
// opacity fade (it aids comprehension) but drops the position change.
export default function FadeIn({ children, y = 16, duration = 0.4, delay = 0, exit = false, as = 'div', className, ...rest }) {
  const prefersReducedMotion = useReducedMotion();
  const offset = prefersReducedMotion ? 0 : y;

  const variants = {
    initial: { opacity: 0, y: offset },
    animate: { opacity: 1, y: 0, transition: { duration, delay, ease: EASE_OUT_STRONG } },
  };
  if (exit) {
    variants.exit = { opacity: 0, y: -offset, transition: { duration: duration * 0.7, ease: EASE_OUT_STRONG } };
  }

  const Component = motion[as];

  return (
    <Component
      initial="initial"
      animate="animate"
      exit={exit ? 'exit' : undefined}
      variants={variants}
      className={className}
      {...rest}
    >
      {children}
    </Component>
  );
}
