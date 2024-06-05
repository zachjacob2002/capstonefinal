// main.jsx

import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import Login from "./scenes/auth/login"; // Import the Login component
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SnackbarProvider } from "./context/SnackbarContext"; // Import the SnackbarProvider

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <SnackbarProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/app/*" element={<App />} />
        </Routes>
      </BrowserRouter>
    </SnackbarProvider>
  </React.StrictMode>
);
