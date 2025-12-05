import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import TenantProfilePage from "./pages/TenantProfilePage";
import LandlordProfilePage from "./pages/LandlordProfilePage";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/tenant-profile" element={<TenantProfilePage />} />
      <Route path="/landlord-profile" element={<LandlordProfilePage />} />
    </Routes>
  );
};

export default App;
