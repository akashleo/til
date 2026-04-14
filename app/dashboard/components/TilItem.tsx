"use client";

import React, { useState } from "react";
import { TIL } from "@/types/til";
import { formatDate, getPreviewText } from "@/lib/utils";

interface TilItemProps {
  til: TIL;
  onUpdate: () => void;
}

export default function TilItem({ til, onUpdate }: TilItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(til.title);
  const [content, setContent] = useState(til.content);
  const [tags, setTags] = useState(til.tags.join(", "));
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const tagList = tags.split(",").map((t) => t.trim());
      const res = await fetch(`/api/til/${til.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, tags: tagList }),
      });

      if (res.ok) {
        setIsEditing(false);
        onUpdate();
      }
    } catch (error) {
      console.error("Update failed", error);
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/til/${til.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: !til.is_published }),
      });

      if (res.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error("Toggle publish failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this TIL?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/til/${til.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error("Delete failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "0.5rem",
        }}
      >
        <span
          className={`badge ${
            til.is_published ? "badge-published" : "badge-draft"
          }`}
        >
          {til.is_published ? "Published" : "Draft"}
        </span>
        <small style={{ color: "var(--secondary)" }}>
          {formatDate(til.created_at)}
        </small>
      </div>

      {isEditing ? (
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            style={{ marginBottom: "0.5rem" }}
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
          />
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={handleUpdate}
              className="primary"
              disabled={loading}
            >
              Save
            </button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <h3 style={{ margin: "0 0 0.5rem 0" }}>{til.title}</h3>
          <p style={{ marginBottom: "1rem", lineHeight: "1.6", color: "var(--secondary)" }}>
            {getPreviewText(til.content, 20)}
          </p>
          <div style={{ marginBottom: "1rem" }}>
            {til.tags.map((tag) => (
              <span key={tag} className="tag">
                #{tag}
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={() => setIsEditing(true)}>Edit</button>
            <button onClick={togglePublish}>
              {til.is_published ? "Unpublish" : "Publish"}
            </button>
            <button onClick={handleDelete} className="danger">
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}
