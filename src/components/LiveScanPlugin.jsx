import { useEffect, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, $isTextNode, $isElementNode } from "lexical";
import profanity from "../common/profanity";

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

    textNodes.forEach((textNode) => {
      const text = textNode.getTextContent();
      const matches = [];

      // Find all whole words
      const regex = /\b\w+\b/g;
      let match;
      while ((match = regex.exec(text)) !== null) {
        const word = match[0].toLowerCase();
        if (wordSet.has(word)) {
          matches.push({ start: match.index, end: match.index + word.length });
        }
      }

      if (matches.length === 0) return;

      // Sort in reverse order to not break indices
      matches.sort((a, b) => b.start - a.start);

      matches.forEach(({ start, end }) => {
        try {
          const splitNodes = textNode.splitText(start, end);
          const matchNode = splitNodes[1];
          if (matchNode) {
            matchNode.setStyle("background-color: yellow; font-weight: bold;");
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
  const debounceTimer = useRef(null);

  useEffect(() => {
    const unregister = editor.registerUpdateListener(() => {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        highlightProfanity(editor, profanity);
      }, 300);
    });

    return () => {
      clearTimeout(debounceTimer.current);
      unregister();
    };
  }, [editor]);

  return null;
};
