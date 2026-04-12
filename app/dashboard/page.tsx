"use client";

import React, { useEffect, useState } from "react";
import Container from "@/components/Container";
import { TIL } from "@/types/til";
import TilInput from "./components/TilInput";
import TilList from "./components/TilList";
import TagFilter from "./components/TagFilter";

export default function Dashboard() {
  const [tils, setTils] = useState<TIL[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const fetchTils = async () => {
    try {
      const res = await fetch("/api/til?is_published=false");
      const data = await res.json();
      if (Array.isArray(data)) {
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

  const calculateStreak = () => {
    if (tils.length === 0) return 0;
    
    const dates = tils
      .map((t) => new Date(t.created_at).toDateString())
      .filter((value, index, self) => self.indexOf(value) === index);
    
    let streak = 0;
    const today = new Date().toDateString();
    let currentCheck = new Date();
    
    // If no TIL today, check if there was one yesterday to keep streak alive
    if (dates[0] !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (dates[0] !== yesterday.toDateString()) return 0;
      currentCheck = yesterday;
    }

    for (const date of dates) {
      if (date === currentCheck.toDateString()) {
        streak++;
        currentCheck.setDate(currentCheck.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const streak = calculateStreak();

  return (
    <Container>
      <div style={{ paddingBottom: "4rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "2rem" }}>
          <h1>Dashboard</h1>
          <div className="badge badge-published" style={{ padding: "0.5rem 1rem" }}>
            🔥 {streak} Day Streak
          </div>
        </div>
        
        <TilInput onSuccess={fetchTils} />

        <div style={{ marginTop: "3rem" }}>
          <h2>Unpublished Learnings</h2>
          <TagFilter 
            tags={allTags} 
            selectedTag={selectedTag} 
            onSelectTag={setSelectedTag} 
          />
          
          {loading ? (
            <p>Loading...</p>
          ) : (
            <TilList tils={filteredTils} onUpdate={fetchTils} />
          )}
        </div>
      </div>
    </Container>
  );
}
