import { Navigate, Outlet } from "react-router-dom";
export default function ProtectChat() {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/" />;
  }
  return <Outlet />;
}
