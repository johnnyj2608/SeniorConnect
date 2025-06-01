import {
  HashRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { useContext } from "react";

import './App.css';
import { AuthContext } from "./context/AuthContext";
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
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  const isDarkMode = user?.preferences?.dark_mode ?? localStorage.getItem("dark_mode") === "true";

  return (
    <div className={`container ${isDarkMode ? "dark" : ""}`}>
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
      <Main />
    </Router>
  );
}

export default App;
