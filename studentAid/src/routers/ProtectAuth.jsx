import { Navigate, Outlet } from "react-router-dom";

export default function ProtectAuth() {
  const token = localStorage.getItem("token");
  if (token) {
    return <Navigate to="/chat" />;
  }
  return <Outlet />;
}
