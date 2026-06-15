import React, { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [queues, setQueues] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "queues"), orderBy("joinedAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setQueues(data);
    });
    return unsubscribe;
  }, []);

  const handleCall = async (id) => {
    await updateDoc(doc(db, "queues", id), { status: "called" });
  };

  const handleRemove = async (id) => {
    await deleteDoc(doc(db, "queues", id));
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const waiting = queues.filter((q) => q.status === "waiting").length;
  const called  = queues.filter((q) => q.status === "called").length;
  const total   = queues.length;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Admin</h1>
        <div className="header-right">
          <span className="header-email">{currentUser?.email}</span>
          <button className="btn-outline" onClick={handleLogout}>Sign out</button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="metrics-row">
          <div className="metric-card">
            <div className="metric-label">Waiting</div>
            <div className="metric-value">{waiting}</div>
            <div className="metric-sub">in queue now</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Being served</div>
            <div className="metric-value">{called}</div>
            <div className="metric-sub">at counter</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Total today</div>
            <div className="metric-value">{total}</div>
            <div className="metric-sub">tokens issued</div>
          </div>
        </div>

        <h2>Live queue</h2>

        {queues.length === 0 ? (
          <p className="empty-state">No one in the queue right now.</p>
        ) : (
          <table className="queue-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {queues.map((q, index) => (
                <tr key={q.id}>
                  <td style={{ color: "#8E8E93", fontSize: "0.82rem" }}>{index + 1}</td>
                  <td style={{ fontWeight: 500 }}>{q.name}</td>
                  <td>
                    <span className={`status-badge status-${q.status}`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="action-btns">
                    <button
                      className="btn-outline btn-sm"
                      onClick={() => handleCall(q.id)}
                    >
                      Call
                    </button>
                    <button
                      className="btn-danger btn-sm"
                      onClick={() => handleRemove(q.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
