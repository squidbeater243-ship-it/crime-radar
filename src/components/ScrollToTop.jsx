import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Without this, navigating from a scrolled-down page (e.g. clicking a state
// near the bottom of the map) lands on the new page already scrolled down.
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
