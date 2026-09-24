import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from 'axios';
import MainApp from "./MainApp.tsx";
import Login from "./components/Login.tsx";

// ✅ THIS LINE FIXES YOUR API CALLS
axios.defaults.baseURL = "http://localhost:5000";

function App() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
  }, []);

  const handleLogin = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <BrowserRouter>
      {token ? (
        <MainApp onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </BrowserRouter>
  );
}

export default App;