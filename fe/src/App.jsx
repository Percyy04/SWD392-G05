import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Auth/Login";
import ForgetPassword from "./pages/Auth/Forgetpassword";
import Signup from "./pages/Auth/Signup";
import ResetPassword from "./pages/Auth/ResetPassword";
import Admin from "./pages/Admin/Admin";

// 🛡️ ProtectedRoute: chỉ cho phép truy cập khi có token và role hợp lệ
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) {
    // ❌ Chưa đăng nhập
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // ❌ Sai role (VD: Student vào /admin)
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ Hợp lệ
  return children;
};

// 🚫 Trang Unauthorized
function Unauthorized() {
  return (
      <div style={{ textAlign: "center", marginTop: "10%" }}>
        <h1>🚫Access denied</h1>
      <p>You do not have permission to access this page.</p>
      <a href="/" style={{ color: "blue" }}> Back to home page</a>
    </div>
  );
}

// 🔓 PublicRoute: chặn người đã đăng nhập quay lại Login
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (token && user.role) {
    switch (user.role) {
      case "Admin":
        return <Navigate to="/admin" replace />;
      case "Leader":
        return <Navigate to="/leader" replace />;
      case "Student":
        return <Navigate to="/student" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <Admin />
            </ProtectedRoute>
          }
        />

        {/* Nếu sau này bạn có trang Leader hoặc Student riêng */}
        {/* <Route
          path="/leader"
          element={
            <ProtectedRoute allowedRoles={["Leader", "Admin"]}>
              <LeaderPage />
            </ProtectedRoute>
          }
        /> */}

        {/* <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["Student", "Leader", "Admin"]}>
              <StudentPage />
            </ProtectedRoute>
          }
        /> */}

        {/* Trang báo lỗi quyền hạn */}
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </Router>
  );
}

export default App;
