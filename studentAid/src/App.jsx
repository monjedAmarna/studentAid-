import { useState, useTransition } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";
import "./chat.css";
import "./verify.css";
const API_URL = import.meta.env.VITE_API_URL;
const App = () => {
  const [isSignUpMode, setSignUpMode] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    setErrorMessage("");
    startTransition(async () => {
      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await response.json();
        if (response.ok) {
          navigate("/chat");
          localStorage.setItem("token", data.token);
        } else {
          setErrorMessage(`${data.message}`);
        }
      } catch (error) {
        setErrorMessage(`${error.message}`);
      }
    });
  };

  const handleRegister = async () => {
    setErrorMessage("");
    startTransition(async () => {
      try {
        const response = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await response.json();
        if (response.ok) {
          navigate(`/resend?email=${formData.email}`);
          setFormData({ email: "", password: "" });
        } else {
          setErrorMessage(`Registration failed: ${data.message}`);
        }
      } catch (error) {
        setErrorMessage(`Registration error: ${error.message}`);
      }
    });
  };

  const handleForgotPassword = async () => {
    const email = prompt("Please enter your email for password reset:");
    if (email) {
      try {
        const response = await fetch(`${API_URL}/auth/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await response.json();
        if (response.ok) {
          alert("Password reset email sent. Please check your inbox.");
        } else {
          alert(`Error: ${data.message}`);
        }
      } catch (error) {
        alert(`Error: ${error.message}`);
      }
    }
  };

  return (
    <div className={`container ${isSignUpMode ? "sign-up-mode" : ""}`}>
      <div className="forms-container">
        <div className="signin-signup">
          <form className="sign-in-form">
            <h2 className="title">Sign in</h2>
            <div className="input-field">
              <i className="fas fa-user"></i>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-field">
              <i className="fas fa-lock"></i>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button
              type="button"
              className="forgot-password-btn"
              onClick={handleForgotPassword}
            >
              Forgot Password
            </button>
            <button
              type="button"
              className="btn"
              onClick={handleLogin}
              disabled={isPending}
            >
              {isPending ? "Loading..." : "Login"}
            </button>

            {errorMessage && (
              <p style={{ color: "red", fontWeight: 600 }}>{errorMessage}</p>
            )}
          </form>

          <form className="sign-up-form">
            <h2 className="title">Sign up</h2>
            <div className="input-field">
              <i className="fas fa-user"></i>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-field">
              <i className="fas fa-lock"></i>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button
              type="button"
              className="btn"
              onClick={handleRegister}
              disabled={isPending}
            >
              {isPending ? "Loading..." : "Sign Up"}
            </button>
            {errorMessage && (
              <p style={{ color: "red", fontWeight: 600 }}>{errorMessage}</p>
            )}
          </form>
        </div>
      </div>
      <div className="panels-container">
        <div className="panel left-panel">
          <div className="content">
            <h3>New here?</h3>
            <p>Sign up to get started!</p>
            <button
              className="btn transparent"
              onClick={() => setSignUpMode(true)}
            >
              Sign Up
            </button>
          </div>
        </div>
        <div className="panel right-panel">
          <div className="content">
            <h3>One of us?</h3>
            <p>Sign in to continue!</p>
            <button
              className="btn transparent"
              onClick={() => setSignUpMode(false)}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
