"use client";

import React, { useState } from "react";

interface TilInputProps {
  onSuccess: () => void;
}

export default function TilInput({ onSuccess }: TilInputProps) {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;

    setLoading(true);
    try {
      const res = await fetch("/api/til", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, tags }),
      });

      if (res.ok) {
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
    <form onSubmit={handleSubmit} className="card">
      <h3>What did you learn today?</h3>
      <textarea
        placeholder="Enter your TIL content..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        required
      />
      <input
        type="text"
        placeholder="Tags (comma-separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />
      <button type="submit" className="primary" disabled={loading}>
        {loading ? "Saving..." : "Save TIL"}
      </button>
    </form>
  );
}
