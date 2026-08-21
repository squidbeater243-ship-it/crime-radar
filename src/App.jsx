import { Suspense, lazy, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import NavBar from './components/NavBar';
import SignupTakeover from './components/SignupTakeover';
import Footer from './components/Footer';
import PageTransition from './components/PageTransition';
import prefsService from './services/prefsService';
import isPrerendering from './utils/isPrerendering';

const HomePage = lazy(() => import('./pages/HomePage'));
const StateDetail = lazy(() => import('./pages/StateDetail'));
const ComparePage = lazy(() => import('./pages/ComparePage'));
const StateStatistics = lazy(() => import('./pages/StateStatistics'));
const About = lazy(() => import('./pages/About'));
const NotFound = lazy(() => import('./pages/NotFound'));
const OgCard = lazy(() => import('./pages/OgCard'));

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-cyan-400 border-white/10" />
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
        <Route path="/state-statistics" element={<PageTransition><StateStatistics /></PageTransition>} />
        <Route path="/compare" element={<PageTransition><ComparePage /></PageTransition>} />
        <Route path="/overview" element={<Navigate to="/compare" replace />} />
        <Route path="/area-scan" element={<Navigate to="/" replace />} />
        <Route path="/local-alerts" element={<Navigate to="/" replace />} />
        <Route path="/state/:stateName" element={<PageTransition><StateDetail /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/og/:slug" element={<OgCard />} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

// `/og/*` routes render a bare 1200x630 share-image surface (see OgCard) —
// none of the site's normal chrome (nav, signup modal, sound/alerts
// controls) belongs in that screenshot, so it's skipped entirely for those
// paths.
function AppShell({ signupOpen, onCloseSignup, onAlertsClick }) {
  const location = useLocation();
  const isOgRoute = location.pathname.startsWith('/og/');

  return (
    <>
      <ScrollToTop />
      {!isOgRoute && <NavBar onAlertsClick={onAlertsClick} />}
      {!isOgRoute && <SignupTakeover open={signupOpen} onClose={onCloseSignup} />}
      <Suspense fallback={<RouteFallback />}>
        <AnimatedRoutes />
      </Suspense>
      {!isOgRoute && <Footer />}
    </>
  );
}

function App() {
  const [signupOpen, setSignupOpen] = useState(false);

  useEffect(() => {
    if (!isPrerendering() && !prefsService.hasSeenSignupPrompt()) {
      setSignupOpen(true);
    }
  }, []);

  const closeSignup = () => {
    prefsService.setSeenSignupPrompt();
    setSignupOpen(false);
  };

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppShell signupOpen={signupOpen} onCloseSignup={closeSignup} onAlertsClick={() => setSignupOpen(true)} />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
