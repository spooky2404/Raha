import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Login from './pages/Login';
import DriverRegistration from './pages/DriverRegistration';
import DriverDashboard from './pages/DriverDashboard';
import Profile from './pages/Profile';
import History from './pages/History';
import Safety from './pages/Safety';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/AdminDashboard';
import PaymentMethods from './pages/PaymentMethods';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/driver/register" element={<DriverRegistration />} />
        <Route path="/driver/dashboard" element={<DriverDashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/history" element={<History />} />
        <Route path="/payment" element={<PaymentMethods />} />
        <Route path="/safety" element={<Safety />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}
