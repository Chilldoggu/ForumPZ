import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Home({ accessToken }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    const fetchProtectedData = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/protected/", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
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

    const fetchThreads = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/threads/", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
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

    if (accessToken) {
      fetchProtectedData();
      fetchThreads();
    } else {
      setError("No token provided");
    }
  }, [accessToken]);

  const logout = async () => {
    const refresh = localStorage.getItem('refreshToken');

    try {
      await fetch('/api/logout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ refresh_token: refresh }),
      });
    } catch (error) {
      console.error('Logout error', error);
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  };

  return (
    <div>
      <h2>Protected Page</h2>
      <button onClick={logout}>Logout</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {data ? (
        <div>
          <p>{data.message}</p>
          <p>Email: {data.email}</p>

          <h3>Public Threads:</h3>
          <ul>
            {threads.map((thread) => (
                <li key={thread.id}>
                  <Link to={`/thread/${thread.id}`} style={{color: "blue", textDecoration: "underline"}}>
                    <strong>{thread.title}</strong>
                  </Link>{" "}
                  by {thread.author} <br/>
                  <small>{new Date(thread.creation_time).toLocaleString()}</small>
                </li>
            ))}
          </ul>
        </div>
      ) : (
          !error && <p>Loading...</p>
      )}
    </div>
  );
}
