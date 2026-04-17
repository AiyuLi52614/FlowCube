/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Focus from "./pages/Focus";
import PlanetSettings from "./pages/PlanetSettings";
import Universe from "./pages/Universe";
import SpiritOverlay from "./components/SpiritOverlay";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("flowcube_authenticated") === "true";
  });

  const handleLogin = () => {
    localStorage.setItem("flowcube_authenticated", "true");
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("flowcube_authenticated");
    setIsAuthenticated(false);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#050505] text-[#f5f5f5] font-sans selection:bg-[#F27D26]/30">
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route 
            path="/" 
            element={isAuthenticated ? <Home onLogout={handleLogout} /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/focus" 
            element={isAuthenticated ? <Focus /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/planet" 
            element={isAuthenticated ? <PlanetSettings /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/universe" 
            element={isAuthenticated ? <Universe /> : <Navigate to="/login" replace />} 
          />
        </Routes>
        <SpiritOverlay />
      </div>
    </BrowserRouter>
  );
}

