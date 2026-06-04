import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const res = await fetch("http://127.0.0.1:8000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.access_token) {
      localStorage.setItem("token", data.access_token);
      window.location.href = "/dashboard";
    } else {
      alert("Login failed");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Login</h1>

      <input
         placeholder="Email"
         value={email}
         onChange={(e) => setEmail(e.target.value)}
      />

      <br />

      <input
         type="password"
         placeholder="Password"
         value={password}
         onChange={(e) => setPassword(e.target.value)}
      />

      <br />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

function Register() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Register Page</h1>
    </div>
  );
}

function Dashboard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");

  const updateStatus = async (id: number, status: string) => {
    const token = localStorage.getItem("token");

    const res = await fetch(`http://127.0.0.1:8000/jobs/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status })
    });

    const updated = await res.json();

    setJobs(
      jobs.map((job) => (job.id === id ? updated : job))
    );
  }

  const deleteJob = async (id: number) => {
    const token = localStorage.getItem("token");

    await fetch(`http://127.0.0.1:8000/jobs/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setJobs(jobs.filter((job) => job.id !== id));
  }

  const createJob = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch("http://127.0.0.1:8000/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        company,
        role,
      }),
    });

    const data = await res.json();

    setJobs([...jobs, data]);
  };

  useEffect(() => {
    const fetchJobs = async () => {
      const token = localStorage.getItem("token");

      console.log("TOKEN:", token);

      const res = await fetch("http://127.0.0.1:8000/jobs", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("STATUS:", res.status);

      const data = await res.json();
      console.log("DATA:", data);

      setJobs(data);
    };

    fetchJobs();
  }, []);

  return (
    <div style={styles.page}>
      <h1>Dashboard</h1>

      <p>Total Jobs: {jobs.length}</p>
      <p>
        Interviews: {jobs.filter(j => j.status === "Interview").length}
      </p>
      <p>
        Offer: {jobs.filter(j => j.status === "Offer").length}
      </p>

      <div style={styles.card}>
        <h3>Add Job</h3>

        <input
          style={styles.input}
           placeholder="Company"
           value={company}
           onChange={(e) => setCompany(e.target.value)}
        />

        <br />

        <input
          style={styles.input}
           placeholder="Role"
           value={role}
           onChange={(e) => setRole(e.target.value)}
        />

        <br />

        <button style={styles.button} onClick={createJob}>Add Job</button>
      </div>

      <h3>Your Jobs</h3>

      {jobs.map((job) => (
        <div style={styles.card}>
          <h3>{job.company}</h3>
          <p>{job.role}</p>

          <p>
            Status: <b>{job.status}</b>
          </p>

          <div style={{ display: "flex", gap: 8 }}>
            <select
              value={job.status}
              onChange={(e) => updateStatus(job.id, e.target.value)}
            >
              <option>Applied</option>
              <option>Interview</option>
              <option>Offer</option>
              <option>Rejected</option>
            </select>

            <button style={styles.button} onClick={() => deleteJob(job.id)}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  page: {
    fontFamily: "Arial",
    background: "#0f172a",
    color: "white",
    minHeight: "100vh",
    padding: "20px",
  },
  card: {
    background: "#1e293b",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "10px",
  },
  input: {
    padding: "8px",
    margin: "5px",
    borderRadius: "5px",
    border: "none",
  },
  button: {
    padding: "8px 12px",
    margin: "5px",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
  },
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}