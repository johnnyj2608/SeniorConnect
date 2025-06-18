import {
  HashRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import './App.css';
import './i18n';
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MltcProvider } from './context/MltcContext';
import usePreferences from './hooks/usePreferences';
import PrivateRoute from './components/routes/PrivateRoute';
import ScrollUp from './components/routes/ScrollUp';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import MembersListPage from './pages/MembersListPage';
import MemberPage from './pages/MemberPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';

function Main() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  const isDarkMode = usePreferences("dark_mode");
  const language = usePreferences("language", "en");

  const { i18n } = useTranslation();

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
            <Route path="/members" element={<PrivateRoute><MembersListPage /></PrivateRoute>} />
            <Route path="/member/:id" element={<PrivateRoute><MemberPage /></PrivateRoute>} />
            <Route path="/reports" element={<PrivateRoute><ReportsPage /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <ScrollUp />
      <MltcProvider>
        <Main />
      </MltcProvider>
    </Router>
  );
}

export default App;