// pages/VerifyEmailPage.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

function VerifyEmailPage() {
  const { uid, token } = useParams();
  const [status, setStatus] = useState('verifying');
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://localhost:8000/api/verify-email/${uid}/${token}/`)
      .then((res) => {
        setStatus('success');
        setTimeout(() => navigate('/login'), 3000);
      })
      .catch((err) => {
        setStatus('error');
      });
  }, [uid, token, navigate]);

  return (
    <div style={{ padding: 20 }}>
      {status === 'verifying' && <p>Verifying your email...</p>}
      {status === 'success' && <p>Email verified! Redirecting to login...</p>}
      {status === 'error' && <p>Invalid or expired verification link.</p>}
    </div>
  );
}

export default VerifyEmailPage;
