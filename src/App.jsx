import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { nicheApps } from './config/nicheApps.js';
import { readThemePreference, writeThemePreference } from './lib/themePreference.js';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import HomeView from './components/HomeView.jsx';
import NicheAppPage from './components/NicheAppPage.jsx';

const LG_QUERY = '(min-width: 1024px)';

const App = () => {
  const navigate = useNavigate();
  const [themePreference, setThemePreference] = useState(() => readThemePreference());
  const [systemDark, setSystemDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [isLg, setIsLg] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(LG_QUERY).matches : true
  );
  const [isSidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(LG_QUERY).matches : true
  );
  const [dashboardSearch, setDashboardSearch] = useState('');

  useEffect(() => {
    const mq = window.matchMedia(LG_QUERY);
    const sync = () => setIsLg(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    setSidebarOpen(isLg);
  }, [isLg]);

  useEffect(() => {
    if (!isLg && isSidebarOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isLg, isSidebarOpen]);

  useEffect(() => {
    writeThemePreference(themePreference);
  }, [themePreference]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => setSystemDark(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const resolvedDark =
    themePreference === 'dark' ? true : themePreference === 'light' ? false : systemDark;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedDark);
  }, [resolvedDark]);

  const closeMobileSidebar = () => {
    if (typeof window !== 'undefined' && !window.matchMedia(LG_QUERY).matches) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-transparent">
      {!isLg && isSidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        themePreference={themePreference}
        isSidebarOpen={isSidebarOpen}
        nicheApps={nicheApps}
        onToggleSidebar={() => setSidebarOpen((open) => !open)}
        onThemePreferenceChange={setThemePreference}
        onNavigate={closeMobileSidebar}
      />

      <main
        className={`flex-1 min-w-0 transition-[padding] duration-300 ${isSidebarOpen ? 'lg:pl-64' : 'lg:pl-20'}`}
      >
        <Header
          searchQuery={dashboardSearch}
          onSearchChange={setDashboardSearch}
          mobileMenuOpen={isSidebarOpen}
          onMobileMenuToggle={() => setSidebarOpen((open) => !open)}
        />
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-h-[calc(100vh-64px)] w-full min-w-0">
          <Routes>
            <Route
              path="/"
              element={
                <HomeView
                  nicheApps={nicheApps}
                  searchQuery={dashboardSearch}
                  onSelectApp={(id) => navigate(`/app/${id}`)}
                />
              }
            />
            <Route
              path="/app/:appId"
              element={<NicheAppPage nicheApps={nicheApps} />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default App;
