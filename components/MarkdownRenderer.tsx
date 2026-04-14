"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content.trim()) {
    return (
      <div className="markdown-content">
        <p className="markdown-empty">No content to display.</p>
      </div>
    );
  }

  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "";
            const isInline = !className;

            if (isInline) {
              return (
                <code className="markdown-inline-code" {...props}>
                  {children}
                </code>
              );
            }

            return (
              <SyntaxHighlighter
                style={oneDark}
                language={language || "typescript"}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            );
          },
          // Override heading elements for consistent styling
          h1({ children, ...props }) {
            return (
              <h2 className="markdown-h1" {...props}>
                {children}
              </h2>
            );
          },
          h2({ children, ...props }) {
            return (
              <h3 className="markdown-h2" {...props}>
                {children}
              </h3>
            );
          },
          h3({ children, ...props }) {
            return (
              <h4 className="markdown-h3" {...props}>
                {children}
              </h4>
            );
          },
          p({ children, ...props }) {
            return (
              <p className="markdown-paragraph" {...props}>
                {children}
              </p>
            );
          },
          ul({ children, ...props }) {
            return (
              <ul className="markdown-list" {...props}>
                {children}
              </ul>
            );
          },
          ol({ children, ...props }) {
            return (
              <ol className="markdown-list ordered" {...props}>
                {children}
              </ol>
            );
          },
          li({ children, ...props }) {
            return (
              <li className="markdown-list-item" {...props}>
                {children}
              </li>
            );
          },
          blockquote({ children, ...props }) {
            return (
              <blockquote className="markdown-blockquote" {...props}>
                {children}
              </blockquote>
            );
          },
          a({ children, ...props }) {
            return (
              <a className="markdown-link" {...props} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>

      <style jsx global>{`
        .markdown-content {
          font-size: 1.125rem;
          line-height: 1.8;
          color: var(--foreground, #1f2937);
        }

        .markdown-empty {
          color: var(--secondary, #6b7280);
          font-style: italic;
          padding: 2rem 0;
        }

        .markdown-h1,
        .markdown-h2,
        .markdown-h3 {
          margin-top: 2rem;
          margin-bottom: 1rem;
          font-weight: 600;
          line-height: 1.3;
          color: var(--foreground, #111827);
        }

        .markdown-h1 {
          font-size: 1.75rem;
          border-bottom: 1px solid var(--border, #e5e7eb);
          padding-bottom: 0.5rem;
        }

        .markdown-h2 {
          font-size: 1.5rem;
        }

        .markdown-h3 {
          font-size: 1.25rem;
        }

        .markdown-paragraph {
          margin-bottom: 1.25rem;
        }

        .markdown-list {
          margin-bottom: 1.25rem;
          padding-left: 1.75rem;
        }

        .markdown-list.ordered {
          list-style-type: decimal;
        }

        .markdown-list-item {
          margin-bottom: 0.5rem;
        }

        .markdown-list-item > p {
          margin-bottom: 0.5rem;
        }

        .markdown-blockquote {
          margin: 1.5rem 0;
          padding: 1rem 1.25rem;
          border-left: 4px solid var(--primary, #3b82f6);
          background: var(--muted, #f9fafb);
          border-radius: 0 0.5rem 0.5rem 0;
          color: var(--secondary, #4b5563);
          font-style: italic;
        }

        .markdown-blockquote > p {
          margin-bottom: 0;
        }

        .markdown-link {
          color: var(--primary, #3b82f6);
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: border-color 0.2s;
        }

        .markdown-link:hover {
          border-bottom-color: var(--primary, #3b82f6);
        }

        .markdown-inline-code {
          font-family: var(
            --font-mono,
            "JetBrains Mono",
            ui-monospace,
            SFMono-Regular,
            "SF Mono",
            Monaco,
            "Cascadia Code",
            "Segoe UI Mono",
            "Roboto Mono",
            monospace
          );
          font-size: 0.875em;
          background: var(--muted, #f3f4f6);
          padding: 0.2em 0.4em;
          border-radius: 0.375rem;
          color: var(--accent, #db2777);
        }

        /* Code block styling */
        .markdown-content pre {
          margin: 1.5rem 0;
          border-radius: 0.75rem;
          overflow: hidden;
          background: #1e1e1e;
        }

        .markdown-content pre > div {
          margin: 0 !important;
          border-radius: 0.75rem;
          padding: 1.25rem !important;
          font-family: var(
            --font-mono,
            "JetBrains Mono",
            ui-monospace,
            SFMono-Regular,
            "SF Mono",
            Monaco,
            "Cascadia Code",
            "Segoe UI Mono",
            "Roboto Mono",
            monospace
          ) !important;
          font-size: 0.875rem !important;
          line-height: 1.7 !important;
        }

        /* Table styling for GFM */
        .markdown-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          overflow-x: auto;
          display: block;
        }

        .markdown-content th,
        .markdown-content td {
          padding: 0.75rem 1rem;
          border: 1px solid var(--border, #e5e7eb);
          text-align: left;
        }

        .markdown-content th {
          background: var(--muted, #f9fafb);
          font-weight: 600;
        }

        .markdown-content tr:nth-child(even) {
          background: var(--muted, #f9fafb);
        }

        /* Horizontal rule */
        .markdown-content hr {
          margin: 2rem 0;
          border: none;
          border-top: 1px solid var(--border, #e5e7eb);
        }

        /* Strong and emphasis */
        .markdown-content strong {
          font-weight: 600;
          color: var(--foreground, #111827);
        }

        .markdown-content em {
          font-style: italic;
        }

        /* Strikethrough */
        .markdown-content del {
          text-decoration: line-through;
          color: var(--secondary, #6b7280);
        }
      `}</style>
    </div>
  );
}
