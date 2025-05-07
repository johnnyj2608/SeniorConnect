import {
  HashRouter as Router,
  Route,
  Routes,
} from "react-router-dom"

import './App.css';
import Navbar from './components/layout/Navbar'
import HomePage from './pages/HomePage'
import MembersListPage from './pages/MembersListPage'
import MemberPage from './pages/MemberPage'
import ReportsPage from './pages/ReportsPage'

function App() {
  return (
    <Router>
      <div className="container dark">
        <div className="app">
          <Navbar />
          <div className="app-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/members" element={<MembersListPage />} />
              <Route path="/member/:id" element={<MemberPage />} />
              <Route path="/reports/" element={<ReportsPage />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
