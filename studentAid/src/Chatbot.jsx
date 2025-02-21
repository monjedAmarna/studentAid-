import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";

const API_URL = "https://flaskapi-1-dwl5.onrender.com";

const ChatBot = () => {
  const chatWindowRef = useRef(null);
  const [userInput, setUserInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileDataUrl, setSelectedFileDataUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

  const appendMessage = (content, sender) => {
    setMessages((prevMessages) => [...prevMessages, { content, sender }]);
    setTimeout(() => {
      if (chatWindowRef.current) {
        chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
      }
    }, 0);
  };

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedFile(file);
        setSelectedFileDataUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setSelectedFileDataUrl("");
  };

  const handleSend = async () => {
    const message = userInput.trim();
    if (!message && !selectedFileDataUrl) return;

    let userBubbleContent = "";
    if (selectedFileDataUrl) {
      userBubbleContent += `<img src="${selectedFileDataUrl}" style="max-width: 200px; display: block; margin-bottom: 5px;" />`;
    }
    if (message) {
      userBubbleContent += message;
    }

    appendMessage(userBubbleContent, "user");
    setIsLoading(true);

    try {
      setUserInput("");

      if (selectedFile) {
        const formData = new FormData();
        formData.append("imageFile", selectedFile);
        formData.append("prompt", message);
        const res = await fetch(`${API_URL}/chat_image`, {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error(`Server returned status ${res.status}`);
        const data = await res.json();
        if (data.answer) appendMessage(data.answer, "bot");
      } else {
        const payload = { message };
        const res = await fetch(`${API_URL}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`Server returned status ${res.status}`);
        const data = await res.json();
        if (data.answer) appendMessage(data.answer, "bot");
      }
    } catch (err) {
      console.error(err);
      appendMessage("Error: Could not get a response from the server.", "bot");
    } finally {
      setIsLoading(false);
      setUserInput("");
      setSelectedFile(null);
      setSelectedFileDataUrl("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="chatbot-container">
      <header className="chat-header">
        <img
          src="/assets/header-logo.jpg"
          alt="Logo"
          style={{ opacity: 0.8, height: "40px", marginRight: "10px" }}
        />
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </header>
      <div className="chat-container">
        <div ref={chatWindowRef} className="chat-window">
          <div className="chat-logo-container">
            <img src="/assets/logo.png" className="chat-logo" alt="" />
            <img
              src="/assets/header-logo.jpg"
              alt="Logo"
              style={{ opacity: 0.8, height: "40px", marginRight: "10px" }}
            />
          </div>
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}-message`}>
              {msg.sender === "user" ? (
                <div dangerouslySetInnerHTML={{ __html: msg.content }} />
              ) : (
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              )}
            </div>
          ))}
        </div>
        <div className="input-area">
          {selectedFileDataUrl && (
            <div className="image-preview">
              <img
                src={selectedFileDataUrl || "/placeholder.svg"}
                alt="preview"
              />
              <button onClick={handleRemoveImage} className="remove-image-x">
                X
              </button>
            </div>
          )}
          <div className="input-row">
            <button
              className="attach-button"
              onClick={() => document.getElementById("imageFile").click()}
            >
              Attach
            </button>
            <input
              className="chat-input"
              placeholder="Type your message or describe the image..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button
              className="send-button"
              onClick={handleSend}
              disabled={isLoading}
            >
              <span className="btn-text">
                {isLoading ? "Sending..." : "Send"}
              </span>
              {isLoading && <span className="btn-spinner"></span>}
            </button>
            <input
              type="file"
              id="imageFile"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
              // enter button to send message
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
