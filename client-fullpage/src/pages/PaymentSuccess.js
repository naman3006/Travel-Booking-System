import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // 🔥 Trigger refresh for Bookings.jsx
    localStorage.setItem("refreshBookings", "1");

    // Optional backend verification
    if (sessionId) {
      api.post("/payments/verify", { paymentId: sessionId }).catch((err) => {
        console.error("Payment verification failed:", err.response?.data || err.message);
      });
    }

    const timer = setTimeout(() => navigate("/bookings"), 1500);
    return () => clearTimeout(timer);
  }, [sessionId, navigate]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Payment Successful!</h2>
      <p>Redirecting to your bookings...</p>
    </div>
  );
};

export default PaymentSuccess;
