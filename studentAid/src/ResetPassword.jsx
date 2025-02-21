import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

const ResetPassword = () => {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleResetPassword = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        navigate("/");
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-sub-container">
        <h1>
          Reset Password for <span>{email}</span>
        </h1>
        <input
          className="reset-password-input"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />
        <button className="reset-password-btn" onClick={handleResetPassword}>
          Reset Password
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;
