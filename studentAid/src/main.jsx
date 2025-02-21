import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App.jsx";
import ChatBot from "./Chatbot.jsx";
import "./index.css";
import Resend from "./Resend.jsx";
import ResetPassword from "./ResetPassword.jsx"; // Import ResetPassword component
import ProtectAuth from "./routers/ProtectAuth.jsx";
import ProtectChat from "./routers/ProtectChat.jsx";
import VerifyUser from "./VerifyUser.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<ProtectAuth />}>
        <Route index element={<App />} />
        <Route path="/verify/:id" element={<VerifyUser />} />
        <Route path="/resend" element={<Resend />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />{" "}
      </Route>
      <Route path="/chat" element={<ProtectChat />}>
      <Route index element={<ChatBot />} />
      </ Route>
    </Routes>
  </BrowserRouter>
);
