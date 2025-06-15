import { useState } from "react";
import axios from "axios";
import ResetPasswordConfirm from "./ResetPasswordConfirm.jsx";

function ResetPasswordRequest() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:8000/api/password-reset/", { email });
    alert("Jeśli email jest poprawny, link do resetu został wysłany.");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" onChange={(e) => setEmail(e.target.value)} required />
      <button type="submit">Resetuj hasło</button>
    </form>
  );
}

export default ResetPasswordRequest;
