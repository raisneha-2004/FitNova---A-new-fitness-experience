import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop
 * Automatically scrolls window to (0, 0) on every route/pathname change.
 * Ensures new pages always open cleanly from the top.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant', // instant prevents jumping/mid-scroll glitch
    });
  }, [pathname]);

  return null;
}
