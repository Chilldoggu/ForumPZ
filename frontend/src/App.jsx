import { useState, useEffect } from 'react'
import './App.css'
import Register from './components/Register'
import Login from './components/Login'
import Home from './components/Home'
import { Routes, Route } from 'react-router-dom'


//NOT TO STORE JWT IN LOCAL STORAGE, NEED TO CHANGE IT
function App() {
  const [accessToken, setAccessToken] = useState(() => {
    return localStorage.getItem("accessToken");
  });

  const handleLogin = (token) => {
    setAccessToken(token);
    localStorage.setItem("accessToken", token); // ✅ сохраняем
  };

  return (
    <>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/home" element={<Home accessToken={accessToken} />} />
      </Routes>
    </>
  );
}

export default App;
