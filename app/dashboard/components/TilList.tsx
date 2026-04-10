"use client";

import { TIL } from "@/types/til";
import TilItem from "./TilItem";

interface TilListProps {
  tils: TIL[];
  onUpdate: () => void;
}

export default function TilList({ tils, onUpdate }: TilListProps) {
  if (tils.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-xl border-zinc-200">
        <p className="text-zinc-500">No TILs yet. Start by creating one!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tils.map((til) => (
        <TilItem key={til.id} til={til} onUpdate={onUpdate} />
      ))}
    </div>
  );
}
