import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function VerifyUser() {
  const { id } = useParams();

  const navigate = useNavigate();

  useEffect(() => {
    const verifyUser = async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/verify/${id}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (response.ok) {
        alert("User verified successfully");
        navigate("/");
      } else {
        alert("User verification failed");
      }
    };
    verifyUser();
  });
  return <div />;
}
