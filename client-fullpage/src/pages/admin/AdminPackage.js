// src/pages/admin/AdminPackages.js
import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import { toast } from "react-toastify";

export default function AdminPackages() {
  const { destinationId } = useParams();
  const [packages, setPackages] = useState([]);
  const [destination, setDestination] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    duration: "",
    imageUrl: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const fetchDestination = useCallback(async () => {
    try {
      const res = await api.get(`/destinations/${destinationId}`);
      setDestination(res.data);
    } catch {
      toast.error("Failed to load destination");
    }
  }, [destinationId]);

  const fetchPackages = useCallback(async () => {
    try {
      const res = await api.get(`/packages/destination/${destinationId}`);
      console.log("Fetched packages:", res.data); // ← ADD THIS
      setPackages(res.data);
    } catch (err) {
      toast.error("Failed to load packages");
      console.error(err);
    }
  }, [destinationId]);

  useEffect(() => {
    if (destinationId) {
      fetchDestination();
      fetchPackages();
    }
  }, [destinationId, fetchDestination, fetchPackages]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      uploadImage(file);
    }
  };

  const uploadImage = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await api.post("/packages/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((prev) => ({ ...prev, imageUrl: res.data.imageUrl }));
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
      setImagePreview(null); // Clear preview on fail
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.imageUrl) return toast.error("Upload an image first");

    // src/pages/admin/AdminPackages.tsx  (inside handleSubmit)
    const payload = {
      ...form,
      price: Number(form.price), // ← force number
      destination: destinationId,
    };
    setLoading(true);

    try {
      if (editingId) {
        await api.patch(`/packages/${editingId}`, payload);
        toast.success("Package updated!");
      } else {
        await api.post("/packages", payload);
        toast.success("Package created!");
      }
      resetForm();
      fetchPackages();
    } catch (err) {
      // <-- NEW: show the exact backend message
      const msg =
        err.response?.data?.message || err.message || "Operation failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this package?")) return;
    try {
      await api.delete(`/packages/${id}`);
      toast.success("Package deleted");
      fetchPackages();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Delete failed";
      toast.error(msg);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      price: "",
      duration: "",
      imageUrl: "",
    });
    setImagePreview(null);
    setEditingId(null);
  };

  const handleEdit = (pkg) => {
    setForm({
      title: pkg.title,
      description: pkg.description || "",
      price: pkg.price.toString(),
      duration: pkg.duration,
      imageUrl: pkg.imageUrl || "",
    });
    setImagePreview(pkg.imageUrl || null);
    setEditingId(pkg._id);
  };

  if (!destination) return <p className="text-center py-8">Loading...</p>;

  return (
    <div className="py-16 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Packages for{" "}
            <span className="text-blue-600">{destination.name}</span>
          </h1>
          <p className="text-gray-600">{destination.country}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Form */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold mb-4">
                {editingId ? "Edit Package" : "Add Package"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  placeholder="Title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
                <textarea
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md h-24"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
                <input
                  placeholder="Duration"
                  value={form.duration}
                  onChange={(e) =>
                    setForm({ ...form, duration: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full"
                  />
                  {uploading && (
                    <p className="text-sm text-blue-600">Uploading...</p>
                  )}
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mt-3 w-full h-32 object-cover rounded-md"
                    />
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !form.imageUrl}
                  className="w-full bg-blue-600 text-white py-2 rounded-md disabled:opacity-50"
                >
                  {loading ? "Saving..." : editingId ? "Update" : "Create"}
                </button>
              </form>
            </div>
          </div>

          {/* Table */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {packages.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No packages yet. Create one!
                      </td>
                    </tr>
                  ) : (
                    packages.map((pkg) => (
                      <tr key={pkg._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <img
                            src={
                              pkg.imageUrl ||
                              "https://via.placeholder.com/80x60"
                            }
                            alt={pkg.title}
                            className="w-20 h-15 object-cover rounded"
                          />
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          {pkg.title}
                        </td>
                        <td className="px-6 py-4 text-sm">${pkg.price}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {pkg.duration}
                        </td>
                        <td className="px-6 py-4 text-sm space-x-2">
                          <button
                            onClick={() => handleEdit(pkg)}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(pkg._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}