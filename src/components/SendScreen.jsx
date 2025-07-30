import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes, FaCog, FaPaperPlane } from "react-icons/fa";
import { useMsal } from "../common/MsalContext";

function SendScreen() {
  const navigate = useNavigate();
  const { accessToken, account, logout, isReady } = useMsal();

  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  const toRef = useRef();
  const subjectRef = useRef();
  const bodyRef = useRef();

  const scrollIntoView = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetch("https://graph.microsoft.com/v1.0/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then((res) => {
          return res.json();
        })
        .then((user) => {
          setUserEmail(user.mail || user.userPrincipalName || account?.username);
        })
        .catch((err) => {
          setUserEmail(account?.username || "Unknown user");
        });
    }
  }, [accessToken, account]);

  const handleSend = async () => {
    if (!accessToken || !to) {
      alert("Missing token or recipient.");
      return;
    }

    const email = {
      message: {
        subject,
        body: { contentType: "Text", content: body },
        toRecipients: [{ emailAddress: { address: to } }],
      },
      saveToSentItems: "true",
    };

    try {
      const response = await fetch("https://graph.microsoft.com/v1.0/me/sendMail", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(email),
      });

      if (response.ok) {
        alert("Email sent successfully.");
      } else {
        const err = await response.json();
        alert("Error sending: " + err.error?.message || "Unknown error");
      }
    } catch (err) {
      alert("Network error.");
    }
  };

  const confirmLogout = () => setShowConfirmLogout(true);
  const cancelLogout = () => setShowConfirmLogout(false);
  const executeLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="send">
      <div className="header-bar">
        <button className="icon-button close-button" onClick={confirmLogout}>
          <FaTimes />
        </button>
        <strong className="header-title">New message</strong>
        <span className="user-email">{userEmail}</span>
        <button className="icon-button gear-button">
          <FaCog />
        </button>
        <button className="icon-button send-button" onClick={handleSend}>
          <FaPaperPlane />
        </button>
      </div>

      <div className="email-area">
        <input ref={toRef} type="email" placeholder="To" value={to} onChange={(e) => setTo(e.target.value)} onFocus={() => scrollIntoView(toRef)} />
        <input
          ref={subjectRef}
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          onFocus={() => scrollIntoView(subjectRef)}
        />

        <textarea
          ref={bodyRef}
          placeholder="Message"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onFocus={() => scrollIntoView(bodyRef)}
        />
      </div>

      {showConfirmLogout && (
        <div className="modal-overlay">
          <div className="modal">
            <p>Are you sure you want to sign out?</p>
            <button onClick={cancelLogout}>Cancel</button>
            <button onClick={executeLogout}>Sign Out</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SendScreen;
