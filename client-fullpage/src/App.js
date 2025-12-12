// src/App.js
import React from "react";
import AppRouter from "./router/AppRouter";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css"; // Import Tailwind

function App() {
  return (
    <>
      <AppRouter />
      <ToastContainer position="top-right" theme="colored" />
    </>
  );
}

export default App;
