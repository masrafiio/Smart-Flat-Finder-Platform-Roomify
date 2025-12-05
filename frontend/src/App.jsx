import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import CustomerProfilePage from "./pages/CustomerProfilePage";
import OwnerProfilePage from "./pages/OwnerProfilePage";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/customer-profile" element={<CustomerProfilePage />} />
      <Route path="/owner-profile" element={<OwnerProfilePage />} />
    </Routes>
  );
};

export default App;
