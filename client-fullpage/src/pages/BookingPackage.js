// src/pages/BookPackage.js
import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";

export default function BookPackage() {
  const { id } = useParams(); // packageId
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [pkg, setPkg] = useState(null);
  const [travelers, setTravelers] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const res = await api.get(`/packages/${id}`);
        setPkg(res.data);
      } catch (err) {
        toast.error("Package not found");
        navigate("/destinations");
      }
    };
    fetchPackage();
  }, [id, navigate]);

 
  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!user) {
    toast.error("Please log in to book");
    navigate("/login");
    return;
  }

  setLoading(true);
  try {
    const dto = {
      packageId: id,
      travelersCount: Number(travelers),
      startDate,
      endDate,
    };

    const { data } = await api.post("/bookings", dto);
    toast.success("Booking created! Redirecting to payment...");

    // GO TO PAYMENT PAGE
    navigate(`/payment/${data._id}`);
  } catch (err) {
    toast.error(err.response?.data?.message || "Booking failed");
  } finally {
    setLoading(false);
  }
};

  if (!pkg) return <p className="text-center py-10">Loading...</p>;

  return (
    <div className="py-16 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <Link to={`/package/${id}`} className="inline-block mb-6 text-blue-600 hover:underline">
          ← Back to Package
        </Link>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-4">{pkg.title}</h1>
          <p className="text-gray-600 mb-6">{pkg.description}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Travelers
              </label>
              <input
                type="number"
                min="1"
                value={travelers}
                onChange={(e) => setTravelers(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors font-semibold"
            >
              {loading ? "Booking..." : "Confirm Booking"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}