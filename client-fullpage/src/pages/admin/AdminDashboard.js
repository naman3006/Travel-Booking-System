// src/pages/admin/AdminDashboard.js
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    bookings: 0,
    destinations: 0,
    payments: 0,
    reviews: 0,
  });
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]); // ← NEW

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes, reviewsRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/users"),
          api.get("/admin/reviews"),
        ]);
  
        setStats(statsRes.data);
  
        // ✅ Exclude admin users
        const filteredUsers = usersRes.data.filter((u) => u.role !== "admin");
        setUsers(filteredUsers);
  
        setReviews(reviewsRes.data);
      } catch (err) {
        toast.error("Failed to load dashboard");
      }
    };
  
    fetchData();
    const id = setInterval(fetchData, 30_000);
    return () => clearInterval(id);
  }, []);
  

  return (
    <div className="py-16 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {[
            { label: "Total Users", value: stats.users, color: "blue" },
            { label: "Bookings", value: stats.bookings, color: "green" },
            { label: "Destinations", value: stats.destinations, color: "purple" },
            { label: "Payments", value: stats.payments, color: "indigo" },
            { label: "Reviews", value: stats.reviews, color: "orange" }, // ← SHOWS COUNT
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white p-6 rounded-xl shadow-md text-center cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => item.label === "Reviews" && window.scrollTo(0, document.body.scrollHeight)}
            >
              <h3 className="text-lg font-semibold text-gray-600">{item.label}</h3>
              <p className={`text-3xl font-bold text-${item.color}-600`}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* All Users Table */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">All Users</h2>
          {users.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === "admin" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                          }`}
                        >
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Reviews Table – NEW */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Recent Reviews</h2>
            <Link to="/admin/reviews" className="text-blue-600 hover:text-blue-800 text-sm">
              View All
            </Link>
          </div>

          {reviews.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No reviews yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reviews.slice(0, 5).map((r) => ( // Show only 5 latest
                    <tr key={r._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {r.userId?.fullName || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {r.destinationId?.name || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-yellow-500">{"★".repeat(r.rating)}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {r.comment}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            r.isApproved
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {r.isApproved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link to="/admin/destinations" className="block text-blue-600 hover:text-blue-800">
                Manage Destinations
              </Link>
              <Link to="/admin/bookings" className="block text-blue-600 hover:text-blue-800">
                Manage Bookings
              </Link>
              <Link to="/admin/reviews" className="block text-blue-600 hover:text-blue-800">
                Moderate Reviews
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}