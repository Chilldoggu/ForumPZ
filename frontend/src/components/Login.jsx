import { useState } from "react";
import { Button, Form, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");


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
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </Form.Group>

                 <div className="d-flex justify-content-between">
                    <Button variant="primary" type="submit" className="w-50 me-2">
                        Enter
                    </Button>
                    <Link to="/register" className="text-decoration-none">
                        You don't have account?
                    </Link>
                </div>
                <p>{message}</p>
            </Form>
        </Container>
  );
};

export default Login;