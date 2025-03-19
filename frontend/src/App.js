import {
  HashRouter as Router,
  Route,
  Routes,
} from "react-router-dom"

import './App.css';
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import MembersListPage from './pages/MembersListPage'
import MemberPage from './pages/MemberPage'

function App() {
  return (
    <Router>
      <div className="container dark">
        <div className="app">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/members" element={<MembersListPage />} />
            <Route path="/member/:id" element={<MemberPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
