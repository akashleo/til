"use client";

import { useState } from "react";

interface TilInputProps {
  onSuccess: () => void;
}

export default function TilInput({ onSuccess }: TilInputProps) {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/til", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });

      if (response.ok) {
        setContent("");
        setTags("");
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to create TIL", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-zinc-50 p-6 rounded-xl border border-zinc-200">
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What did you learn today?"
          className="input min-h-[100px] resize-none"
          required
        />
      </div>
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="tags (comma separated)"
            className="input"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="btn btn-primary h-[42px] px-8"
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </div>
    </form>
  );
}
