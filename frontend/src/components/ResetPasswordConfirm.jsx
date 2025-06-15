// ResetPasswordConfirm.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ResetPasswordConfirm() {
  const { uid, token } = useParams();
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:8000/api/password-reset-confirm/${uid}/${token}/`, { password });
      alert("Hasło zostało zresetowane.");
      navigate("/login");
    } catch {
      alert("Błąd: Link nieprawidłowy lub wygasł.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="password"
        placeholder="Nowe hasło"
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Zresetuj hasło</button>
    </form>
  );
}

export default ResetPasswordConfirm;
