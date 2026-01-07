import React, { useState, useRef, useEffect } from "react";
import api from "../services/api";
import { useSelector } from "react-redux";

export default function AiChatWidget() {
    const { user } = useSelector((state) => state.auth);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            sender: "ai",
            text: "👋 Hi there! I'm your AI Travel Assistant. Ask me anything about your next trip!",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { sender: "user", text: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await api.post("/ai/chat", { message: userMsg.text });
            const aiMsg = { sender: "ai", text: res.data.reply };
            setMessages((prev) => [...prev, aiMsg]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                { sender: "ai", text: "⚠️ Oops, I'm having trouble connecting right now." },
            ]);
        } finally {
            setLoading(false);
        }
    };

    // Only show if logged in (optional, remove check if public)
    if (!user) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col h-[500px] transition-all duration-300 ease-in-out transform origin-bottom-right">
                    {/* Header */}
                    <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
                        <h3 className="font-bold flex items-center gap-2">
                            <span>🤖</span> Travel Assistant
                        </h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white hover:text-gray-200 focus:outline-none"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`mb-4 flex ${msg.sender === "user" ? "justify-end" : "justify-start"
                                    }`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${msg.sender === "user"
                                            ? "bg-indigo-600 text-white rounded-br-none"
                                            : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start mb-4">
                                <div className="bg-white text-gray-500 rounded-2xl rounded-bl-none px-4 py-2 text-sm shadow-sm border border-gray-100">
                                    Thinking... 💭
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form
                        onSubmit={handleSend}
                        className="p-3 bg-white border-t border-gray-100 flex gap-2"
                    >
                        <input
                            type="text"
                            placeholder="Ask about a destination..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <svg
                                className="w-5 h-5 transform rotate-90"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                />
                            </svg>
                        </button>
                    </form>
                </div>
            )}

            {/* Toggle Button (FAB) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`${isOpen ? "bg-red-500 rotate-90" : "bg-indigo-600 hover:bg-indigo-700"
                    } text-white p-4 rounded-full shadow-lg transition-all duration-300 focus:outline-none flex items-center justify-center`}
            >
                {isOpen ? (
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                ) : (
                    <svg
                        className="w-8 h-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                    </svg>
                )}
            </button>
        </div>
    );
}
