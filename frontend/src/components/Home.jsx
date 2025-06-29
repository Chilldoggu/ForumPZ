import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Container, Card } from "react-bootstrap";

const Home = ({ accessToken }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [threads, setThreads] = useState([]);
  const [lastVisitedThreads, setLastVisitedThreads] = useState([]);
  const [lastCommittedThreads, setLastCommittedThreads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const fetchThreads = async (query = "") => {
    try {
      const url = query
        ? `http://localhost:8000/api/threads/?search=${encodeURIComponent(query)}`
        : `http://localhost:8000/api/threads/`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const threadsData = await res.json();
        setThreads(threadsData);
      } else {
        console.error("Failed to fetch threads");
      }
    } catch (err) {
      console.error("Error loading threads:", err);
    }
  };

  useEffect(() => {
    const fetchProtectedData = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/protected/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const result = await response.json();
          setData(result);
        } else {
          const errorData = await response.json();
          setError(errorData.detail || "Access denied");
        }
      } catch (err) {
        setError("Server error");
      }
    };

    const loadSidebarData = () => {
      const storedVisited = JSON.parse(localStorage.getItem("visitedThreads")) || [];
      setLastVisitedThreads(storedVisited);
    };

    if (accessToken) {
      fetchProtectedData();
      fetchThreads();
      loadSidebarData();
    } else {
      setError("No token provided");
      loadSidebarData();
    }
  }, [accessToken]);

  useEffect(() => {
    if (data && data.email && threads.length > 0) {
      const committed = threads
        .filter(
          (thread) =>
            thread.comments &&
            thread.comments.some(
              (comment) => comment.authorEmail === data.email
            )
        )
        .map((t) => ({ id: t.id, title: t.title }));

      setLastCommittedThreads(committed);
      localStorage.setItem("committedThreads", JSON.stringify(committed));
    }
  }, [data, threads]);

  const handleThreadVisit = (thread) => {
    let visited = JSON.parse(localStorage.getItem("visitedThreads")) || [];
    visited = visited.filter((t) => t.id !== thread.id);
    visited.unshift({ id: thread.id, title: thread.title });
    visited = visited.slice(0, 10);
    localStorage.setItem("visitedThreads", JSON.stringify(visited));
    setLastVisitedThreads(visited);
    navigate(`/thread/${thread.id}`);
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
      <div
        className="d-flex flex-row justify-content-center align-items-center p-3 bg-light"
        style={{ minHeight: "10vh" }}
      >
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              fetchThreads(e.target.value);
            }
          }}
          className="w-50 form-control ms-auto align-content-lg-center"
        />
        <Button
          variant="primary"
          className="ms-2"
          onClick={() => fetchThreads(searchTerm)}
        >
          Search
        </Button>
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

      {accessToken ? (
        <div className="d-flex" style={{ minHeight: "80vh" }}>
          <div
            style={{
              flex: "0 0 20%",
              background: "grey",
              padding: "20px",
              overflowY: "auto",
              color: "white",
            }}
          >
            <h5>Menu</h5>
            {data ? (
              <>
                <p>Welcome, {data.email}</p>
                <hr />
                <div>
                  <h6>Last Visited</h6>
                  <ul className="list-unstyled">
                    {lastVisitedThreads.length > 0 ? (
                      lastVisitedThreads.slice(0, 4).map((thread) => (
                        <li key={thread.id}>
                          <Link
                            to={`/thread/${thread.id}`}
                            style={{ color: "white" }}
                          >
                            {thread.title}
                          </Link>
                        </li>
                      ))
                    ) : (
                      <li>No visits yet</li>
                    )}
                  </ul>
                </div>

              </>
            ) : (
              <p>{error}</p>
            )}
          </div>

          <div
            style={{
              flex: "1",
              padding: "20px",
              overflowY: "auto",
            }}
          >
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h3>Threads Feed</h3>
              <Link to="/createthread">
                <Button variant="primary">Create Thread</Button>
              </Link>
            </div>

            {threads.length === 0 ? (
              <p>No threads with such name</p>
            ) : (
              threads.map((thread) => (
                <Card
                  key={thread.id}
                  className="mb-3"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleThreadVisit(thread)}
                >
                  <Card.Body>
                    <div>
                      <Card.Title className="d-flex align-items-center">
                        {!thread.is_public && (
                          <span
                            role="img"
                            aria-label="Private thread"
                            style={{ color: "red", fontWeight: "bold", fontSize: "1.2em", marginRight: "8px" }}
                            title="Private thread"
                          >
                            🔒
                          </span>
                        )}
                        {thread.title}
                      </Card.Title>
                      <Card.Text>{thread.content}</Card.Text>
                    </div>
                  </Card.Body>
                </Card>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="d-flex align-content-lg-center justify-content-center">
          <p>Welcome to our Forum</p>
        </div>
      )}
    </Container>
  );
};

export default Home;
