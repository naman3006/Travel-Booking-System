// src/pages/DestinationDetail.js (Enhanced with Tailwind - Layout with sections)
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-toastify";
import DestinationReviews from "../components/DestinationReviews";

export default function DestinationDetail() {
  const { id } = useParams();
  const [destination, setDestination] = useState(null);
  const [packages, setPackages] = useState([]);
  const [reviews, setReviews] = useState([]);

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const destRes = await api.get(`/destinations/${id}`);
        setDestination(destRes.data);

        // CORRECT ENDPOINT
        const pkgRes = await api.get(`/packages/destination/${id}`);
        console.log("Packages:", pkgRes.data); // Debug
        setPackages(pkgRes.data);

        const revRes = await api.get(`/reviews/destination/${id}`);
        setReviews(revRes.data);
      } catch (err) {
        toast.error("Failed to load data");
      }
    };
    fetchData();
  }, [id]);

  if (!destination)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  if (!destination)
    return (
      <p className="text-center py-10 text-red-500">Destination not found</p>
    );
  return (
    <div className="py-16 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <img
            src={
              destination.imageUrl ||
              "https://via.placeholder.com/1200x400?text=Destination"
            }
            alt={destination.name}
            className="w-full h-96 object-cover"
          />
          <div className="p-8">
            <h1 className="text-4xl font-bold mb-4 text-gray-800">
              {destination.name}, {destination.country}
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              {destination.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-2xl text-yellow-500">
                ⭐ {destination.rating || 4.5}
              </span>
              <Link
                to="/destinations"
                className="text-blue-600 hover:text-blue-800"
              >
                ← Back to Destinations
              </Link>
            </div>
          </div>
        </div>

        {/* Packages Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">
            Available Packages
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg._id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
              >
               <img
                src={
                  pkg.imageUrl ||
                  "https://via.placeholder.com/400x250?text=Destination"
                }
                alt={pkg.name}
                className="w-full h-48 object-cover"
              />
                <h3 className="text-xl font-semibold mb-2 text-gray-800">
                  {pkg.title}
                </h3>
                <p className="text-gray-600 mb-2">
                  Price:{" "}
                  <span className="font-bold text-green-600">₹{pkg.price}</span>
                </p>
                <p className="text-gray-600 mb-4">Duration: {pkg.duration}</p>
                <ul className="list-disc list-inside text-sm text-gray-600 mb-4">
                  {pkg.highlights?.slice(0, 3).map((hl, idx) => (
                    <li key={idx}>{hl}</li>
                  ))}
                </ul>
                <Link
                  to={`/package/${pkg._id}`}
                  className="w-full block bg-blue-600 text-white py-2 px-4 rounded-md text-center hover:bg-blue-700 transition-colors font-medium"
                >
                  Book Now
                </Link>
              </div>
            ))}
          </div>
        </section>

       <DestinationReviews destinationId={id} />
        <Link
          to={`/destinations/${id}/review`}
          className="inline-block mt-6 bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700"
        >
          Write a Review
        </Link>
      </div>
    </div>
  );
}
