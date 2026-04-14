"use client";

import React, { useState, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Heading,
  Code,
  List,
  Eye,
  Edit3,
  Terminal,
  Quote,
} from "lucide-react";

interface TilInputProps {
  onSuccess: () => void;
}

type InsertAction =
  | "heading"
  | "code-block"
  | "inline-code"
  | "list"
  | "quote";

interface InsertConfig {
  prefix: string;
  suffix: string;
  placeholder: string;
}

const INSERT_CONFIGS: Record<InsertAction, InsertConfig> = {
  heading: { prefix: "## ", suffix: "", placeholder: "Heading" },
  "code-block": {
    prefix: "\n```ts\n",
    suffix: "\n```\n",
    placeholder: "// Your code here",
  },
  "inline-code": { prefix: "`", suffix: "`", placeholder: "code" },
  list: { prefix: "- ", suffix: "", placeholder: "List item" },
  quote: { prefix: "> ", suffix: "", placeholder: "Quote" },
};

// Utility: Insert text at cursor position or wrap selected text
function insertAtCursor(
  textarea: HTMLTextAreaElement,
  config: InsertConfig
): string {
  const { selectionStart, selectionEnd, value } = textarea;
  const selectedText = value.substring(selectionStart, selectionEnd);

  let newText: string;
  let newCursorPos: number;

  if (selectedText) {
    // Wrap selected text
    newText =
      value.substring(0, selectionStart) +
      config.prefix +
      selectedText +
      config.suffix +
      value.substring(selectionEnd);
    newCursorPos = selectionStart + config.prefix.length + selectedText.length;
  } else {
    // Insert with placeholder
    const placeholder = config.placeholder;
    newText =
      value.substring(0, selectionStart) +
      config.prefix +
      placeholder +
      config.suffix +
      value.substring(selectionEnd);
    newCursorPos =
      selectionStart + config.prefix.length + placeholder.length / 2;
  }

  // Update textarea value
  textarea.value = newText;

  // Restore focus and set cursor position
  textarea.focus();
  textarea.setSelectionRange(newCursorPos, newCursorPos);

  return newText;
}

// Toolbar Button Component
interface ToolbarButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

function ToolbarButton({ onClick, icon, label, active }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`toolbar-btn ${active ? "active" : ""}`}
      title={label}
      aria-label={label}
    >
      {icon}
    </button>
  );
}

// Markdown Preview Component
interface MarkdownPreviewProps {
  content: string;
}

function MarkdownPreview({ content }: MarkdownPreviewProps) {
  if (!content.trim()) {
    return (
      <div className="preview-empty">
        <p>Start typing to see preview...</p>
      </div>
    );
  }

  return (
    <div className="markdown-preview">
      <ReactMarkdown
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "";
            const isInline = !className;

            if (isInline) {
              return (
                <code className="inline-code" {...props}>
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
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default function TilInput({ onSuccess }: TilInputProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInsert = useCallback((action: InsertAction) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const config = INSERT_CONFIGS[action];
    const newValue = insertAtCursor(textarea, config);
    setContent(newValue);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setLoading(true);
    try {
      const res = await fetch("/api/til", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, tags }),
      });

      if (res.ok) {
        setTitle("");
        setContent("");
        setTags("");
        setIsPreview(false);
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to create TIL", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="til-form">
      <h3>What did you learn today?</h3>

      <input
        type="text"
        placeholder="Title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <div className="editor-container">
        {/* Toolbar */}
        <div className="toolbar">
          <div className="toolbar-group">
            <ToolbarButton
              onClick={() => handleInsert("heading")}
              icon={<Heading size={16} />}
              label="Insert Heading"
            />
            <ToolbarButton
              onClick={() => handleInsert("list")}
              icon={<List size={16} />}
              label="Insert List Item"
            />
            <ToolbarButton
              onClick={() => handleInsert("quote")}
              icon={<Quote size={16} />}
              label="Insert Quote"
            />
          </div>

          <div className="toolbar-divider" />

          <div className="toolbar-group">
            <ToolbarButton
              onClick={() => handleInsert("code-block")}
              icon={<Terminal size={16} />}
              label="Insert Code Block"
            />
            <ToolbarButton
              onClick={() => handleInsert("inline-code")}
              icon={<Code size={16} />}
              label="Insert Inline Code"
            />
          </div>

          <div className="toolbar-divider" />

          <div className="toolbar-group">
            <ToolbarButton
              onClick={() => setIsPreview(false)}
              icon={<Edit3 size={16} />}
              label="Edit Mode"
              active={!isPreview}
            />
            <ToolbarButton
              onClick={() => setIsPreview(true)}
              icon={<Eye size={16} />}
              label="Preview Mode"
              active={isPreview}
            />
          </div>
        </div>

        {/* Editor / Preview Toggle */}
        <div className="editor-content">
          {isPreview ? (
            <MarkdownPreview content={content} />
          ) : (
            <textarea
              ref={textareaRef}
              placeholder="Write your TIL here...&#10;&#10;Use Markdown for formatting:&#10;- ## for headings&#10;- `backticks` for inline code&#10;- ``` for code blocks&#10;- - for lists&#10;- > for quotes"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              required
              className="editor-textarea"
            />
          )}
        </div>

        {/* Helper Text */}
        {!isPreview && (
          <p className="helper-text">
            <strong>Tip:</strong> Use the toolbar above or type Markdown directly.
            Click the eye icon to preview.
          </p>
        )}
      </div>

      <input
        type="text"
        placeholder="Tags (comma-separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />

      <button type="submit" className="primary" disabled={loading}>
        {loading ? "Saving..." : "Save TIL"}
      </button>

      {/* Scoped Styles */}
      <style jsx>{`
        .til-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .til-form h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .til-form input[type="text"] {
          padding: 0.75rem 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          font-size: 1rem;
          background: white;
          transition: border-color 0.2s;
        }

        .til-form input[type="text"]:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .editor-container {
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          overflow: hidden;
        }

        .toolbar {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.5rem;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          flex-wrap: wrap;
        }

        .toolbar-group {
          display: flex;
          gap: 0.25rem;
        }

        .toolbar-divider {
          width: 1px;
          height: 1.25rem;
          background: #d1d5db;
          margin: 0 0.25rem;
        }

        .toolbar-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          border: none;
          border-radius: 0.375rem;
          background: transparent;
          color: #4b5563;
          cursor: pointer;
          transition: all 0.15s;
        }

        .toolbar-btn:hover {
          background: #e5e7eb;
          color: #1f2937;
        }

        .toolbar-btn.active {
          background: #3b82f6;
          color: white;
        }

        .editor-content {
          min-height: 200px;
        }

        .editor-textarea {
          width: 100%;
          padding: 1rem;
          border: none;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Monaco,
            "Cascadia Code", "Segoe UI Mono", "Roboto Mono", monospace;
          font-size: 0.875rem;
          line-height: 1.6;
          resize: vertical;
          background: white;
        }

        .editor-textarea:focus {
          outline: none;
        }

        .helper-text {
          margin: 0;
          padding: 0.5rem 1rem;
          font-size: 0.75rem;
          color: #6b7280;
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
        }

        .preview-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 200px;
          padding: 2rem;
          color: #9ca3af;
          font-style: italic;
        }

        .markdown-preview {
          padding: 1rem;
          min-height: 200px;
          background: white;
        }

        .markdown-preview :global(h1),
        .markdown-preview :global(h2),
        .markdown-preview :global(h3) {
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          font-weight: 600;
          line-height: 1.3;
        }

        .markdown-preview :global(h1) {
          font-size: 1.5rem;
        }

        .markdown-preview :global(h2) {
          font-size: 1.25rem;
        }

        .markdown-preview :global(h3) {
          font-size: 1.125rem;
        }

        .markdown-preview :global(p) {
          margin-bottom: 0.75rem;
          line-height: 1.6;
        }

        .markdown-preview :global(ul),
        .markdown-preview :global(ol) {
          margin-bottom: 0.75rem;
          padding-left: 1.5rem;
        }

        .markdown-preview :global(li) {
          margin-bottom: 0.25rem;
        }

        .markdown-preview :global(blockquote) {
          margin: 1rem 0;
          padding: 0.5rem 1rem;
          border-left: 4px solid #e5e7eb;
          background: #f9fafb;
          color: #4b5563;
          font-style: italic;
        }

        .markdown-preview :global(pre) {
          margin: 1rem 0;
          border-radius: 0.5rem;
          overflow: hidden;
        }

        .markdown-preview :global(.inline-code) {
          background: #f3f4f6;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Monaco,
            "Cascadia Code", "Segoe UI Mono", "Roboto Mono", monospace;
          font-size: 0.875em;
          color: #db2777;
        }

        .primary {
          padding: 0.75rem 1.5rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .primary:hover:not(:disabled) {
          background: #2563eb;
        }

        .primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </form>
  );
}

