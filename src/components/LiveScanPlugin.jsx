import { useEffect, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, $isTextNode, $isElementNode } from "lexical";
import profanity from "../common/profanity";

let lastText = "";

const highlightProfanity = (editor, wordSet) => {
  editor.update(() => {
    const root = $getRoot();

    const collectTextNodes = (node, textNodes = []) => {
      if ($isTextNode(node)) {
        textNodes.push(node);
      } else if ($isElementNode(node)) {
        node.getChildren().forEach((child) => collectTextNodes(child, textNodes));
      }
      return textNodes;
    };

    const textNodes = collectTextNodes(root);

    textNodes.forEach((node) => {
      const fullText = node.getTextContent();

      const regex = /\b\w+\b/g;
      const matches = [];

      let match;
      while ((match = regex.exec(fullText)) !== null) {
        const word = match[0].toLowerCase();

        if (wordSet.has(word)) {
          console.log(word);
          matches.push({ start: match.index, end: match.index + word.length });
        }
      }

      if (matches.length === 0) return;

      node.setFormat(0); // removes all formatting

      let currentNode = node;

      matches.forEach(({ start, end }) => {
        try {
          if (start === 0) {
            const after = currentNode.splitText(length); // split after the match
            currentNode.setStyle("background-color: yellow; font-weight: bold;");
            currentNode = after;
          } else {
            const splitNodes = currentNode.splitText(start, end);
            const matchNode = splitNodes[1];
            if (matchNode) {
              matchNode.setStyle("background-color: yellow; font-weight: bold;");
            }
          }
        } catch (err) {
          console.error("Split failed:", err);
        }
      });
    });
  });
};

export const LiveScanPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const root = $getRoot();
        const text = root.getTextContent();

        if (text !== lastText) {
          lastText = text;

          editor.update(() => {
            highlightProfanity(editor, profanity);
          });
        }
      });
    });
  }, [editor]);

  return null;
};
