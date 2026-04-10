"use client";

import { useEffect, useState } from "react";
import { TIL } from "@/types/til";
import Container from "@/components/Container";
import TilInput from "./components/TilInput";
import TilList from "./components/TilList";
import TagFilter from "./components/TagFilter";

export default function DashboardPage() {
  const [tils, setTils] = useState<TIL[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const fetchTils = async () => {
    try {
      const response = await fetch("/api/til");
      if (response.ok) {
        const data = await response.json();
        setTils(data);
      }
    } catch (error) {
      console.error("Failed to fetch TILs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTils();
  }, []);

  const allTags = Array.from(new Set(tils.flatMap((til) => til.tags)));
  const filteredTils = selectedTag
    ? tils.filter((til) => til.tags.includes(selectedTag))
    : tils;

  return (
    <Container className="py-10">
      <div className="max-w-2xl mx-auto space-y-10">
        <header>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-zinc-500">Track your daily learnings privately.</p>
        </header>

        <TilInput onSuccess={fetchTils} />

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your TILs</h2>
            {tils.length > 0 && (
              <span className="text-sm text-zinc-400">
                {tils.length} total
              </span>
            )}
          </div>

          <TagFilter
            tags={allTags}
            selectedTag={selectedTag}
            onSelect={setSelectedTag}
          />

          {loading ? (
            <div className="text-center py-10 text-zinc-400">Loading...</div>
          ) : (
            <TilList tils={filteredTils} onUpdate={fetchTils} />
          )}
        </div>
      </div>
    </Container>
  );
}
