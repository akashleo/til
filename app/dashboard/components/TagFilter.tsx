"use client";

import React from "react";

interface TagFilterProps {
  tags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

export default function TagFilter({
  tags,
  selectedTag,
  onSelectTag,
}: TagFilterProps) {
  if (tags.length === 0) return null;

  return (
    <div style={{ marginBottom: "2rem" }}>
      <p style={{ marginBottom: "0.5rem", fontWeight: "bold" }}>Filter by Tag:</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        <button
          onClick={() => onSelectTag(null)}
          className={selectedTag === null ? "primary" : ""}
          style={{ fontSize: "0.8rem" }}
        >
          All
        </button>
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => onSelectTag(tag)}
            className={selectedTag === tag ? "primary" : ""}
            style={{ fontSize: "0.8rem" }}
          >
            #{tag}
          </button>
        ))}
      </div>
    </div>
  );
}
