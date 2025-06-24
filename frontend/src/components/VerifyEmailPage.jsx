// pages/VerifyEmailPage.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Alert, Spinner, Container } from 'react-bootstrap';

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
    <Container className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
    {status === 'verifying' && (
      <Alert variant="info" className="text-center w-50">
        <Spinner animation="border" size="sm" className="me-2" />
        Verifying your email...
      </Alert>
    )}

    {status === 'success' && (
      <Alert variant="success" className="text-center w-50">
        Email verified! Redirecting to login...
      </Alert>
    )}

    {status === 'error' && (
      <Alert variant="danger" className="text-center w-50">
        Invalid or expired verification link.
      </Alert>
    )}
  </Container>
  );
}

export default VerifyEmailPage;
