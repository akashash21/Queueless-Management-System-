import React, { useState } from "react";
import { db } from "../../services/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const UserDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("Please enter your name.");
    setLoading(true);
    try {
      await addDoc(collection(db, "queues"), {
        name: name.trim(),
        userId: currentUser.uid,
        email: currentUser.email,
        status: "waiting",
        joinedAt: serverTimestamp(),
      });
      setJoined(true);
    } catch (err) {
      setError("Failed to join queue. Please try again.");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>QueueLess</h1>
        <div className="header-right">
          <span className="header-email">{currentUser?.email}</span>
          <button className="btn-outline" onClick={handleLogout}>Sign out</button>
        </div>
      </header>

      <div className="dashboard-content">
        {joined ? (
          <div className="joined-msg">
            <h2>You're in the queue</h2>
            <p>We'll notify you when it's your turn.</p>
            <Link
              to="/track"
              className="btn-primary"
              style={{ display: "inline-block", width: "auto", padding: "0.65rem 1.6rem" }}
            >
              Track my position
            </Link>
          </div>
        ) : (
          <div className="join-card">
            <h2 style={{ marginBottom: "0.25rem" }}>Join the queue</h2>
            <p style={{ fontSize: "0.875rem", color: "#8E8E93", marginBottom: "1.4rem" }}>
              Enter your name to get a virtual token
            </p>
            {error && <p className="error-msg">{error}</p>}
            <form onSubmit={handleJoin}>
              <div className="form-group">
                <label>Your name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Joining…" : "Join queue"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
