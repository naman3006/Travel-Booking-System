import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

export default function Bookings() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetch = async () => {
      try {
        const res = await api.get("/bookings/my");
        setBookings(res.data);
      } catch (err) {
        console.error("Bookings error:", err.response?.data);
        toast.error(err.response?.data?.message || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user, navigate, refreshTrigger]);

  useEffect(() => {
    const refresh = localStorage.getItem('refreshBookings');
    if (refresh) {
      localStorage.removeItem('refreshBookings');
      setRefreshTrigger(Date.now());
    }
  }, []);

  const cancel = async (id) => {
    try {
      await api.delete(`/bookings/${id}/cancel`);
      setBookings((prev) => prev.filter((b) => b._id !== id));
      toast.success("Booking cancelled");
    } catch {
      toast.error("Failed to cancel booking");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-gray-600">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="py-16 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">My Bookings</h1>

        {bookings.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            No bookings yet.{" "}
            <Link to="/destinations" className="text-blue-600 hover:underline">
              Explore packages!
            </Link>
          </p>
        ) : (
          <div className="space-y-6">
            {bookings.map((b) => {
              const isPaid = b.paymentStatus === "paid";
              const canPay = !isPaid && (b.status === "pending" || b.status === "confirmed");
              const canCancel = b.status !== "cancelled";

              return (
                <div
                  key={b._id}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {b.packageId?.title || "Unknown Package"}
                    </h3>
                    <div className="flex gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          b.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : b.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {b.status?.toUpperCase() || "PENDING"}
                      </span>
                      {isPaid ? (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          PAID
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          UNPAID
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                    <p>
                      <strong>Travelers:</strong> {b.travelersCount}
                    </p>
                    <p>
                      <strong>Total:</strong> ₹{b.totalAmount}
                    </p>
                    <p>
                      <strong>From:</strong>{" "}
                      {new Date(b.startDate).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>To:</strong>{" "}
                      {new Date(b.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    {canPay && (
                      <Link
                        to={`/payment/${b._id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium transition-colors"
                      >
                        Pay Now
                      </Link>
                    )}
                    {canCancel && (
                      <button
                        onClick={() => cancel(b._id)}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}