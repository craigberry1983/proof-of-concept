import React from "react";
import { Container } from "react-bootstrap";
function WelcomeUser() {
  return (
    <Container>
      <h1 className="w-100 text-center">Proof of Concept</h1>
      <details>
        <summary>
          <strong>What is this, and how is it used?</strong>
        </summary>
        <p>
          This prototype simulates live content scanning in an email client, as might be implemented in a native HarmCheck app.
          <br />
          <br />
          It consists of a working email composition screen that sends mail through the user's Microsoft email account using the Microsoft Graph API. As you type, it highlights any
          profanities (from a small, predefined list) in yellow.
          <br />
          <br />
          If profanities are detected when you attempt to send the email, a confirmation dialog will appear, allowing you to proceed or cancel.
          <br />
          <br />
          <strong>IMPORTANT: If you proceed, the email will be sent FROM YOUR ACCOUNT.</strong>
        </p>
      </details>
      <br />

      <details>
        <summary>
          <strong>Why make it?</strong>
        </summary>
        <p>
          Due to platform restrictions on Android and iOS, real-time message scanning and send interception require a custom email client wrapper. By implementing this as a
          Progressive Web App (PWA), the prototype can be installed on a mobile home screen—functioning similarly to a native app—using any Chromium-based browser (Chrome, Edge,
          Opera, etc.), without needing to be published to an app store.
        </p>
      </details>
      <br />

      <details>
        <summary>
          <strong>Is it safe to use?</strong>
        </summary>
        <p>This prototype uses secure OAuth authentication to connect with Outlook and requests only the minimum required permissions to send mail.</p>
        <p>To use the prototype, you must sign in with an Outlook or Microsoft 365 account.</p>
        <p>
          <strong>No emails are stored, and neither your inbox or message history is ever accessed.</strong>
        </p>
      </details>
      <br />

      <details>
        <summary>
          <strong>What could this evolve into?</strong>
        </summary>
        <p>
          A full-featured product could include inbox access, attachments, real-time content monitoring, administrative dashboards, and reporting capabilities—effectively providing
          a complete, customizable email client experience.
        </p>
      </details>
      <br />
      <br />
      <p>
        <strong>
          For the best experience on mobile, install the app using your browser’s PWA option (usually found in the menu or address bar). Once installed, it will behave like a
          lightweight native email client.
        </strong>
      </p>

      <p>
        <em>
          Note: If your email address does not end in <code>@outlook.com</code>, sent messages may initially be flagged as spam. This can be resolved in production by properly
          configuring the sender domain (e.g., SPF, DKIM, DMARC).
        </em>
      </p>
    </Container>
  );
}

export default WelcomeUser;
