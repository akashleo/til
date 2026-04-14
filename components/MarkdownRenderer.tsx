"use client";

import React from "react";
import Link from "next/link";
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
      <div className="markdown">
        <p style={{ color: "var(--secondary)", fontStyle: "italic" }}>
          No content to display.
        </p>
      </div>
    );
  }

  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          a({ href, children, ...props }) {
            if (!href) return <span>{children}</span>;

            const isInternal = href.startsWith("/") && !href.startsWith("//");
            const isSafe =
              href.startsWith("/") ||
              href.startsWith("http://") ||
              href.startsWith("https://") ||
              href.startsWith("mailto:") ||
              href.startsWith("tel:");

            if (!isSafe) {
              return <span>{children}</span>;
            }

            if (isInternal) {
              return (
                <Link href={href} className="markdown-link" {...props}>
                  {children}
                </Link>
              );
            }

            return (
              <a
                href={href}
                className="markdown-link markdown-link-external"
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              >
                {children}
              </a>
            );
          },
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "";
            const isInline = !className;

            if (isInline) {
              return <code {...props}>{children}</code>;
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
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
