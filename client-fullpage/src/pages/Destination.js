// src/pages/Destinations.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-toastify";

export default function Destinations() {
  const [destinations, setDestinations] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const res = await api.get("/destinations");
        setDestinations(res.data);
      } catch (err) {
        toast.error("Failed to load destinations");
      }
    };
    fetchDestinations();
  }, []);

  const filtered = destinations.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="py-16 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">
          All Destinations
        </h1>
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search destinations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md mx-auto px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((dest) => (
            <div
              key={dest._id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <img
                src={
                  dest.imageUrl ||
                  "https://via.placeholder.com/400x250?text=Destination"
                }
                alt={dest.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">
                  {dest.name}, {dest.country}
                </h3>
                <p className="text-gray-600 mb-4">
                  {dest.description?.substring(0, 100)}...
                </p>
                <Link
                  to={`/destination/${dest._id}`}
                  className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md text-center hover:bg-blue-700 transition-colors font-medium"
                >
                  Explore
                </Link>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 mt-8">
            No destinations found.
          </p>
        )}
      </div>
    </div>
  );
}
