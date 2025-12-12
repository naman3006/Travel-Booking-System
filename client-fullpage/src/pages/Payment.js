import { useParams, useNavigate } from "react-router-dom";
import { useStripe } from "@stripe/react-stripe-js";
import api from "../services/api";
import { useEffect, useState } from "react";

const Payment = () => {
  const { id: bookingId } = useParams();
  const stripe = useStripe();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        console.log("Fetching booking ID:", bookingId);
        const { data } = await api.get(`/bookings/${bookingId}`);
        console.log("Booking loaded:", data);
        setBooking(data);
      } catch (err) {
        console.error("Fetch booking failed:", err);
        const msg =
          err.response?.data?.message ||
          err.message ||
          "Failed to load booking";
        setError(msg);
      }
    };
    if (bookingId) fetchBooking();
  }, [bookingId]);

  const handlePayment = async () => {
    if (!booking) return;
    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/payments/initiate", { bookingId });

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned from server.");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.response?.data?.message || err.message || "Payment failed");
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="payment-page p-8 text-center">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <button
          onClick={() => navigate("/bookings")}
          className="bg-gray-600 text-white px-4 py-2 rounded"
        >
          Back to Bookings
        </button>
      </div>
    );
  }

  if (!booking)
    return <div className="text-center py-10">Loading booking...</div>;

  return (
    <div className="payment-page max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Complete Payment</h2>
      <div className="space-y-3 text-gray-700">
        <p>
          <strong>Booking ID:</strong> {bookingId}
        </p>
        <p>
          <strong>Package:</strong> {booking.packageId?.title || "N/A"}
        </p>
        <p>
          <strong>Travelers:</strong> {booking.travelersCount}
        </p>
        <p className="text-xl font-bold text-green-600">
          Total: ₹{booking.totalAmount}
        </p>
      </div>

      <button
        onClick={handlePayment}
        disabled={loading || !stripe}
        className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold transition-colors"
      >
        {loading ? "Redirecting to Stripe..." : "Pay with Stripe"}
      </button>

      <p className="text-xs text-gray-500 text-center mt-4">
        Secure payment powered by Stripe
      </p>
    </div>
  );
};

export default Payment;
