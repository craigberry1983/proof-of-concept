import { useState, useEffect, useMemo, useRef } from "react";
import { useMsal } from "@azure/msal-react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { LiveScanPlugin } from "./LiveScanPlugin";
import { UNDO_COMMAND, REDO_COMMAND, FORMAT_TEXT_COMMAND, FORMAT_ELEMENT_COMMAND } from "lexical";
import { FaTimes, FaCog, FaPaperPlane, FaUndo, FaRedo, FaBold, FaItalic, FaUnderline, FaStrikethrough, FaAlignLeft, FaAlignCenter, FaAlignRight } from "react-icons/fa";
import { $generateHtmlFromNodes } from "@lexical/html";
import "../styles.css";

function SendScreen() {
  const { accessToken, account, instance } = useMsal();
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const editorRef = useRef(null);

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
    const activeAccount = account || instance.getActiveAccount();
    if (!activeAccount) {
      alert("No signed-in account!");
      return;
    }

    const response = await instance.acquireTokenSilent({
      scopes: ["Mail.Send", "User.Read"],
      account: activeAccount,
    });

    const accessToken = response.accessToken;

    if (!to) {
      alert("Missing recipient!");
      return;
    }

    const editor = editorRef.current;
    let htmlContent = "";

    if (editor) {
      await editor.update(() => {
        htmlContent = $generateHtmlFromNodes(editor, null);
      });
    } else {
      alert("Missing editor ref!");
      return;
    }

    const email = {
      message: {
        subject,
        body: { contentType: "HTML", content: htmlContent },
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
  const handleLogout = async () => {
    instance.logoutPopup({
      postLogoutRedirectUri: "/",
    });
    window.location.reload();
  };

  const CustomContent = useMemo(() => {
    return (
      <ContentEditable
        style={{
          flex: 1,
          overflowY: "auto",
          userSelect: "text",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          backgroundColor: "transparent",
        }}
      />
    );
  }, []);

  const lexicalConfig = {
    namespace: "alphypoc",
    theme: {
      text: {
        profanity: "profanity-highlight",
        bold: "text-bold",
        italic: "text-italic",
        underline: "text-underline",
        strikethrough: "text-strikethrough",
      },
    },
    onError: (e) => {
      console.log("ERROR:", e);
    },
  };

  return (
    <div className="send-page">
      <LexicalComposer initialConfig={{ ...lexicalConfig }}>
        <header>
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
        </header>
        <EditorToolbar />
        <input type="email" placeholder="To" value={to} onChange={(e) => setTo(e.target.value)} />
        <input type="text" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <LiveScanPlugin />
        <RichTextPlugin className="message-area" contentEditable={CustomContent} ErrorBoundary={LexicalErrorBoundary}></RichTextPlugin>
        <HistoryPlugin />
        <EditorCapturePlugin editorRef={editorRef} />
      </LexicalComposer>

      {showConfirmLogout && (
        <div className="modal-overlay">
          <div className="modal">
            <p>Are you sure you want to sign out?</p>
            <button onClick={cancelLogout}>Cancel</button>
            <button onClick={handleLogout}>Sign Out</button>
          </div>
        </div>
      )}
    </div>
  );
}

function EditorToolbar() {
  const [editor] = useLexicalComposerContext();

  return (
    <div className="toolbar">
      <button className="toolbar-button" onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}>
        <FaUndo />
      </button>
      <button className="toolbar-button" onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}>
        <FaRedo />
      </button>
      <button className="toolbar-button" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}>
        <FaBold />
      </button>
      <button className="toolbar-button" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}>
        <FaItalic />
      </button>
      <button className="toolbar-button" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}>
        <FaUnderline />
      </button>
      <button className="toolbar-button" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")}>
        <FaStrikethrough />
      </button>
      <button className="toolbar-button" onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")}>
        <FaAlignLeft />
      </button>
      <button className="toolbar-button" onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")}>
        <FaAlignCenter />
      </button>
      <button className="toolbar-button" onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")}>
        <FaAlignRight />
      </button>
    </div>
  );
}

function EditorCapturePlugin({ editorRef }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);
  return null;
}

export default SendScreen;
