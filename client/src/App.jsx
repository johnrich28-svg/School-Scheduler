import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SuperAdminDashboard from "./pages/SuperAdmin";

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

// ProtectedRoute component for superadmin only
const ProtectedRoute = ({ children }) => {
  const userRole = getUserRole();
  return userRole === "superadmin" ? (
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

        {/* SuperAdmin protected route */}
        <Route
          path="/superadmin"
          element={
            <ProtectedRoute>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
