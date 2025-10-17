import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Schedule from "./pages/Schedule";
import Speakers from "./pages/Speakers";
import Registration from "./pages/Registration";
import PaymentCallback from "./pages/PaymentCallback";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAttendees from "./pages/admin/AdminAttendees";
import AdminPaymentSummary from "./pages/admin/AdminPaymentSummary";
import PaymentSuccess from './pages/PaymentSuccess';
import AdminAuth from "./pages/admin/AdminAuth";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/speakers" element={<Speakers />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment/callback" element={<PaymentCallback />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/auth" element={<AdminAuth />} />
          <Route path="/admin/attendees" element={<AdminAttendees />} />
          <Route path="/admin/payments" element={<AdminPaymentSummary />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
