
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Bell, Check, CheckCheck, Info, XCircle, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-toastify';

const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const { user } = useSelector((state) => state.auth);
    const socket = useSocket();
    const dropdownRef = useRef(null);

    // Fetch Notifications
    const fetchNotifications = async () => {
        try {
            const token = sessionStorage.getItem('access_token'); // Or session
            if (!token) return;

            const res = await axios.get('http://localhost:5000/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.isRead).length);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [user]);

    // Socket Listener for Updates
    useEffect(() => {
        if (!socket) return;

        const handleNewNotification = (data) => {
            // Re-fetch or append
            fetchNotifications(); // Simple approach: refresh all
        };

        socket.on('booking_status', handleNewNotification);
        socket.on('public_notification', handleNewNotification);
        socket.on('booking_cancelled', handleNewNotification);

        return () => {
            socket.off('booking_status', handleNewNotification);
            socket.off('public_notification', handleNewNotification);
            socket.off('booking_cancelled', handleNewNotification);
        };
    }, [socket]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markAsRead = async (id) => {
        try {
            const token = sessionStorage.getItem('access_token');
            await axios.patch(`http://localhost:5000/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update local state
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = sessionStorage.getItem('access_token');
            await axios.patch(`http://localhost:5000/notifications/read-all`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            toast.success('All notifications marked as read');
        } catch (error) {
            console.error('Error marking all read', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCheck className="text-green-500" size={20} />;
            case 'error': return <XCircle className="text-red-500" size={20} />;
            case 'warning': return <AlertTriangle className="text-yellow-500" size={20} />;
            default: return <Info className="text-blue-500" size={20} />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
                <Bell size={24} className="text-gray-700 dark:text-gray-300" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                                No notifications yet.
                            </div>
                        ) : (
                            <ul>
                                {notifications.map((notification) => (
                                    <li
                                        key={notification._id}
                                        className={`flex items-start px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0 ${!notification.isRead ? 'bg-blue-50 dark:bg-gray-800/50' : ''}`}
                                    >
                                        <div className="flex-shrink-0 mt-1">
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="ml-3 flex-1">
                                            <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-800 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(notification.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        {!notification.isRead && (
                                            <button
                                                onClick={() => markAsRead(notification._id)}
                                                className="ml-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                                title="Mark as read"
                                            >
                                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
