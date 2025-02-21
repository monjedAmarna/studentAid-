import { useSearchParams } from "react-router-dom";

export default function Resend() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  const handleResend = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/resend`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert(error.message);
    }
  };
  return (
    <div className="resend-container">
      <div className="resend-sub-container">
        <h1>Waiting For Email Verification</h1>
        <h4>Didn&apos;t get an email?</h4>
        <p>
          Click the button below to resend the verification email to {email}
        </p>
        <button className="resend-btn" onClick={handleResend}>
          Resend
        </button>
      </div>
    </div>
  );
}
