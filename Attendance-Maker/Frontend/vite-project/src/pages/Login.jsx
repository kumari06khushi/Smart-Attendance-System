import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post("/admin/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);

      navigate("/students");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please try again."
      );
    }
  }
return (
  <div className="auth-container">
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-header">
        <div className="auth-logo">🎓</div>

        <h2>Welcome Back</h2>
        <p>Login to manage student attendance</p>
      </div>

      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />
      </div>

      <button type="submit" className="auth-button">
        Login
      </button>

      {error && <p className="error-message">{error}</p>}

      <p className="auth-footer">
        Don't have an account?{" "}
        <Link to="/register">Register</Link>
      </p>
    </form>
  </div>
);

}

export default Login;

  // return (
  //   <div className="auth-container">
  //     <form className="auth-form" onSubmit={handleSubmit}>
  //       <h2>Admin Login</h2>

  //       <label>Email</label>
  //       <input
  //         type="email"
  //         value={email}
  //         onChange={(e) => setEmail(e.target.value)}
  //         placeholder="Enter your email"
  //         required
  //       />

  //       <label>Password</label>
  //       <input
  //         type="password"
  //         value={password}
  //         onChange={(e) => setPassword(e.target.value)}
  //         placeholder="Enter your password"
  //         required
  //       />

  //       <button type="submit">Login</button>

  //       {error && <p className="error-message">{error}</p>}

  //       <p>
  //         Don't have an account?{" "}
  //         <Link to="/register">Register</Link>
  //       </p>
  //     </form>
  //   </div>
  // );