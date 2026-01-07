import React, { useState } from "react";
import api from "../services/api";

export default function TripPlanner() {
    const [formData, setFormData] = useState({
        destination: "",
        days: "3",
        budget: "Mid-Range",
        interests: "",
    });
    const [itinerary, setItinerary] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setItinerary("");

        try {
            const res = await api.post("/ai/generate-itinerary", formData);
            setItinerary(res.data.itinerary);
        } catch (err) {
            setError("Failed to generate itinerary. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        AI Trip Planner 🤖
                    </h2>
                    <p className="mt-4 text-lg text-gray-500">
                        Tell us where you want to go, and we'll plan the perfect trip for you.
                    </p>
                </div>

                <div className="mt-12 bg-white shadow sm:rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label htmlFor="destination" className="block text-sm font-medium text-gray-700">
                                        Destination
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="text"
                                            name="destination"
                                            id="destination"
                                            required
                                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                            placeholder="e.g. Paris, Tokyo, Bali"
                                            value={formData.destination}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="days" className="block text-sm font-medium text-gray-700">
                                        Duration (Days)
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="number"
                                            name="days"
                                            id="days"
                                            min="1"
                                            max="14"
                                            required
                                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                            value={formData.days}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
                                        Budget
                                    </label>
                                    <div className="mt-1">
                                        <select
                                            id="budget"
                                            name="budget"
                                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                            value={formData.budget}
                                            onChange={handleChange}
                                        >
                                            <option>Budget-Friendly</option>
                                            <option>Mid-Range</option>
                                            <option>Luxury</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="interests" className="block text-sm font-medium text-gray-700">
                                        Interests (Optional)
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="text"
                                            name="interests"
                                            id="interests"
                                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                            placeholder="e.g. History, Food, Adventure, Museums"
                                            value={formData.interests}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {loading ? "Generating Plan..." : "Generate Itinerary"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {error && (
                    <div className="mt-8 bg-red-50 border-l-4 border-red-400 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {itinerary && (
                    <div className="mt-12 bg-white shadow sm:rounded-lg overflow-hidden">
                        <div className="px-4 py-5 sm:px-6 bg-indigo-50">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Your Custom Itinerary for {formData.destination}
                            </h3>
                        </div>
                        <div className="px-4 py-5 sm:p-6 prose prose-indigo max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: itinerary }} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
