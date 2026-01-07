import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { user } = useSelector((state) => state.auth);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (user) {
            // Connect to the backend socket
            const newSocket = io('http://localhost:5000'); // Ensure this matches your backend URL

            newSocket.on('connect', () => {
                console.log('✅ Connected to WebSocket');
                // Join user-specific room
                newSocket.emit('joinRoom', user.id);
            });

            // Listen for 'booking_status' (User)
            newSocket.on('booking_status', (data) => {
                console.log('🔔 Notification:', data);
                toast.info(data.message);
            });

            // Listen for 'new_booking' (Admin)
            if (user.role === 'admin') {
                newSocket.on('new_booking', (data) => {
                    console.log('🔔 Admin Notification:', data);
                    toast.success(data.message);
                });

                newSocket.on('booking_cancelled', (data) => {
                    console.log('🔔 Admin Notification (Cancel):', data);
                    toast.error(data.message); // Show cancellation in red/error toast
                });
            }

            // Listen for public broadcasts (Everyone)
            newSocket.on('public_notification', (data) => {
                console.log('🌍 Public Notification:', data);
                // Use a custom position or style for social proof
                toast.info(data.message, {
                    position: "bottom-left",
                    autoClose: 3000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "dark",
                });
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        }
    }, [user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
