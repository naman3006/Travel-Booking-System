// src/pages/Home.js (Enhanced with Tailwind - Hero + Cards)
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-toastify";

export default function Home() {
  const [destinations, setDestinations] = useState([]);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const res = await api.get("/destinations");
        setDestinations(res.data.slice(0, 6));
      } catch (err) {
        toast.error("Failed to load destinations");
      }
    };
    fetchDestinations();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Discover Your Next Adventure</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Explore breathtaking destinations and book unforgettable trips with ease.</p>
          <Link
            to="/destinations"
            className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors text-lg"
          >
            Explore Destinations
          </Link>
        </div>
      </section>

      {/* Top Destinations */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Featured Destinations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.map((dest) => (
              <div key={dest._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <img
                  src={dest.imageUrl || ""}
                  alt={dest.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">{dest.name}, {dest.country}</h3>
                  <p className="text-gray-600 mb-4">{dest.description?.substring(0, 100)}...</p>
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-500">⭐ {dest.rating || 4.5}</span>
                    <Link
                      to={`/destination/${dest._id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}