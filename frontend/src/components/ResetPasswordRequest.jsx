import { useState } from "react";
import axios from "axios";
import { Form, Button, Container, Alert } from "react-bootstrap";

function ResetPasswordRequest() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:8000/api/password-reset/", { email });
      setMessage(
        "If the email is correct, you will receive a reset link shortly."
      );
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "80vh" }}>
      <h3 className="mb-4">Reset Your Password</h3>
      <Form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "400px" }}>
        <Form.Group controlId="formEmail" className="mb-4">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-control-lg"
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="btn-lg w-100">
          Send Reset Link
        </Button>
      </Form>

      {message && (
        <Alert
          variant={message.startsWith("If") ? "success" : "danger"}
          className="mt-4 w-100"
          style={{ maxWidth: "400px" }}
        >
          {message}
        </Alert>
      )}
    </Container>
  );
}

export default ResetPasswordRequest;
