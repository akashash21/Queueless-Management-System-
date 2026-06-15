import React, { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const QueueTracker = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [queues, setQueues] = useState([]);
  const [myEntry, setMyEntry] = useState(null);
  const [myPosition, setMyPosition] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "queues"), orderBy("joinedAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setQueues(data);
      const waiting = data.filter((d) => d.status === "waiting");
      const mine = waiting.find((d) => d.userId === currentUser.uid);
      setMyEntry(mine || null);
      if (mine) {
        setMyPosition(waiting.findIndex((d) => d.userId === currentUser.uid) + 1);
      }
    });
    return unsubscribe;
  }, [currentUser]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const totalWaiting = queues.filter((q) => q.status === "waiting").length;
  const estWait = myPosition ? myPosition * 5 : 0;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Queue Tracker</h1>
        <div className="header-right">
          <span className="header-email">{currentUser?.email}</span>
          <button className="btn-outline" onClick={handleLogout}>Sign out</button>
        </div>
      </header>

      <div className="dashboard-content">
        {myEntry ? (
          <div className="tracker-card">
            <p className="tracker-label">Your position</p>
            <div className="tracker-position">{myPosition}</div>
            <p className="tracker-name">Hi, {myEntry.name}</p>
            <p className="tracker-status">
              Status:{" "}
              <span className={`status-badge status-${myEntry.status}`}>
                {myEntry.status}
              </span>
            </p>
            <p className="tracker-total" style={{ marginTop: "0.6rem" }}>
              Est. wait:{" "}
              <strong style={{ color: "#30D158" }}>{estWait} min</strong>
            </p>
            <p className="tracker-total">
              {totalWaiting} {totalWaiting === 1 ? "person" : "people"} waiting
            </p>
          </div>
        ) : (
          <div className="joined-msg">
            <h2>You're not in the queue</h2>
            <p>Join to get your virtual token.</p>
            <button
              className="btn-primary"
              style={{ width: "auto", display: "inline-block", padding: "0.65rem 1.6rem" }}
              onClick={() => navigate("/dashboard")}
            >
              Join queue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueueTracker;
