
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

import "./Register.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await api.post("/admin/register", {
        name,
        email,
        password,
      });

      setMessage(response.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Registration failed. Please try again."
      );
    }
  }
return (
  <div className="auth-container">
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-header">
        <div className="auth-logo">🎓</div>
        <h2>Create Admin Account</h2>
        <p>Register to manage student attendance</p>
      </div>

      <div className="form-group">
        <label htmlFor="name">Full Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your full name"
          required
        />
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
          placeholder="Create a password"
          required
        />
      </div>

      <button type="submit" className="auth-button">
        Create Account
      </button>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      <p className="auth-footer">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </form>
  </div>
);
}

export default Register;


  // return (
  //   <div className="auth-container">
  //     <form className="auth-form" onSubmit={handleSubmit}>
  //       <h2>Admin Register</h2>

  //       <label>Name</label>
  //       <input
  //         type="text"
  //         value={name}
  //         onChange={(e) => setName(e.target.value)}
  //         placeholder="Enter your name"
  //         required
  //       />

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

  //       <button type="submit">Register</button>

  //       {message && <p className="success-message">{message}</p>}
  //       {error && <p className="error-message">{error}</p>}

  //       <p>
  //         Already registered? <Link to="/login">Login</Link>
  //       </p>
  //     </form>
  //   </div>
  // );
