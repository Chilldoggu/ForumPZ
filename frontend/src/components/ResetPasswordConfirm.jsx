import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Button, Container, Alert } from 'react-bootstrap';

function ResetPasswordConfirm() {
  const { uid, token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords don't match.");
      return;
    }

    try {
      await axios.post(`http://localhost:8000/api/password-reset-confirm/${uid}/${token}/`, { password });
      setMessage('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch {
      setMessage('Weak password, should have 10 chars or more');
    }
  };

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "80vh" }}>
      <h3 className="mb-4">Set a New Password</h3>
      <Form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "400px" }}>
        <Form.Group controlId="formNewPassword" className="mb-4">
          <Form.Label>New Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter your new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-control-lg"
          />
        </Form.Group>

        <Form.Group controlId="formConfirmPassword" className="mb-4">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="form-control-lg"
          />
        </Form.Group>

        <Button variant="primary" type="submit" className="btn-lg w-100">
          Reset Password
        </Button>
      </Form>

      {message && (
        <Alert
          variant={message.includes('successful') ? 'success' : 'danger'}
          className="mt-4 w-100"
          style={{ maxWidth: "400px" }}
        >
          {message}
        </Alert>
      )}
    </Container>
  );
}

export default ResetPasswordConfirm;