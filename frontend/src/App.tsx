import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import LoginPage from './pages/LoginPage';
import VerifyOtpPage from './pages/VerifyOtpPage';
import HomePage from './pages/HomePage'; // New HomePage
import DashboardPage from './pages/DashboardPage'; // Renamed HomePage
import Header from './components/Header';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <Router>
      <Toaster position="top-right" richColors />
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </Router>
  );
}

export default App;