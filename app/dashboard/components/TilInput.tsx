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
      <h3>what did you learn today?</h3>

      <input
        type="text"
        placeholder="title..."
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
              label="insert heading"
            />
            <ToolbarButton
              onClick={() => handleInsert("list")}
              icon={<List size={16} />}
              label="insert list item"
            />
            <ToolbarButton
              onClick={() => handleInsert("quote")}
              icon={<Quote size={16} />}
              label="insert quote"
            />
          </div>

          <div className="toolbar-divider" />

          <div className="toolbar-group">
            <ToolbarButton
              onClick={() => handleInsert("code-block")}
              icon={<Terminal size={16} />}
              label="insert code block"
            />
            <ToolbarButton
              onClick={() => handleInsert("inline-code")}
              icon={<Code size={16} />}
              label="insert inline code"
            />
          </div>

          <div className="toolbar-divider" />

          <div className="toolbar-group">
            <ToolbarButton
              onClick={() => setIsPreview(false)}
              icon={<Edit3 size={16} />}
              label="edit mode"
              active={!isPreview}
            />
            <ToolbarButton
              onClick={() => setIsPreview(true)}
              icon={<Eye size={16} />}
              label="preview mode"
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
              placeholder="write your til here...&#10;&#10;use markdown for formatting:&#10;- ## for headings&#10;- `backticks` for inline code&#10;- ``` for code blocks&#10;- - for lists&#10;- > for quotes"
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
            <strong>tip:</strong> use the toolbar above or type markdown directly.
            click the eye icon to preview.
          </p>
        )}
      </div>

      <input
        type="text"
        placeholder="tags (comma-separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />

      <button type="submit" className="primary" disabled={loading}>
        {loading ? "saving..." : "save til"}
      </button>
    </form>
  );
}

