import React, { useEffect, useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

export default function MyReviews() {
  const { user } = useSelector((state) => state.auth);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await api.get("/reviews/my");
        setReviews(res.data);
      } catch {
        toast.error("Failed to load your reviews");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (!user) return <p className="text-center py-8">Please log in.</p>;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h2 className="text-2xl font-bold mb-6">My Reviews</h2>

      {loading ? (
        <p className="text-center">Loading…</p>
      ) : reviews.length === 0 ? (
        <p className="text-center text-gray-600">No reviews yet.</p>
      ) : (
        <div className="space-y-6">
          {reviews.map((r) => (
            <div key={r._id} className="bg-white p-5 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{r.destinationId?.name || "Unknown Destination"}</h4>
                  <p className="text-sm text-gray-500">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  r.isApproved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                }`}>
                  {r.isApproved ? "Approved" : "Pending"}
                </span>
              </div>
              <div className="mt-3">
                <p className="font-medium">Rating: {r.rating}/5</p>
                <p className="mt-1">{r.comment}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}