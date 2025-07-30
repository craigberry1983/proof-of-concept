import React from "react";
import { useNavigate } from "react-router-dom";
import { useMsal } from "../common/MsalContext";

function DisclaimerScreen() {
  const navigate = useNavigate();
  const { login, isReady } = useMsal();

  const handleContinue = () => {
    if (!isReady) {
      alert("Auth system is not ready yet. Please wait a moment.");
      return;
    }
    login(navigate);
  };

  return (
    <div className="disclaimer">
      <h1>Proof of Concept</h1>

      <p>
        Due to platform limitations, a custom email client wrapper is required on Android and iOS to enable real-time message scanning and control
        over the sending process.
      </p>

      <p>
        This prototype demonstrates live scanning of email content. It highlights a small set of profanities in yellow and potentially violent words
        in red. These keyword sets are configurable, and you can simulate network lag in the settings page (gear icon).
      </p>

      <p>
        The application connects to Outlook using secure OAuth login flows and requests send-only permissions. All messages are sent via the Microsoft
        Graph API.
      </p>

      <p>
        <strong>No data is stored, and the user’s inbox or message history is never accessed in this proof of concept.</strong>
      </p>

      <p>
        The full product could fully emulate the Outlook client—including inbox, rich text formatting, attachments, etc. while layering in live
        content scanning, policy enforcement, and optional administrative controls, and would be designed to integrate into the user's workflow
        without disruption.
      </p>

      <p>
        <strong>
          For the best experience on mobile, please use your browser’s PWA installation option (typically found in the menu or address bar) to add the
          app to your home screen. It will then behave like a (stripped-down) native email client.
        </strong>
      </p>

      <p>
        To use, sign in using an Outlook email account (including Microsoft 365 accounts). Once authenticated, you can experiment with composing and
        sending test messages.
      </p>

      <p>
        <em>
          Note: If your email address does not end in <code>@outlook.com</code>, messages may initially appear in the recipient’s spam folder. This
          can be resolved in production through proper domain configuration (e.g., SPF, DKIM, DMARC).
        </em>
      </p>

      <button onClick={handleContinue}>Sign In</button>
    </div>
  );
}

export default DisclaimerScreen;
