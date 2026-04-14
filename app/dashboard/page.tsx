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

  

  const [activeTab, setActiveTab] = useState<"add" | "list">("add");

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

  const handleSuccess = useCallback(() => {
    fetchTils();
    setActiveTab("list");
  }, [fetchTils]);

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
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="dashboard-tabs">
            <button
              className={`tab-btn ${activeTab === "add" ? "active" : ""}`}
              onClick={() => setActiveTab("add")}
            >
              create til
            </button>
            <button
              className={`tab-btn ${activeTab === "list" ? "active" : ""}`}
              onClick={() => setActiveTab("list")}
            >
              learnings
            </button>
          </div>
          <div className="badge badge-published dashboard-streak-badge">
            🔥 {streak} day streak
          </div>
        </div>

        {activeTab === "add" ? (
          <>
          <div className="dashboard-section">
            <TilInput onSuccess={handleSuccess} />
          </div>
           <div className="dashboard-section mt-12">
          <h2 className="mb-4 text-center">your contribution activity</h2>
          { tils.length > 0 && <ContributionHeatmap tils={tils} onDayClick={handleDayClick} /> }
        </div>

        {selectedDateTils && selectedDate && (
          <div className="date-detail-card">
            <div className="card">
              <div className="date-detail-header">
                <h3 className="date-detail-title">
                  tils for {new Date(selectedDate + "T00:00:00Z").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </h3>
                <button onClick={clearSelectedDate} className="date-detail-close-btn">
                  close
                </button>
              </div>
              <TilList tils={selectedDateTils} onUpdate={fetchTils} />
            </div>
          </div>
        )}
          </>
        ) : (
          <div className="dashboard-section-large">
            <TagFilter
              tags={allTags}
              selectedTag={selectedTag}
              onSelectTag={setSelectedTag}
            />

            {loading ? (
              <p>loading...</p>
            ) : (
              <TilList tils={filteredTils} onUpdate={fetchTils} />
            )}
          </div>
        )}

        
      </div>
    </Container>
  );
}
