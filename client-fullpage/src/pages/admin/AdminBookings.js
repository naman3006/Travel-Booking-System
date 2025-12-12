// /* eslint-disable no-unused-vars */
// // src/pages/admin/AdminBookings.jsx
// import React, { useEffect, useState } from "react";
// import api from "../../services/api";
// import { toast } from "react-toastify";

// export default function AdminBookings() {
//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const fetchBookings = async () => {
//     setLoading(true);
//     try {
//       const res = await api.get("/bookings"); // ← This now includes payment
//       setBookings(res.data);
//     } catch (err) {
//       toast.error("Failed to load bookings");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchBookings();
//   }, []);

//   const updateStatus = async (id, status) => {
//     try {
//       await api.patch(`/bookings/${id}`, { status });
//       toast.success("Status updated");
//       fetchBookings();
//     } catch (err) {
//       toast.error("Failed to update status");
//     }
//   };

//   const deleteBooking = async (id) => {
//     if (!window.confirm("Delete this booking?")) return;
//     try {
//       await api.delete(`/bookings/${id}`);
//       toast.success("Booking deleted");
//       fetchBookings();
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Delete failed");
//     }
//   };

//   const getStatusBadge = (status) => {
//     const colors = {
//       confirmed: "bg-green-100 text-green-800",
//       pending: "bg-yellow-100 text-yellow-800",
//       cancelled: "bg-red-100 text-red-800",
//     };
//     return `inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
//       colors[status] || "bg-gray-100 text-gray-800"
//     }`;
//   };

//   const getPaymentBadge = (payment) => {
//     if (!payment) {
//       return (
//         <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
//           UNPAID
//         </span>
//       );
//     }
//     if (payment.status === "paid") {
//       return (
//         <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
//           PAID
//         </span>
//       );
//     }
//     return (
//       <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
//         FAILED
//       </span>
//     );
//   };

//   const formatDate = (date) => {
//     return date ? new Date(date).toLocaleDateString("en-IN") : "—";
//   };

//   return (
//     <div className="py-16 px-4 bg-gray-50 min-h-screen">
//       <div className="max-w-7xl mx-auto">
//         <h1 className="text-3xl font-bold mb-8 text-gray-800">
//           Manage Bookings (Admin)
//         </h1>

//         {loading ? (
//           <p className="text-center py-12 text-gray-600">Loading bookings...</p>
//         ) : (
//           <div className="bg-white rounded-xl shadow-md overflow-hidden">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     User
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Package
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Travelers / Total
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Status
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Payment
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Method
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Paid On
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {bookings.length === 0 ? (
//                   <tr>
//                     <td
//                       colSpan={8}
//                       className="px-6 py-12 text-center text-gray-500"
//                     >
//                       No bookings yet.
//                     </td>
//                   </tr>
//                 ) : (
//                   bookings.map((b) => (
//                     <tr
//                       key={b._id}
//                       className="hover:bg-gray-50 transition-colors"
//                     >
//                       {/* USER */}
//                       <td className="px-6 py-4 text-sm">
//                         <div className="font-medium text-gray-900">
//                           {b.userId?.fullName || "—"}
//                         </div>
//                         <div className="text-xs text-gray-500">
//                           {b.userId?.email || "—"}
//                         </div>
//                       </td>

//                       {/* PACKAGE */}
//                       <td className="px-6 py-4 text-sm font-medium">
//                         {b.packageId?.title || "—"}
//                       </td>

//                       {/* TRAVELERS / TOTAL */}
//                       <td className="px-6 py-4 text-sm">
//                         {b.travelersCount || 0} / ₹{b.totalAmount || 0}
//                       </td>

//                       {/* STATUS */}
//                       <td className="px-6 py-4">
//                         <span className={getStatusBadge(b.status)}>
//                           {b.status?.toUpperCase() || "PENDING"}
//                         </span>
//                       </td>

//                       {/* PAYMENT STATUS */}
//                       {/* <td className="px-6 py-4">
//                         {getPaymentBadge(b.paymentId)}
//                       </td> */}
//                       <td className="px-6 py-4">
//                         {b.paymentStatus === "paid" ? (
//                           <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
//                             PAID
//                           </span>
//                         ) : (
//                           <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
//                             UNPAID
//                           </span>
//                         )}{" "}
//                       </td>

//                       {/* PAYMENT METHOD */}
//                       <td className="px-6 py-4 text-sm">
//                         {b.paymentId?.gateway === "stripe" ? (
//                           <span className="inline-flex items-center">
//                             <span className="text-green-600 font-medium">
//                               Stripe
//                             </span>
//                           </span>
//                         ) : (
//                           <span className="text-gray-400">—</span>
//                         )}
//                       </td>

//                       {/* PAID ON */}
//                       <td className="px-6 py-4 text-xs text-gray-600">
//                         {b.paymentId?.paidAt
//                           ? formatDate(b.paymentId.paidAt)
//                           : "—"}
//                       </td>

//                       {/* ACTIONS */}
//                       <td className="px-6 py-4 text-sm">
//                         <div className="flex items-center space-x-3">
//                           <select
//                             value={b.status || "pending"}
//                             onChange={(e) =>
//                               updateStatus(b._id, e.target.value)
//                             }
//                             className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                           >
//                             <option value="pending">Pending</option>
//                             <option value="confirmed">Confirmed</option>
//                             <option value="cancelled">Cancelled</option>
//                           </select>

//                           <button
//                             onClick={() => deleteBooking(b._id)}
//                             className="text-red-600 hover:text-red-800 font-medium text-sm"
//                           >
//                             Delete
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


/* eslint-disable no-unused-vars */
// src/pages/admin/AdminBookings.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get("/bookings"); // ← This now includes payment
      setBookings(res.data);
    } catch (err) {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/bookings/${id}`, { status });
      toast.success("Status updated");
      fetchBookings();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const deleteBooking = async (id) => {
    if (!window.confirm("Delete this booking?")) return;
    try {
      await api.delete(`/bookings/${id}`);
      toast.success("Booking deleted");
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      confirmed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return `inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
      colors[status] || "bg-gray-100 text-gray-800"
    }`;
  };

  const getPaymentBadge = (payment) => {
    if (!payment) {
      return (
        <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
          UNPAID
        </span>
      );
    }
    if (payment.status === "paid") {
      return (
        <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
          PAID
        </span>
      );
    }
    return (
      <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
        FAILED
      </span>
    );
  };

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString("en-IN") : "—";
  };

  return (
    <div className="py-16 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          Manage Bookings (Admin)
        </h1>

        {loading ? (
          <p className="text-center py-12 text-gray-600">Loading bookings...</p>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Package
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Travelers / Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paid On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No bookings yet.
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <tr
                      key={b._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* USER */}
                      <td className="px-6 py-4 text-sm">
                        <div className="font-medium text-gray-900">
                          {b.userId?.fullName || "—"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {b.userId?.email || "—"}
                        </div>
                      </td>

                      {/* PACKAGE */}
                      <td className="px-6 py-4 text-sm font-medium">
                        {b.packageId?.title || "—"}
                      </td>

                      {/* TRAVELERS / TOTAL */}
                      <td className="px-6 py-4 text-sm">
                        {b.travelersCount || 0} / ₹{b.totalAmount || 0}
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-4">
                        <span className={getStatusBadge(b.status)}>
                          {b.status?.toUpperCase() || "PENDING"}
                        </span>
                      </td>

                      {/* PAYMENT STATUS */}
                      {/* <td className="px-6 py-4">
                        {getPaymentBadge(b.paymentId)}
                      </td> */}
                      <td className="px-6 py-4">
                        {b.paymentStatus === "paid" ? (
                          <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            PAID
                          </span>
                        ) : (
                          <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
                            UNPAID
                          </span>
                        )}{" "}
                      </td>

                      {/* PAYMENT METHOD */}
                      <td className="px-6 py-4 text-sm">
                        {b.paymentId?.gateway === "stripe" ? (
                          <span className="inline-flex items-center">
                            <span className="text-green-600 font-medium">
                              Stripe
                            </span>
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      {/* PAID ON */}
                      <td className="px-6 py-4 text-xs text-gray-600">
                        {b.paymentId?.paidAt
                          ? formatDate(b.paymentId.paidAt)
                          : "—"}
                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center space-x-3">
                          <select
                            value={b.status || "pending"}
                            onChange={(e) =>
                              updateStatus(b._id, e.target.value)
                            }
                            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>

                          <button
                            onClick={() => deleteBooking(b._id)}
                            className="text-red-600 hover:text-red-800 font-medium text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
