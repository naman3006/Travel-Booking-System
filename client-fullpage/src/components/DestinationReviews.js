import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function DestinationReviews({ destinationId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/reviews/destination/${destinationId}`);
        setReviews(res.data);
      } catch {}
      setLoading(false);
    })();
  }, [destinationId]);

  if (loading) return <p className="text-center py-4">Loading reviews…</p>;
  if (reviews.length === 0) return <p className="text-center py-4 text-gray-600">No reviews yet.</p>;

  return (
    <section className="mt-12">
      <h3 className="text-2xl font-bold mb-6">Customer Reviews</h3>
      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r._id} className="bg-gray-50 p-5 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <p className="font-medium">{r.userId?.fullName || "Anonymous"}</p>
              <p className="text-sm text-gray-500">
                {new Date(r.createdAt).toLocaleDateString()}
              </p>
            </div>
            <p className="text-yellow-500">{"★".repeat(r.rating)} ({r.rating}/5)</p>
            <p className="mt-2 text-gray-700">{r.comment}</p>
          </div>
        ))}
      </div>
    </section>
  );
}