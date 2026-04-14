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
    if (!confirm("are you sure you want to delete this til?")) return;

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
      <div className="til-item-header">
        <span
          className={`badge ${
            til.is_published ? "badge-published" : "badge-draft"
          }`}
        >
          {til.is_published ? "published" : "draft"}
        </span>
        <small className="til-item-date">
          {formatDate(til.created_at)}
        </small>
      </div>

      {isEditing ? (
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="title"
            className="til-item-edit-input"
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
          <div className="til-item-actions">
            <button
              onClick={handleUpdate}
              className="primary"
              disabled={loading}
            >
              save
            </button>
            <button onClick={() => setIsEditing(false)}>cancel</button>
          </div>
        </div>
      ) : (
        <>
          <h3 className="til-item-title">{til.title}</h3>
          <p className="til-item-preview">
            {getPreviewText(til.content, 20)}
          </p>
          <div className="til-item-tags">
            {til.tags.map((tag) => (
              <span key={tag} className="tag">
                #{tag}
              </span>
            ))}
          </div>
          <div className="til-item-actions">
            <button onClick={() => setIsEditing(true)}>edit</button>
            <button onClick={togglePublish}>
              {til.is_published ? "unpublish" : "publish"}
            </button>
            <button onClick={handleDelete} className="danger">
              delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}
