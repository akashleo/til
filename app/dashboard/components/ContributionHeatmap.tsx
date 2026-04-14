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

// Normalize date to YYYY-MM-DD format using UTC to avoid timezone issues
function normalizeDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Get heatmap level class based on count
function getLevelClass(count: number): string {
  if (count === 0) return "heatmap-level-0";
  if (count === 1) return "heatmap-level-1";
  if (count === 2) return "heatmap-level-2";
  if (count === 3) return "heatmap-level-3";
  return "heatmap-level-4";
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
    
    calculateVisibleWeeks();
    
    const resizeObserver = new ResizeObserver(calculateVisibleWeeks);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    return () => {
      resizeObserver.disconnect();
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
    <div ref={containerRef} className="heatmap-container">
      <div className="heatmap-header">
        <div className="heatmap-stats">
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
      <div className="heatmap-months">
        {monthLabels.map((label, index) => (
          <div
            key={index}
            className="heatmap-month-label"
            style={{ left: `${label.weekIndex * 14 + 8}px` }}
          >
            {label.month}
          </div>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="heatmap-grid-wrapper">
        {/* Grid */}
        <div className="heatmap-grid">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="heatmap-week">
              {week.map((day, dayIndex) =>
                day ? (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    onMouseEnter={(e) => handleMouseEnter(day, e)}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleDayClick(day)}
                    className={`heatmap-cell ${getLevelClass(day.count)}`}
                  />
                ) : (
                  <div key={`${weekIndex}-${dayIndex}`} className="heatmap-cell-empty" />
                )
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="heatmap-legend">
        <span>less</span>
        <div className="heatmap-legend-cells">
          <div className="heatmap-cell heatmap-level-0" />
          <div className="heatmap-cell heatmap-level-1" />
          <div className="heatmap-cell heatmap-level-2" />
          <div className="heatmap-cell heatmap-level-3" />
          <div className="heatmap-cell heatmap-level-4" />
        </div>
        <span>more</span>
      </div>

      {/* Tooltip */}
      {hoveredDay && (
        <div
          className="heatmap-tooltip"
          style={{
            left: tooltipPosition.x + 12,
            top: tooltipPosition.y - 40,
          }}
        >
          <div className="heatmap-tooltip-date">{formatDisplayDate(hoveredDay.date)}</div>
          <div>
            {hoveredDay.count === 0
              ? "no contributions"
              : `${hoveredDay.count} contribution${hoveredDay.count !== 1 ? "s" : ""}`}
          </div>
          {hoveredDay.count > 0 && onDayClick && (
            <div className="heatmap-tooltip-hint">click to view</div>
          )}
        </div>
      )}
    </div>
  );
}

export default ContributionHeatmap
