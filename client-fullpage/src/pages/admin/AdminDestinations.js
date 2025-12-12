// src/pages/admin/AdminDestinations.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { toast } from "react-toastify";

export default function AdminDestinations() {
  const [destinations, setDestinations] = useState([]);
  const [form, setForm] = useState({
    name: "",
    country: "",
    description: "",
    imageUrl: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      const res = await api.get("/destinations");
      setDestinations(res.data);
    } catch (err) {
      toast.error("Failed to load destinations");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      uploadImage(file);
    }
  };

  const uploadImage = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file); // ← MUST BE 'image'

    try {
      const res = await api.post("/destinations/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((prev) => ({ ...prev, imageUrl: res.data.imageUrl }));
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error("Upload failed");
      console.error(err.response?.data);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.imageUrl) return toast.error("Upload an image first");

    setLoading(true);
    try {
      if (editingId) {
        await api.patch(`/destinations/${editingId}`, form);
        toast.success("Updated!");
      } else {
        await api.post("/destinations", form);
        toast.success("Created!");
      }
      setForm({ name: "", country: "", description: "", imageUrl: "" });
      setImagePreview(null);
      setEditingId(null);
      fetchDestinations();
    } catch (err) {
      toast.error("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this destination?"))
      return;
    try {
      await api.delete(`/destinations/${id}`);
      toast.success("Destination deleted");
      fetchDestinations();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleEdit = (dest) => {
    setForm({
      name: dest.name,
      country: dest.country,
      description: dest.description || "",
      imageUrl: dest.imageUrl || "",
    });
    setImagePreview(dest.imageUrl);
    setEditingId(dest._id);
  };


  return (
    <div className="py-16 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          Manage Destinations
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Form Column */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold mb-4">
                {editingId ? "Edit Destination" : "Add New Destination"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  name="name"
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, [e.target.name]: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  name="country"
                  placeholder="Country"
                  value={form.country}
                  onChange={(e) =>
                    setForm({ ...form, [e.target.name]: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
                <textarea
                  name="description"
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, [e.target.name]: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 h-24"
                  rows={3}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
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
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Saving..." : editingId ? "Update" : "Create"}
                </button>
              </form>
            </div>
          </div>

          {/* Table Column - ADD IMAGE PREVIEW */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Country
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {destinations.map((dest) => (
                    <tr key={dest._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <img
                          src={
                            dest.imageUrl ||
                            "https://via.placeholder.com/80x60?text=No+Image"
                          }
                          alt={dest.name}
                          className="w-20 h-15 object-cover rounded"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {dest.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {dest.country}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(dest)}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(dest._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                        <Link
                          to={`/admin/destinations/${dest._id}/packages`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Packages
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
