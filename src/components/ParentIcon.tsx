"use client";

import { User, Users } from "lucide-react";
import type { ParentType } from "@/types/events";
import { PARENT_COLORS, PARENT_LABELS } from "@/types/events";

interface ParentIconProps {
  parent: ParentType;
  size?: number;
  className?: string;
  "aria-label"?: string;
}

/** Iconițe pentru Irinel, Andreea, Cu toții */
export function ParentIcon({
  parent,
  size = 20,
  className = "",
  "aria-label": ariaLabel,
}: ParentIconProps) {
  const color = PARENT_COLORS[parent];
  const label = ariaLabel ?? PARENT_LABELS[parent];

  if (parent === "together") {
    return (
      <Users
        size={size}
        className={className}
        style={{ color }}
        aria-label={label}
      />
    );
  }

  return (
    <User
      size={size}
      className={className}
      style={{ color }}
      aria-label={label}
    />
  );
}
