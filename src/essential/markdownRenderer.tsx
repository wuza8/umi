import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  return (
    <ReactMarkdown
      children={content}
      remarkPlugins={[remarkGfm]}
    />
  );
};
// components={{
//     h1: ({ node, ...props }) => <h1 style={{ color: "blue" }} {...props} />,
//     a: ({ node, ...props }) => <a style={{ textDecoration: "underline" }} {...props} />,
//   }}
export default MarkdownRenderer;