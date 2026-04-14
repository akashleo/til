"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Container from "@/components/Container";
import { TIL } from "@/types/til";
import TilInput from "./components/TilInput";
import TilList from "./components/TilList";
import TagFilter from "./components/TagFilter";
import ContributionHeatmap from "./components/ContributionHeatmap";

export default function Dashboard() {
  const [tils, setTils] = useState<TIL[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedDateTils, setSelectedDateTils] = useState<TIL[] | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  

  const fetchTils = useCallback(async () => {
    try {
      const res = await fetch("/api/til",{
        cache: "no-store",
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setTils(data);
      }
    } catch (error) {
      console.error("Failed to fetch TILs", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTils();
  }, []);

  const allTags = useMemo(
    () => Array.from(new Set(tils.flatMap((til) => til.tags))),
    [tils]
  );

  const filteredTils = useMemo(
    () => (selectedTag ? tils.filter((til) => til.tags.includes(selectedTag)) : tils),
    [tils, selectedTag]
  );

  const streak = useMemo(() => {
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
  }, [tils]);

  const handleDayClick = useCallback((date: string, dayTils: TIL[]) => {
    setSelectedDate(date);
    setSelectedDateTils(dayTils);
  }, []);

  const clearSelectedDate = useCallback(() => {
    setSelectedDate(null);
    setSelectedDateTils(null);
  }, []);

 

  return (
    <Container>
      <div style={{ paddingBottom: "4rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "2rem" }}>
          <h1>Dashboard</h1>
          <div className="badge badge-published" style={{ padding: "0.5rem 1rem" }}>
            🔥 {streak} Day Streak
          </div>
        </div>
        
        <div style={{ marginBottom: "2rem" }}>
          { tils.length > 0 && <ContributionHeatmap tils={tils} onDayClick={handleDayClick} /> }
        </div>

        <TilInput onSuccess={fetchTils} />
        

        {selectedDateTils && selectedDate && (
          <div style={{ marginTop: "2rem" }}>
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ margin: 0 }}>
                  TILs for {new Date(selectedDate + "T00:00:00Z").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </h3>
                <button onClick={clearSelectedDate} style={{ margin: 0 }}>
                  Close
                </button>
              </div>
              <TilList tils={selectedDateTils} onUpdate={fetchTils} />
            </div>
          </div>
        )}

        <div style={{ marginTop: "3rem" }}>
          <h2>All Learnings</h2>
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
