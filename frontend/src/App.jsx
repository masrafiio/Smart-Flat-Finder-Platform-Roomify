import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import TenantProfilePage from "./pages/TenantProfilePage";
import LandlordProfilePage from "./pages/LandlordProfilePage";
import PropertyDetails from "./pages/PropertyDetails";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/property/:id"
        element={
          <ProtectedRoute>
            <PropertyDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tenant-profile"
        element={
          <ProtectedRoute requiredRole="tenant">
            <TenantProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/landlord-profile"
        element={
          <ProtectedRoute requiredRole="landlord">
            <LandlordProfilePage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
