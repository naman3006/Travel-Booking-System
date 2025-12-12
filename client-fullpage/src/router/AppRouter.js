import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ForgotPassword from "../pages/ForgotPassword";
import VerifyOtp from "../pages/VerifyOtp";
import ResetPassword from "../pages/ResetPassword";
import Home from "../pages/Home";
import Destinations from "../pages/Destination"; 
import DestinationDetail from "../pages/DestinationDetail";
import PackageDetail from "../pages/PackageDetail";
import Bookings from "../pages/Bookings";
import Payment from "../pages/Payment";
import PaymentSuccess from "../pages/PaymentSuccess";
import PaymentCancel from "../pages/PaymentCancel";
import ReviewForm from "../pages/ReviewForm";
import MyReviews from "../pages/MyReviews";

// Admin
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminDestinations from "../pages/admin/AdminDestinations";
import AdminPackages from "../pages/admin/AdminPackage"; 
import AdminBookings from "../pages/admin/AdminBookings";
import AdminReviewModeration from "../pages/admin/AdminReviewModeration";

const PrivateRoute = ({ children, isAdminOnly = false }) => {
  const { user } = useSelector((state) => state.auth);
  if (!user) return <Navigate to="/login" />;
  if (isAdminOnly && user.role !== "admin") return <Navigate to="/" />;
  return children;
};

export default function AppRouter() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/destinations" element={<Destinations />} />
        <Route path="/destination/:id" element={<DestinationDetail />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />

        {/* Auth Required */}
        <Route
          path="/package/:id"
          element={
            <PrivateRoute>
              <PackageDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <PrivateRoute>
              <Bookings />
            </PrivateRoute>
          }
        />
        <Route
          path="/payment/:id"
          element={
            <PrivateRoute>
              <Payment />
            </PrivateRoute>
          }
        />
        <Route
          path="/destinations/:destinationId/review"
          element={
            <PrivateRoute>
              <ReviewForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-reviews"
          element={
            <PrivateRoute>
              <MyReviews />
            </PrivateRoute>
          }
        />

        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset" element={<ResetPassword />} />

        {/* Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute isAdminOnly>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/reviews"
          element={
            <PrivateRoute isAdminOnly>
              <AdminReviewModeration />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/destinations"
          element={
            <PrivateRoute isAdminOnly>
              <AdminDestinations />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/destinations/:destinationId/packages"
          element={
            <PrivateRoute isAdminOnly>
              <AdminPackages />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/packages"
          element={
            <PrivateRoute isAdminOnly>
              <AdminPackages />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <PrivateRoute isAdminOnly>
              <AdminBookings />
            </PrivateRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}