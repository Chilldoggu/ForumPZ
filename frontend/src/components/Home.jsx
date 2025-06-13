import { useEffect, useState } from "react";

export default function Home({ accessToken }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProtectedData = async () => {
      try {
        const response = await fetch("http://localhost:8000/protected/", {
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

    if (accessToken) {
      fetchProtectedData();
    } else {
      setError("No token provided");
    }
  }, [accessToken]);

  return (
    <div>
      <h2>Protected Page</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {data ? (
        <div>
          <p>{data.message}</p>
          <p>Email: {data.email}</p>
        </div>
      ) : (
        !error && <p>Loading...</p>
      )}
    </div>
  );
}
