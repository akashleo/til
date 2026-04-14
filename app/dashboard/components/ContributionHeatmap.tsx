"use client";

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { TIL } from "@/types/til";

interface ContributionHeatmapProps {
  tils: TIL[];
  onDayClick?: (date: string, dayTils: TIL[]) => void;
}

interface DayData {
  date: string;
  count: number;
  tils: TIL[];
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Color scale for contribution levels (GitHub-style green)
const COLOR_SCALE = {
  0: "#ebedf0", // No contributions - light gray
  1: "#9be9a8", // Low - light green
  2: "#40c463", // Medium - medium green
  3: "#30a14e", // High - darker green
  4: "#216e39", // Very high - darkest green
};

// Normalize date to YYYY-MM-DD format using UTC to avoid timezone issues
function normalizeDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Get color based on count
function getColor(count: number): string {
  if (count === 0) return COLOR_SCALE[0];
  if (count === 1) return COLOR_SCALE[1];
  if (count === 2) return COLOR_SCALE[2];
  if (count === 3) return COLOR_SCALE[3];
  return COLOR_SCALE[4];
}

// Format date for display
function formatDisplayDate(dateString: string): string {
  const date = new Date(dateString + "T00:00:00Z");
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Get month label from date
function getMonthLabel(dateString: string): string {
  const date = new Date(dateString + "T00:00:00Z");
  return date.toLocaleDateString("en-US", { month: "short" });
}

function ContributionHeatmap({
  tils,
  onDayClick,
}: ContributionHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleWeekCount, setVisibleWeekCount] = useState<number | null>(null);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Transform TIL data into date -> count map
  const dateCountMap = useMemo(() => {
    const map = new Map<string, TIL[]>();

    tils.forEach((til) => {
      const normalizedDate = normalizeDate(til.created_at);
      if (!map.has(normalizedDate)) {
        map.set(normalizedDate, []);
      }
      map.get(normalizedDate)!.push(til);
    });

    return map;
  }, [tils]);

  // Generate 365 days of data
  const calendarData = useMemo(() => {
    const data: DayData[] = [];
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Start from 365 days ago
    const startDate = new Date(today);
    startDate.setUTCDate(startDate.getUTCDate() - 364);

    for (let i = 0; i < 365; i++) {
      const currentDate = new Date(startDate);
      currentDate.setUTCDate(startDate.getUTCDate() + i);

      const year = currentDate.getUTCFullYear();
      const month = String(currentDate.getUTCMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getUTCDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      const dayTils = dateCountMap.get(dateString) || [];

      data.push({
        date: dateString,
        count: dayTils.length,
        tils: dayTils,
      });
    }

    return data;
  }, [dateCountMap]);

  // Calculate weeks for grid layout
  const allWeeks = useMemo(() => {
    const weeksArray: DayData[][] = [];

    // Find the first Sunday to align the grid properly
    const firstDay = calendarData[0];
    const firstDayOfWeek = new Date(firstDay.date + "T00:00:00Z").getUTCDay();

    // Pad the beginning with empty days if needed
    const paddedDays: (DayData | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      paddedDays.push(null);
    }

    const allDays = [...paddedDays, ...calendarData];

    // Split into weeks
    for (let i = 0; i < allDays.length; i += 7) {
      weeksArray.push(allDays.slice(i, i + 7) as DayData[]);
    }

    return weeksArray;
  }, [calendarData]);

  // Calculate visible weeks based on container width
  useEffect(() => {
    const calculateVisibleWeeks = () => {
      if (!containerRef.current) return;
      
      const containerWidth = containerRef.current.clientWidth - 32; // Subtract padding
      const weekWidth = 15; // 12px cell + 3px gap
      const maxWeeks = Math.floor(containerWidth / weekWidth);
      
      // Always show at least 12 weeks, but prefer to show all if they fit
      setVisibleWeekCount(Math.min(maxWeeks, allWeeks.length));
    };

    const handleResize = () => {
      calculateVisibleWeeks();
      setIsSmallScreen(window.innerWidth < 640);
    };
    
    handleResize();
    
    const resizeObserver = new ResizeObserver(calculateVisibleWeeks);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    window.addEventListener("resize", handleResize);
    
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [allWeeks.length]);

  // Trim weeks from the left to fit container, keeping today visible
  const weeks = useMemo(() => {
    if (visibleWeekCount === null || allWeeks.length <= visibleWeekCount) {
      return allWeeks;
    }
    // Take the last N weeks so today is always visible
    return allWeeks.slice(allWeeks.length - visibleWeekCount);
  }, [allWeeks, visibleWeekCount]);

  // Calculate month labels for the top of the grid
  const monthLabels = useMemo(() => {
    const labels: { month: string; weekIndex: number }[] = [];
    let currentMonth = "";

    weeks.forEach((week, weekIndex) => {
      const firstValidDay = week.find((day) => day !== null);
      if (firstValidDay) {
        const month = getMonthLabel(firstValidDay.date);
        if (month !== currentMonth) {
          labels.push({ month, weekIndex });
          currentMonth = month;
        }
      }
    });

    return labels;
  }, [weeks]);

  // Calculate streak statistics
  const stats = useMemo(() => {
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let totalContributions = 0;

    // Calculate current streak (from today backwards)
    const reversedData = [...calendarData].reverse();
    let streakActive = true;

    for (const day of reversedData) {
      if (day.count > 0) {
        totalContributions += day.count;
        if (streakActive) {
          currentStreak++;
        }
        tempStreak++;
      } else {
        if (streakActive) {
          streakActive = false;
        }
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak);

    return { currentStreak, longestStreak, totalContributions };
  }, [calendarData]);

  const handleMouseEnter = useCallback(
    (day: DayData, event: React.MouseEvent<HTMLDivElement>) => {
      setHoveredDay(day);
      setTooltipPosition({ x: event.clientX, y: event.clientY });
    },
    []
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      setTooltipPosition({ x: event.clientX, y: event.clientY });
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredDay(null);
  }, []);

  const handleDayClick = useCallback(
    (day: DayData) => {
      if (onDayClick && day.count > 0) {
        onDayClick(day.date, day.tils);
      }
    },
    [onDayClick]
  );

  return (
    <div ref={containerRef} style={{ border: "1px solid var(--border)", borderRadius: "8px", padding: "1.5rem", marginBottom: "1rem" }}>
      <div style={{ display: "flex", flexDirection: isSmallScreen ? "column" : "row", alignItems: isSmallScreen ? "flex-start" : "center", justifyContent: "space-between", marginBottom: "1rem", gap: isSmallScreen ? "0.5rem" : "0" }}>
        <h3 style={{ margin: 0, fontSize: isSmallScreen ? "0.875rem" : "1rem" }}>Contribution Activity</h3>
        <div style={{ display: "flex", gap: isSmallScreen ? "0.75rem" : "1rem", fontSize: isSmallScreen ? "0.75rem" : "0.875rem", color: "var(--secondary)" }}>
          <span>
            <strong>{stats.totalContributions}</strong> contributions
          </span>
          <span>
            <strong>{stats.currentStreak}</strong> day streak
          </span>
          <span>
            <strong>{stats.longestStreak}</strong> longest streak
          </span>
        </div>
      </div>

      {/* Month labels */}
      <div style={{ display: "flex", marginBottom: "0.25rem", position: "relative", height: "1rem" }}>
        {monthLabels.map((label, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              left: `${label.weekIndex * 14 + 8}px`,
              color: "var(--secondary)",
              fontSize: "0.75rem",
            }}
          >
            {label.month}
          </div>
        ))}
      </div>

      {/* Heatmap grid */}
      <div style={{ display: "flex" }}>
        {/* Day labels */}
        {/* <div style={{ display: "flex", flexDirection: "column", marginRight: "0.5rem", fontSize: "0.75rem", color: "var(--secondary)" }}>
          {DAYS_OF_WEEK.filter((_, i) => i % 2 === 1).map((day) => (
            <div key={day} style={{ height: "12px", display: "flex", alignItems: "center", marginBottom: "3px" }}>
              {day}
            </div>
          ))}
        </div> */}

        {/* Grid */}
        <div style={{ display: "flex", gap: "3px" }}>
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              {week.map((day, dayIndex) =>
                day ? (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    onMouseEnter={(e) => handleMouseEnter(day, e)}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleDayClick(day)}
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "2px",
                      cursor: day.count > 0 ? "pointer" : "default",
                      backgroundColor: getColor(day.count),
                      opacity: day.count > 0 ? 1 : 0.7,
                      transition: "all 0.2s",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.outline = "1px solid #666";
                      e.currentTarget.style.outlineOffset = "1px";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.outline = "none";
                    }}
                  />
                ) : (
                  <div key={`${weekIndex}-${dayIndex}`} style={{ width: "12px", height: "12px" }} />
                )
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginTop: "1rem", gap: "0.5rem", fontSize: "0.75rem", color: "var(--secondary)" }}>
        <span>Less</span>
        <div style={{ display: "flex", gap: "3px" }}>
          <div style={{ width: "12px", height: "12px", borderRadius: "2px", backgroundColor: COLOR_SCALE[0] }} />
          <div style={{ width: "12px", height: "12px", borderRadius: "2px", backgroundColor: COLOR_SCALE[1] }} />
          <div style={{ width: "12px", height: "12px", borderRadius: "2px", backgroundColor: COLOR_SCALE[2] }} />
          <div style={{ width: "12px", height: "12px", borderRadius: "2px", backgroundColor: COLOR_SCALE[3] }} />
          <div style={{ width: "12px", height: "12px", borderRadius: "2px", backgroundColor: COLOR_SCALE[4] }} />
        </div>
        <span>More</span>
      </div>

      {/* Tooltip */}
      {hoveredDay && (
        <div
          style={{
            position: "fixed",
            zIndex: 50,
            padding: "0.5rem 0.75rem",
            fontSize: "0.875rem",
            borderRadius: "4px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            pointerEvents: "none",
            left: tooltipPosition.x + 12,
            top: tooltipPosition.y - 40,
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            color: "white",
            whiteSpace: "nowrap",
          }}
        >
          <div style={{ fontWeight: 600 }}>{formatDisplayDate(hoveredDay.date)}</div>
          <div>
            {hoveredDay.count === 0
              ? "No contributions"
              : `${hoveredDay.count} contribution${hoveredDay.count !== 1 ? "s" : ""}`}
          </div>
          {hoveredDay.count > 0 && onDayClick && (
            <div style={{ fontSize: "0.75rem", opacity: 0.75, marginTop: "0.25rem" }}>Click to view</div>
          )}
        </div>
      )}
    </div>
  );
}

export default ContributionHeatmap
