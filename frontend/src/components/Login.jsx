import { useState } from "react";
import { Button, Form, Container } from 'react-bootstrap';
import {Link, useNavigate} from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8000/api/token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save the access token
        onLogin(data.access, data.refresh);
        setMessage("Login successful!");
        setTimeout(() => navigate('/home'), 1000);
      } else {
        setMessage(data.detail || "Login error");
      }
    } catch (err) {
      setMessage("Server error");
    }
  };


  return (

      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <Form onSubmit={handleSubmit} className="w-50">
                <h2 className="mb-4">LOGIN</h2>

                {message && (
                    <div className={`alert ${message === 'Login successful!' ? 'alert-success' : 'alert-danger'}`}>
                        {message}
                    </div>
                )}

                <Form.Group controlId="formBasicUsername" className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="text"
                        name="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="formBasicPassword" className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="password"
                        name="password"
                        autoComplete="off"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100">
                    Enter
                </Button>
                <div className="d-flex flex-column align-items-end gap-2">
                    <Link to="/register" className="text-decoration-none">
                        You don't have account?
                    </Link>
                    <Link to="/reset-password" className="text-decoration-none">
                        Forgot password?
                    </Link>
                </div>
            </Form>
        </Container>
  );
};

export default Login;