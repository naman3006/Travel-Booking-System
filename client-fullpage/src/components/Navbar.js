import React from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";
import NotificationDropdown from "./NotificationDropdown";

export default function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold flex items-center">
              TravelHub
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-6">
            {/* Always visible */}
            <Link
              to="/destinations"
              className="hover:text-blue-200 transition-colors font-medium"
            >
              Destinations
            </Link>

            {/* ------------------- GUEST ------------------- */}
            {!user && (
              <>
                <Link
                  to="/login"
                  className="hover:text-blue-200 transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-green-500 hover:bg-green-600 px-4 py-1.5 rounded-md text-sm font-semibold transition-colors"
                >
                  Register
                </Link>
              </>
            )}

            {/* ------------------- USER ------------------- */}
            {user?.role === "user" && (
              <>
                <Link
                  to="/bookings"
                  className="hover:text-blue-200 transition-colors font-medium"
                >
                  My Bookings
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-sm font-medium hover:text-blue-200 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full border-2 border-white/30 group-hover:border-white overflow-hidden transition-all bg-gray-200">
                    <img
                      src={user?.profilePicture ? `http://localhost:5000${user.profilePicture}` : `https://ui-avatars.com/api/?name=${user?.fullName || 'User'}&background=random`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="hidden md:block">{user?.fullName?.split(' ')[0]}</span>
                </Link>
                <Link
                  to="/ai-planner"
                  className="hover:text-blue-200 transition-colors font-medium"
                >
                  Trip Planner 🤖
                </Link>
                <Link
                  to="/my-reviews"
                  className="hover:text-blue-200 transition-colors font-medium"
                >
                  My Reviews
                </Link>

                {/* Notifications */}
                <NotificationDropdown />

                <button
                  onClick={() => dispatch(logout())}
                  className="bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-md text-sm font-semibold transition-colors"
                >
                  Logout
                </button>
              </>
            )}

            {/* ------------------- ADMIN ------------------- */}
            {user?.role === "admin" && (
              <>
                <Link
                  to="/admin/dashboard"
                  className="hover:text-blue-200 transition-colors font-medium"
                >
                  Admin Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-sm font-medium hover:text-blue-200 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full border-2 border-white/30 group-hover:border-white overflow-hidden transition-all bg-gray-200">
                    <img
                      src={user?.profilePicture ? `http://localhost:5000${user.profilePicture}` : `https://ui-avatars.com/api/?name=${user?.fullName || 'Admin'}&background=random`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>
                <Link
                  to="/admin/bookings"
                  className="hover:text-blue-200 transition-colors font-medium"
                >
                  All Bookings
                </Link>
                <Link
                  to="/admin/reviews"
                  className="hover:text-blue-200 transition-colors font-medium"
                >
                  Reviews
                </Link>

                {/* Notifications */}
                <NotificationDropdown />

                <button
                  onClick={() => dispatch(logout())}
                  className="bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-md text-sm font-semibold transition-colors"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}