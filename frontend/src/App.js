import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom"

import './App.css';
import Header from './components/Header'
import MembersListPage from './pages/MembersListPage'
import MemberPage from './pages/MemberPage'

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<MembersListPage />} />
          <Route path="/member/:id" element={<MemberPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
