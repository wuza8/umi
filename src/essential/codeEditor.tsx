import React, { useState } from "react";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night";

interface CodeEditorProps {
  initialCode: string;
}

const darkTheme = EditorView.theme({
    "&": {
      color: "white",
      backgroundColor: "#034"
    },
    ".cm-content": {
      caretColor: "#0e9",
      backgroundColor: "#000000cc"
    },
    "&.cm-focused .cm-cursor": {
      borderLeftColor: "#0e9"
    },
    "&.cm-focused .cm-selectionBackground, ::selection": {
      backgroundColor: "#074"
    },
    ".cm-gutters": {
      backgroundColor: "#2a2a2a !important",
      color: "#ddd",
      border: "none"
    }
  }, {dark: true})

const CodeEditor: React.FC<CodeEditorProps> = ({ initialCode }) => {
  const [code, setCode] = useState(initialCode);

  console.log(code);

  const handleCodeChange = (value: string) => {
    setCode(value);
    console.log("Updated Code:", value);
  };

  return (
    <CodeMirror
      value={initialCode}
      height="calc(100vh - 120px)"
      extensions={[javascript(), tokyoNight, darkTheme]}
      onChange={handleCodeChange}
    />
  );
};

export default CodeEditor;