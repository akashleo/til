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
    <div className="tag-filter-container">
      <p className="tag-filter-label">filter by tag:</p>
      <div className="tag-filter-buttons">
        <button
          onClick={() => onSelectTag(null)}
          className={selectedTag === null ? "primary tag-filter-btn" : "tag-filter-btn"}
        >
          all
        </button>
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => onSelectTag(tag)}
            className={selectedTag === tag ? "primary tag-filter-btn" : "tag-filter-btn"}
          >
            #{tag}
          </button>
        ))}
      </div>
    </div>
  );
}
