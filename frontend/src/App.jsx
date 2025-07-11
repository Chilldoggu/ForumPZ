import { useState, useEffect } from 'react'
import './App.css'
import Register from './components/Register'
import Login from './components/Login'
import Home from './components/Home'
import Thread from './components/Thread'
import ResetPasswordRequest from'./components/ResetPasswordRequest'
import ResetPasswordConfirm from'./components/ResetPasswordConfirm'
import VerifyEmailPage from './components/VerifyEmailPage'
import { Routes, Route } from 'react-router-dom'
import NotFound from './components/NotFound'
import CreateThreads from "./components/CreateThreads.jsx";


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
        <Route path="/reset-password" element={<ResetPasswordRequest />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPasswordConfirm />} />
        <Route path="/thread/:id" element={<Thread accessToken={accessToken} />} />
        <Route path="/*" element={<NotFound />} />
        <Route path="/createthread" element={<CreateThreads />} />
      </Routes>
    </>
  );
}

export default App;
