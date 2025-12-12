// src/pages/admin/AdminReviewModeration.js (Fixed useNavigate import)
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function AdminReviewModeration() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    (async () => {
      try {
        const res = await api.get("/reviews"); // Assume endpoint for all reviews
        setReviews(res.data);
      } catch {
        toast.error("Failed to load reviews");
      } finally {
        setLoading(false);
      }
    })();
  }, [user, navigate]);

  const approveReview = async (id) => {
    try {
      await api.put(`/reviews/${id}/approve`);
      setReviews((prev) => prev.map((r) => r._id === id ? { ...r, isApproved: true } : r));
      toast.success("Review approved");
    } catch {
      toast.error("Failed to approve");
    }
  };

  return (
    <div className="py-16 px-4">
      <h1 className="text-3xl font-bold mb-8">Review Moderation</h1>
      {loading ? <p>Loading...</p> : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="bg-white p-4 rounded shadow">
              <p>{r.comment}</p>
              {!r.isApproved && <button onClick={() => approveReview(r._id)} className="bg-green-500 text-white px-4 py-2">Approve</button>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}