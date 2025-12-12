import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

export default function PackageDetail() {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [pkg, setPkg] = useState(null);
  const [travelers, setTravelers] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const res = await api.get(`/packages/${id}`);
        setPkg(res.data);
      } catch (err) {
        toast.error("Failed to load package");
      }
    };
    fetchPackage();
  }, [id]);

  const handleBook = async () => {
    if (!user) {
      toast.error("Please login to book");
      navigate("/login");
      return;
    }

    if (!startDate || !endDate) {
      toast.error("Please select travel dates");
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      toast.error("End date must be after start date");
      return;
    }

    try {
      const payload = {
        packageId: id,
        travelersCount: travelers,
        startDate,
        endDate,
      };
      const res = await api.post("/bookings", payload);
      toast.success("Booking created successfully!");
      navigate(`/payment/${res.data._id}`);
    } catch (err) {
      toast.error(
        "Booking failed: " +
          (err.response?.data?.message || "Please check your input")
      );
    }
  };

  if (!pkg) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="py-16 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <img
          src={
            pkg.imageUrl || "https://via.placeholder.com/800x400?text=Package"
          }
          alt={pkg.title}
          className="w-full h-96 object-cover"
        />
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">{pkg.title}</h1>
          <p className="text-gray-600 mb-6">
            Destination: {pkg.destination?.name}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-2xl font-bold text-green-600 mb-2">
                Price: ₹{pkg.price} per person
              </p>
              <p className="text-gray-600">Duration: {pkg.duration}</p>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Number of Travelers
              </label>
              <input
                type="number"
                min="1"
                value={travelers}
                onChange={(e) => setTravelers(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div className="text-right mb-6">
            <p className="text-xl font-bold text-gray-800">
              Total: ₹{(pkg.price * travelers).toFixed(2)}
            </p>
          </div>
          <Link
            to="#"
            onClick={handleBook}
            className="block w-full bg-green-600 text-white py-3 px-6 rounded-lg text-center hover:bg-green-700 transition-colors font-semibold"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
}
