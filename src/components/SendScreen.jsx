import { useState, useEffect, useMemo, useRef } from "react";
import { useMsal } from "@azure/msal-react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { LiveScanPlugin } from "./LiveScanPlugin";
import { UNDO_COMMAND, REDO_COMMAND, FORMAT_TEXT_COMMAND, FORMAT_ELEMENT_COMMAND, $getSelection, $isRangeSelection, $getRoot } from "lexical";
import { FaTimes, FaPaperPlane, FaUndo, FaRedo, FaBold, FaItalic, FaUnderline, FaStrikethrough, FaAlignLeft, FaAlignCenter, FaAlignRight } from "react-icons/fa";
import { $generateHtmlFromNodes } from "@lexical/html";
import { Modal, Button, Container } from "react-bootstrap";
import profanity from "../common/profanity";
import "../styles.css";

function SendScreen() {
  const { accounts, instance } = useMsal();
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [showProfanityWarning, setShowProfanityWarning] = useState(false);
  const [pendingSendData, setPendingSendData] = useState(null); // store email until confirmed

  const editorRef = useRef(null);

  useEffect(() => {
    const getUserData = async () => {
      const activeAccount = instance.getActiveAccount() || accounts[0];
      if (!activeAccount) {
        console.log("account does not exist");
        return;
      }
      try {
        const response = await instance.acquireTokenSilent({
          scopes: ["Mail.Send", "User.Read"],
          account: activeAccount,
        });

        const accessToken = response.accessToken;

        const res = await fetch("https://graph.microsoft.com/v1.0/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const user = await res.json();
        setUserEmail(user.mail || user.userPrincipalName || activeAccount.username);
      } catch (err) {
        console.error("Token acquisition or fetch failed", err);
        setUserEmail(activeAccount.username || "Unknown user");
      }
    };

    getUserData();
  }, [accounts, instance]);

  const containsProfanity = (text) => {
    const words = text.match(/\b\w+\b/g) || [];
    return words.some((word) => profanity.has(word.toLowerCase()));
  };

  const sendEmail = async (htmlContent) => {
    const activeAccount = instance.getActiveAccount() || accounts[0];
    if (!activeAccount) {
      alert("No signed-in account!");
      return;
    }

    const response = await instance.acquireTokenSilent({
      scopes: ["Mail.Send", "User.Read"],
      account: activeAccount,
    });

    const accessToken = response.accessToken;

    const rawRecipients = to.trim();
    const recipientList = rawRecipients
      .split(/[;,]+/) // split on comma or semicolon
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    if (recipientList.length === 0) {
      alert("Missing recipient!");
      return;
    }

    const email = {
      message: {
        subject,
        body: { contentType: "HTML", content: htmlContent },
        toRecipients: recipientList.map((email) => ({ emailAddress: { address: email } })),
      },
      saveToSentItems: "true",
    };

    try {
      const res = await fetch("https://graph.microsoft.com/v1.0/me/sendMail", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(email),
      });

      if (res.ok) {
        alert("Email sent successfully.");
      } else {
        const err = await res.json();
        alert("Error sending: " + (err.error?.message || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
    }
  };

  const handleSend = async () => {
    console.log("handle send called");
    const editor = editorRef.current;
    let htmlContent = "";
    let plainTextContent = "";

    if (!editor) {
      alert("Missing editor ref!");
      return;
    }

    await editor.update(() => {
      htmlContent = $generateHtmlFromNodes(editor, null);
      plainTextContent = $getRoot().getTextContent();
    });

    console.log("plain text content:", plainTextContent);

    if (containsProfanity(plainTextContent)) {
      setPendingSendData({ htmlContent });
      setShowProfanityWarning(true);
      return;
    }

    await sendEmail(htmlContent);
  };

  const CustomContent = useMemo(() => {
    return (
      <ContentEditable
        style={{
          flexGrow: 1,
          overflowY: "auto",
          userSelect: "text",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          backgroundColor: "pink",
          padding: "1rem", // optional
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
    <Container fluid className="send-page d-flex flex-column p-0" style={{ flexGrow: 1, minHeight: 0 }}>
      <LexicalComposer initialConfig={{ ...lexicalConfig }}>
        <header>
          {" "}
          <Button
            className="icon-button close-button"
            onClick={() => {
              setShowConfirmLogout(true);
            }}
          >
            <FaTimes />
          </Button>
          <strong className="header-title">New message</strong>
          <span className="user-email">{userEmail}</span>
          <Button className="icon-button send-button" onClick={handleSend}>
            <FaPaperPlane />
          </Button>
        </header>
        <EditorToolbar />

        <div className="flex-grow-1 d-flex flex-column overflow-hidden" style={{ display: "flex" }}>
          <input type="email" placeholder="To" value={to} onChange={(e) => setTo(e.target.value)} />
          <input type="text" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          <LiveScanPlugin />
          <div className="flex-grow-1 d-flex flex-column overflow-hidden">
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  style={{
                    flexGrow: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    userSelect: "text",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    padding: "1rem",
                  }}
                />
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <EditorCapturePlugin editorRef={editorRef} />
          </div>
        </div>
      </LexicalComposer>

      <Modal show={showConfirmLogout} onHide={() => setShowConfirmLogout(false)} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
        <Modal.Header>
          <Modal.Title>Sign Out</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to sign out?</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowConfirmLogout(false)}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={async () => {
              setShowConfirmLogout(false);
              instance.logoutPopup({
                postLogoutRedirectUri: "/",
              });
              window.location.reload();
            }}
          >
            Ok
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showProfanityWarning} onHide={() => setShowProfanityWarning(false)} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
        <Modal.Header closeButton>
          <Modal.Title>Profanity Warning</Modal.Title>
        </Modal.Header>
        <Modal.Body>This email contains profanity. Are you sure you want to send it?</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowProfanityWarning(false)}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={async () => {
              setShowProfanityWarning(false);
              if (pendingSendData) {
                await sendEmail(pendingSendData.htmlContent);
                setPendingSendData(null);
              }
            }}
          >
            Send Anyway
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

function EditorToolbar() {
  const [editor] = useLexicalComposerContext();

  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [strikethrough, setStrikethrough] = useState(false);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          setBold(selection.hasFormat("bold"));
          setItalic(selection.hasFormat("italic"));
          setUnderline(selection.hasFormat("underline"));
          setStrikethrough(selection.hasFormat("strikethrough"));
        }
      });
    });
  }, [editor]);

  return (
    <div className="toolbar">
      <Button className="toolbar-button" onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}>
        <FaUndo />
      </Button>
      <Button className="toolbar-button" onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}>
        <FaRedo />
      </Button>
      <Button className={`toolbar-button ${bold ? "active" : ""}`} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}>
        <FaBold />
      </Button>
      <Button className={`toolbar-button ${italic ? "active" : ""}`} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}>
        <FaItalic />
      </Button>
      <Button className={`toolbar-button ${underline ? "active" : ""}`} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}>
        <FaUnderline />
      </Button>
      <Button className={`toolbar-button ${strikethrough ? "active" : ""}`} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")}>
        <FaStrikethrough />
      </Button>
      <Button className={"toolbar-button"} onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")}>
        <FaAlignLeft />
      </Button>
      <Button className={"toolbar-button"} onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")}>
        <FaAlignCenter />
      </Button>
      <Button className={"toolbar-button"} onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")}>
        <FaAlignRight />
      </Button>
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
