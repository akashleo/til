"use client";

import { useState } from "react";
import { TIL } from "@/types/til";
import { formatDate } from "@/lib/utils";
import { Trash2, Edit2, Globe, Lock } from "lucide-react";

interface TilItemProps {
  til: TIL;
  onUpdate: () => void;
}

export default function TilItem({ til, onUpdate }: TilItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(til.content);
  const [tags, setTags] = useState(til.tags.join(", "));
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/til/${til.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });

      if (response.ok) {
        setIsEditing(false);
        onUpdate();
      }
    } catch (error) {
      console.error("Failed to update TIL", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async () => {
    setLoading(true);
    try {
      await fetch(`/api/til/${til.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: !til.is_published }),
      });
      onUpdate();
    } catch (error) {
      console.error("Failed to toggle publish status", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this TIL?")) return;

    setLoading(true);
    try {
      await fetch(`/api/til/${til.id}`, { method: "DELETE" });
      onUpdate();
    } catch (error) {
      console.error("Failed to delete TIL", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="input min-h-[80px]"
          />
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="input"
            placeholder="tags (comma separated)"
          />
          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="btn btn-primary text-sm py-1"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="btn btn-secondary text-sm py-1"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <p className="text-zinc-800 whitespace-pre-wrap">{til.content}</p>
            <div className="flex gap-1 ml-4 shrink-0">
              <button
                onClick={handleTogglePublish}
                disabled={loading}
                className="p-1.5 hover:bg-zinc-100 rounded-md text-zinc-500 hover:text-black"
                title={til.is_published ? "Unpublish" : "Publish"}
              >
                {til.is_published ? <Globe size={18} /> : <Lock size={18} />}
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 hover:bg-zinc-100 rounded-md text-zinc-500 hover:text-black"
                title="Edit"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="p-1.5 hover:bg-zinc-100 rounded-md text-zinc-500 hover:text-red-600"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {til.tags.map((tag) => (
              <span key={tag} className="badge bg-zinc-100 text-zinc-600">
                #{tag}
              </span>
            ))}
            <span className="text-[10px] text-zinc-400 ml-auto">
              {formatDate(til.created_at)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
