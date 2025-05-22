import {
  HashRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import './App.css';
import PrivateRoute from './components/auth/PrivateRoute';
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

  return (
    <div className="container dark">
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
      <Main />
    </Router>
  );
}

export default App;
