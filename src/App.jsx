import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Landing from './pages/Landing';
import Problem from './pages/Problem';
import Solution from './pages/Solution';
import HowItWorks from './pages/HowItWorks';
import Demo from './pages/Demo';
import VendorDemo from './pages/VendorDemo';
import Analytics from './pages/Analytics';
import TechSecurity from './pages/TechSecurity';
import Impact from './pages/Impact';
import Team from './pages/Team';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import AdminPlayground from './pages/AdminPlayground';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/problem" element={<Problem />} />
            <Route path="/solution" element={<Solution />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/vendor-demo" element={<VendorDemo />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/tech-and-security" element={<TechSecurity />} />
            <Route path="/impact" element={<Impact />} />
            <Route path="/team" element={<Team />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin-playground" element={<AdminPlayground />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
