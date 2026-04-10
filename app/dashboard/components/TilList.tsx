"use client";

import React from "react";
import { TIL } from "@/types/til";
import TilItem from "./TilItem";

interface TilListProps {
  tils: TIL[];
  onUpdate: () => void;
}

export default function TilList({ tils, onUpdate }: TilListProps) {
  if (tils.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "2rem", color: "var(--secondary)" }}>
        No TILs yet. Start learning!
      </div>
    );
  }

  return (
    <div>
      {tils.map((til) => (
        <TilItem key={til.id} til={til} onUpdate={onUpdate} />
      ))}
    </div>
  );
}
