// src/pages/UserReviewForm.js
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

export default function UserReviewForm() {
  const { destinationId } = useParams();          // from URL /destinations/:id/review
  const { user } = useAuth();                    // { userId, role, ... }
  const navigate = useNavigate();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  // -----------------------------------------------------------------
  // Submit review
  // -----------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast.error("You must be logged in");

    setLoading(true);
    try {
      await api.post("/reviews", {
        destinationId,
        rating: Number(rating),
        comment,
      });
      toast.success("Review submitted – it will appear after admin approval");
      setComment("");
      setRating(5);
      navigate(-1); // go back to destination page
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to submit review";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h2 className="text-2xl font-bold mb-6">Write a Review</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium mb-1">Rating</label>
          <select
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
            required
          >
            {[5, 4, 3, 2, 1].map((v) => (
              <option key={v} value={v}>
                {v} Star{v > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium mb-1">Comment</label>
          <textarea
            placeholder="Share your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            className="w-full border rounded-md px-3 py-2"
            required
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}