
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

const VoiceNavigation = () => {
    const [isListening, setIsListening] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const recognitionRef = useRef(null);

    // Advanced Route Definitions with Keywords/Synonyms
    const routeMap = [
        {
            path: '/',
            keywords: ['home', 'landing', 'main page', 'start', 'welcome']
        },
        {
            path: '/profile',
            keywords: ['profile', 'account', 'my info', 'user details', 'avatar', 'bio', 'edit profile', 'picture']
        },
        {
            path: '/bookings',
            keywords: ['bookings', 'my trips', 'reservations', 'tickets', 'history', 'orders', 'booked']
        },
        {
            path: '/destinations',
            keywords: ['destinations', 'places', 'explore', 'packages', 'trips', 'tours', 'vacation', 'holiday', 'locations']
        },
        {
            path: '/ai-planner',
            keywords: ['planner', 'ai', 'artificial intelligence', 'itinerary', 'recommend', 'plan my trip', 'robot', 'assistant']
        },
        {
            path: '/my-reviews',
            keywords: ['reviews', 'my feedback', 'ratings', 'comments', 'opinions']
        },
        // Auth
        {
            path: '/login',
            keywords: ['login', 'log in', 'sign in', 'authenticate']
        },
        {
            path: '/register',
            keywords: ['register', 'sign up', 'create account', 'join', 'new user']
        },
        // Admin
        {
            path: '/admin/dashboard',
            keywords: ['admin', 'dashboard', 'control panel', 'analytics', 'statistics']
        },
        {
            path: '/admin/bookings',
            keywords: ['all bookings', 'manage bookings', 'admin bookings']
        },
        // Actions
        {
            path: 'LOGOUT_ACTION',
            keywords: ['logout', 'log out', 'sign out', 'leave', 'exit']
        }
    ];

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn("Voice navigation not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
            toast.info("Listening... Speak now 🎙️", { autoClose: 2000, hideProgressBar: true });
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase().trim();
            console.log("Heard:", transcript);
            processCommand(transcript);
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
            if (event.error === 'not-allowed') {
                toast.error("Microphone access blocked.");
            }
        };

        recognitionRef.current = recognition;
    }, [dispatch, navigate]);

    const processCommand = (transcript) => {
        // Find the best match
        // Heuristic: Check if any keyword exists in the transcript
        // Prioritize longer keyword matches to avoid false positives (e.g., "admin bookings" > "bookings")

        // Flatten the map to finding matches
        let matchedRoute = null;
        let matchedKeyword = "";

        for (const routeDef of routeMap) {
            for (const keyword of routeDef.keywords) {
                if (transcript.includes(keyword)) {
                    // If we already have a match, check if this one is more specific (longer)
                    if (keyword.length > matchedKeyword.length) {
                        matchedRoute = routeDef.path;
                        matchedKeyword = keyword;
                    }
                }
            }
        }

        if (matchedRoute) {
            if (matchedRoute === 'LOGOUT_ACTION') {
                toast.success(`Logging out...`);
                dispatch(logout());
                navigate('/login');
            } else {
                toast.success(`Navigating to ${matchedKeyword.toUpperCase()}...`);
                navigate(matchedRoute);
            }
        } else {
            // Fallback / No match
            toast.warn(`Sorry, I didn't understand "${transcript}". Try "Go to Profile" or "Show Destinations".`);
        }
    };

    const toggleListening = () => {
        if (!recognitionRef.current) {
            toast.error("Voice navigation not supported.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
    };

    if (!recognitionRef.current) return null;

    return (
        <div className="fixed bottom-6 left-6 z-50 group">
            <button
                onClick={toggleListening}
                className={`
                    p-4 rounded-full shadow-2xl transition-all duration-300 transform 
                    flex items-center justify-center
                    ${isListening
                        ? 'bg-red-500 animate-pulse ring-4 ring-red-300 scale-110'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-110'}
                    text-white
                    backdrop-blur-md bg-opacity-90 border border-white/20
                `}
                title="Voice Navigation"
            >
                {isListening ? <MicOff size={24} /> : <Mic size={24} />}
            </button>

            {/* Tooltip / Status */}
            <div className={`
                absolute left-16 bottom-2 bg-black/80 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap 
                backdrop-blur-md transition-all duration-300 origin-left
                ${isListening ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100'}
            `}>
                {isListening ? "Listening..." : "Click to Speak"}
            </div>
        </div>
    );
};

export default VoiceNavigation;
