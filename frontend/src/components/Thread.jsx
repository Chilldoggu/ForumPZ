import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Container, Card, ListGroup, Alert, Form, Button } from "react-bootstrap";

export default function Thread({ accessToken }) {
  const { id } = useParams();
  const [comments, setComments] = useState([]);
  const [threadTitle, setThreadTitle] = useState("");
  const [error, setError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const fetchThreadAndComments = async () => {
      try {
        const threadRes = await fetch(`http://localhost:8000/api/threads/${id}/title/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const threadData = await threadRes.json();
        setThreadTitle(threadData.title);

        const res = await fetch(`http://localhost:8000/api/threads/${id}/comments/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        setComments(data);
      } catch (err) {
        setError("Error loading comments");
      }
    };

    fetchThreadAndComments();
  }, [id, accessToken]);

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

        const updated = await fetch(`http://localhost:8000/api/threads/${id}/comments/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const updatedData = await updated.json();
        setComments(updatedData);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to add comment");
      }
    } catch (err) {
      setError("Error adding comment");
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
      {/* GÓRNY PASEK */}
      <div
        className="d-flex flex-row justify-content-center align-items-center p-3 bg-light"
        style={{ minHeight: "10vh" }}
      >
        <input
          type="text"
          placeholder="Search"
          className="w-50 form-control ms-auto align-content-lg-center"
        />
        <div className="ms-auto d-flex">
          {accessToken ? (
            <Button variant="secondary" className="me-2" onClick={logout}>
              Logout
            </Button>
          ) : (
            <>
              <Link to="/login">
                <Button variant="secondary" className="me-2">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="secondary" className="me-2">
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* TREŚĆ WĄTKU I KOMENTARZE */}
      <Container className="mt-4">
        <Card className="mb-4">
          <Card.Body>
            <Card.Title>
              Comments for: <strong>{threadTitle || "Loading..."}</strong>
            </Card.Title>
          </Card.Body>
        </Card>

        {error && <Alert variant="danger">{error}</Alert>}
        {successMsg && <Alert variant="success">{successMsg}</Alert>}

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
              <Button variant="primary" type="submit">
                Post Comment
              </Button>
            </Form>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <Card.Title>Comments ({comments.length})</Card.Title>
            <ListGroup variant="flush">
              {comments.map((comment) => (
                <ListGroup.Item key={comment.id} className="mb-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <strong>{comment.author}</strong>
                    <small className="text-muted">
                      {new Date(comment.created_at).toLocaleString()}
                    </small>
                  </div>
                  <div>{comment.content}</div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card.Body>
        </Card>
      </Container>
    </Container>
  );
}
