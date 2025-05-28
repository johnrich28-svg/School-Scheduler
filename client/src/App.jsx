import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SuperAdminDashboard from "./pages/SuperAdmin";
import AdminDashboard from "./pages/Admin";

// Helper to get current user role from JWT
const getUserRole = () => {
  const token = localStorage.getItem("authToken");
  if (!token) return null;

  try {
    const { role } = JSON.parse(atob(token.split(".")[1]));
    return role;
  } catch (error) {
    return null;
  }
};

// ProtectedRoute component for role-based access
const ProtectedRoute = ({ allowedRoles, children }) => {
  const userRole = getUserRole();
  return allowedRoles.includes(userRole) ? (
    children
  ) : (
    <Navigate to="/login" replace />
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* SuperAdmin protected route (superadmin only) */}
        <Route
          path="/superadmin"
          element={
            <ProtectedRoute allowedRoles={["superadmin"]}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin protected route (admin only) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
