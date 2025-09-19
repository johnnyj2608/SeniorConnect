import {
  HashRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router";

import './App.css';
import './i18n';
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import AppProviders from './context/AppProviders';
import usePreferences from './hooks/usePreferences';
import PrivateRoute from './components/routes/PrivateRoute';
import ScrollUp from './components/routes/ScrollUp';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import MemberPage from './pages/MemberPage';
import RegistryPage from './pages/RegistryPage';
import SettingsPage from './pages/SettingsPage';
import SupportPage from './pages/SupportPage';
import LoginPage from './pages/LoginPage';

function Main() {
  const location = useLocation();
  const isLoginPage = location.pathname.startsWith("/login");

  const isDarkMode = usePreferences("dark_mode");
  const language = usePreferences("language", "en");

  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (language && i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  return (
    <div className={`container${isDarkMode ? " dark" : ""}`}>
      <div className="app">
        {!isLoginPage && <Navbar />}
        <div className="app-content">
          <Routes>
            <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
            <Route path="/members/:id?" element={<PrivateRoute><MemberPage /></PrivateRoute>} />
            <Route path="/registry" element={<PrivateRoute><RegistryPage /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
            <Route path="/support/:section" element={<PrivateRoute><SupportPage /></PrivateRoute>} />
            <Route path="/login/*" element={<LoginPage />} />
            <Route
              path="*"
              element={
                <PrivateRoute>
                  <HomePage />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
        <footer className="app-footer">
          <p>
            {t('footer.copyright', {
              year: new Date().getFullYear(),
              title: 'Senior Connect',
            })}
          </p>
        </footer>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <ScrollUp />
      <AppProviders>
        <Main />
      </AppProviders>
    </Router>
  );
}

export default App;