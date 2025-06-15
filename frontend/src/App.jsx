import { useState, useEffect } from 'react'
import './App.css'
import Register from './components/Register'
import Login from './components/Login'
import Home from './components/Home'
import VerifyEmailPage from './components/VerifyEmailPage'
import { Routes, Route } from 'react-router-dom'


//NOT TO STORE JWT IN LOCAL STORAGE, NEED TO CHANGE IT
function App() {
  const [accessToken, setAccessToken] = useState(() => {
    return localStorage.getItem("accessToken");
  });

  const handleLogin = (token, refresh) => {
    setAccessToken(token);
    localStorage.setItem("accessToken", token);
    localStorage.setItem("refreshToken", refresh);
  };

  return (
    <>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/home" element={<Home accessToken={accessToken} />} />
        <Route path="/verify-email/:uid/:token" element={<VerifyEmailPage />} />
      </Routes>
    </>
  );
}

export default App;
