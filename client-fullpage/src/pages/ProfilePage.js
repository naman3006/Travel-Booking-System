
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Camera, Save, User, Mail, Shield, Edit2, Loader } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
// import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
    const { user } = useSelector((state) => state.auth);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        bio: '',
    });
    const [profileImage, setProfileImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(false);
    // const [imageLoading, setImageLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                email: user.email || '',
                bio: user.bio || '',
            });
            if (user.profilePicture) {
                // Ensure we handle absolute vs relative URLs if needed, but assuming relative from backend
                setPreviewImage(`http://localhost:5000${user.profilePicture}`);
            }
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = sessionStorage.getItem('access_token');
            const data = new FormData();
            data.append('fullName', formData.fullName);
            data.append('bio', formData.bio);
            if (profileImage) {
                data.append('file', profileImage);
            }

            const res = await axios.patch('http://localhost:5000/user/profile', data, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('Profile updated successfully!');
            // Force reload to update global state (simple way)
            // In a better app, we'd dispatch(updateUser(res.data))
            setTimeout(() => window.location.reload(), 1000);

        } catch (error) {
            console.error(error);
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="flex h-screen items-center justify-center"><Loader className="animate-spin text-blue-600" size={40} /></div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-3xl transform">

                    {/* Hero / Cover Section */}
                    <div className="h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
                        <div className="absolute inset-0 bg-black opacity-10"></div>
                        <div className="absolute bottom-4 right-6 text-white text-opacity-80 text-sm font-medium tracking-wide">
                            Member since {new Date(user.createdAt || Date.now()).getFullYear()}
                        </div>
                    </div>

                    <div className="px-8 pb-10">
                        {/* Profile Header */}
                        <div className="relative flex flex-col sm:flex-row items-center sm:items-end -mt-16 mb-8 sm:space-x-6">

                            {/* Avatar */}
                            <div className="relative group">
                                <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-gray-200 shadow-lg transition-transform transform group-hover:scale-105">
                                    <img
                                        src={previewImage || `https://ui-avatars.com/api/?name=${user.fullName}&background=random&size=256`}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />

                                    {/* Overlay for upload */}
                                    <label className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <Camera className="text-white" size={32} />
                                        <span className="sr-only">Upload Photo</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                    </label>
                                </div>
                                <div className="absolute bottom-2 right-2 bg-blue-600 p-2 rounded-full text-white shadow-md sm:hidden">
                                    <Camera size={16} />
                                </div>
                            </div>

                            {/* Name & Role */}
                            <div className="mt-4 sm:mt-0 text-center sm:text-left flex-1">
                                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                    {user.fullName}
                                </h1>
                                <div className="mt-1 flex items-center justify-center sm:justify-start space-x-2">
                                    <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
                                        {user.role === 'admin' ? <Shield size={14} className="mr-1.5" /> : <User size={14} className="mr-1.5" />}
                                        {user.role === 'admin' ? 'Administrator' : 'Traveler'}
                                    </span>
                                    <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center">
                                        <Mail size={14} className="mr-1" />
                                        {user.email}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Form Section */}
                        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto sm:mx-0">

                            <div className="grid grid-cols-1 gap-y-6 gap-x-4">
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Display Name
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Edit2 size={16} className="text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 rounded-lg py-3 dark:bg-gray-700 dark:text-white transition-shadow focus:shadow-md"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        About Me
                                    </label>
                                    <div className="mt-1">
                                        <textarea
                                            name="bio"
                                            rows="4"
                                            value={formData.bio}
                                            onChange={handleChange}
                                            placeholder="Share your travel interests, favorite destinations, or a little about yourself..."
                                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-lg p-3 dark:bg-gray-700 dark:text-white transition-shadow focus:shadow-md"
                                        ></textarea>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        Brief description for your profile. URLs are hyperlinked.
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end pt-6">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`
                                        flex items-center px-8 py-3 border border-transparent 
                                        text-base font-medium rounded-full shadow-lg text-white 
                                        bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 
                                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
                                        transform transition-all duration-200 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed
                                    `}
                                >
                                    {loading ? (
                                        <>
                                            <Loader size={20} className="animate-spin mr-2" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={20} className="mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
