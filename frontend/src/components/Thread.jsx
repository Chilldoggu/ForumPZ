import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Thread({ accessToken }) {
  const { id } = useParams();
  const [comments, setComments] = useState([]);
  const [threadTitle, setThreadTitle] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchThreadAndComments = async () => {
      try {
        const threadRes = await fetch(`http://localhost:8000/api/threads/${id}/`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const threadData = await threadRes.json();
        setThreadTitle(threadData.title);

        const res = await fetch(`http://localhost:8000/api/threads/${id}/comments/`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const data = await res.json();
        setComments(data);
      } catch (err) {
        setError("Error loading comments");
      }
    };

    fetchThreadAndComments();
  }, [id, accessToken]);

  return (
    <div>
      <h2>Comments for: {threadTitle}</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {comments.map((comment) => (
          <li key={comment.id}>
            <strong>{comment.author}</strong>: {comment.content}
            <br />
            <small>{new Date(comment.created_at).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
