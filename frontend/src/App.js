import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Toaster } from "./components/ui/sonner";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useEffect, useState } from "react";
import Header from "./components/Header";
import GalleryPage from "./pages/GalleryPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyPage from "./pages/VerifyPage";
import DashboardPage from "./pages/DashboardPage";
import AdminPage from "./pages/AdminPage";
import "./App.css";

function AppContent() {
  return (
    <div className="min-h-screen bg-background">

      <Header />
      <main>
        <Routes>
          <Route path="/" element={<GalleryPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute adminOnly>
                <AdminPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      <Toaster position="top-right" richColors />
    </div>
    
  );
}
function App() {
  const API = process.env.REACT_APP_BACKEND_URL;
  const [files, setFiles] = useState([]);

  useEffect(() => {
    fetch(`${API}/api/files`)
      .then(res => res.json())
      .then(data => setFiles(data));
  }, []);

  return (
    <div>
      <h1>Repositorio</h1>

      {files.map((file, index) => (
        <div key={index}>
          <p>{file.name}</p>

          <img
            src={`${API}${file.url}`}
            alt={file.name}
            width="200"
          />
        </div>
      ))}
    </div>
  );
}

export default App;
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
function subirArchivo(e) {
  const file = e.target.files[0];

  const formData = new FormData();
  formData.append("file", file);

  fetch(`${API}/api/upload`, {
    method: "POST",
    body: formData,
  })
    .then(res => res.json())
    .then(() => window.location.reload());
}

export default App;
