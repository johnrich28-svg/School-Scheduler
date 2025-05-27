import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SuperAdmin from "./pages/SuperAdmin"; // Your SuperAdmin component

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

// ProtectedRoute component for superadmin role only
const ProtectedRoute = ({ element: Element }) => {
  const userRole = getUserRole();
  return userRole === "superadmin" ? (
    <Element />
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

        {/* SuperAdmin only route */}
        <Route
          path="/superadmin"
          element={<ProtectedRoute element={SuperAdmin} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
