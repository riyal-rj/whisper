import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import LoginPage from './pages/LoginPage';
import VerifyOtpPage from './pages/VerifyOtpPage';
import HomePage from './pages/HomePage';
import Header from './components/Header';

function App() {
  return (
    <Router>
      <Toaster position="top-right" richColors />
      <Header />
      <Routes>
        {/* <Route path="/home" element={<HomePage/>} /> */}
                <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        {/* Add other routes here */}
      </Routes>
    </Router>
  );
}

export default App;