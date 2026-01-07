// src/App.js
import React from "react";
import AppRouter from "./router/AppRouter";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css"; // Import Tailwind
import { SocketProvider } from "./context/SocketContext";
import AiChatWidget from "./components/AiChatWidget";

function App() {
  return (
    <SocketProvider>
      <AppRouter />
      <ToastContainer position="top-right" theme="colored" />
      <AiChatWidget />
    </SocketProvider>
  );
}

export default App;
