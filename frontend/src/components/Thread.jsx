import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Container, Card, ListGroup, Alert, Form, Button, Row, Col } from "react-bootstrap";

export default function Thread({ accessToken }) {
  const { id } = useParams();
  const [comments, setComments] = useState([]);
  const [threadTitle, setThreadTitle] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [allowedUsers, setAllowedUsers] = useState([]);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [newComment, setNewComment] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    fetchThreadAndComments();
  }, [id, accessToken]);

  const fetchThreadAndComments = async () => {
    try {
      const threadRes = await fetch(`http://localhost:8000/api/threads/${id}/title/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const threadData = await threadRes.json();
      setThreadTitle(threadData.title);
      setIsPublic(threadData.is_public);
      setIsOwner(threadData.is_owner);

      const res = await fetch(`http://localhost:8000/api/threads/${id}/comments/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      setComments(data);

      if (!threadData.is_public) {
        const allowedRes = await fetch(`http://localhost:8000/api/threads/${id}/allowedusers/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (allowedRes.ok) {
          const allowedData = await allowedRes.json();
          setAllowedUsers(allowedData);
        }
      }
    } catch (err) {
      setError("Error loading thread data");
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`http://localhost:8000/api/threads/${id}/comments/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (res.ok) {
        setNewComment("");
        setSuccessMsg("Comment added successfully!");
        setTimeout(() => setSuccessMsg(""), 3000);
        fetchThreadAndComments();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to add comment");
      }
    } catch (err) {
      setError("Error adding comment");
    }
  };

  const handleVote = async (commentId, value) => {
    try {
      await fetch(`http://localhost:8000/api/comments/${commentId}/vote/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ value }),
      });
      fetchThreadAndComments();
    } catch (err) {
      console.error("Vote error:", err);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUserEmail.trim()) return;

    try {
      const res = await fetch(`http://localhost:8000/api/threads/${id}/adduser/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ email: newUserEmail }),
      });

      if (res.ok) {
        setNewUserEmail("");
        fetchThreadAndComments();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to add user");
      }
    } catch (err) {
      setError("Error adding user");
    }
  };

  const handleRemoveAllowedUser = async (email) => {
    try {
      const res = await fetch(`http://localhost:8000/api/threads/${id}/removeuser/`, {
        method: "POST", // ✅ correct method per backend
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        fetchThreadAndComments();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to remove user");
      }
    } catch (err) {
      setError("Error removing user");
    }
  };

  const logout = async () => {
    const refresh = localStorage.getItem("refreshToken");

    try {
      await fetch("/api/logout/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ refresh_token: refresh }),
      });
    } catch (error) {
      console.error("Logout error", error);
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/home";
  };

  return (
    <Container fluid className="p-0" style={{ minHeight: "100vh" }}>
      {/* NAVBAR */}
      <div className="d-flex flex-row justify-content-center align-items-center p-3 bg-light" style={{ minHeight: "10vh" }}>
        <input type="text" placeholder="Search" className="w-50 form-control ms-auto" />
        <div className="ms-auto d-flex">
          {accessToken ? (
            <Button variant="secondary" className="me-2" onClick={logout}>Logout</Button>
          ) : (
            <>
              <Link to="/login">
                <Button variant="secondary" className="me-2">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button variant="secondary" className="me-2">Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* THREAD HEADER */}
      <Container className="mt-4">
        <Card className="mb-4">
          <Card.Body>
            <Card.Title>
              Comments for: <strong>{threadTitle || "Loading..."}</strong>
            </Card.Title>

            {!isPublic && (
              <div className="mt-3">
                <strong>Allowed Users:</strong>
                <ul className="mb-3">
                  {allowedUsers.map((email, index) => (
                    <li key={index} className="d-flex align-items-center justify-content-between">
                      <span>{email}</span>
                      {isOwner && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleRemoveAllowedUser(email)}
                        >
                          Remove
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>

                {isOwner && (
                  <Form onSubmit={handleAddUser}>
                    <Row className="align-items-center">
                      <Col xs={9}>
                        <Form.Control
                          type="email"
                          placeholder="Enter email to add"
                          value={newUserEmail}
                          onChange={(e) => setNewUserEmail(e.target.value)}
                          required
                        />
                      </Col>
                      <Col xs={3}>
                        <Button variant="primary" type="submit">Add</Button>
                      </Col>
                    </Row>
                  </Form>
                )}
              </div>
            )}
          </Card.Body>
        </Card>

        {error && <Alert variant="danger">{error}</Alert>}
        {successMsg && <Alert variant="success">{successMsg}</Alert>}

        {/* COMMENT FORM */}
        <Card className="mb-4">
          <Card.Body>
            <Form onSubmit={handleCommentSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Write a Comment</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                />
              </Form.Group>
              <Button variant="primary" type="submit">Post Comment</Button>
            </Form>
          </Card.Body>
        </Card>

        {/* COMMENTS LIST */}
        <Card>
          <Card.Body>
            <Card.Title>Comments ({comments.length})</Card.Title>
            <ListGroup variant="flush">
              {comments.map((comment) => (
                <ListGroup.Item key={comment.id} className="mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{comment.author}</strong>
                      <small className="ms-2 text-muted">({comment.author_rating ?? 0} pts)</small>
                    </div>
                    <small className="text-muted">{new Date(comment.created_at).toLocaleString()}</small>
                  </div>
                  <div className="mt-1">{comment.content}</div>
                  <div className="mt-2 d-flex align-items-center">
                    <Button variant="outline-success" size="sm" className="me-2" onClick={() => handleVote(comment.id, 1)}>
                      👍 {comment.likes ?? 0}
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleVote(comment.id, -1)}>
                      👎 {comment.dislikes ?? 0}
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card.Body>
        </Card>
      </Container>
    </Container>
  );
}
