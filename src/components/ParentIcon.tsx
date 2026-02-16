"use client";

import { User, Users } from "lucide-react";
import type { ParentType } from "@/types/events";
import { PARENT_COLORS } from "@/types/events";
import { useFamilyLabels } from "@/contexts/FamilyLabelsContext";

interface ParentIconProps {
  parent: ParentType;
  size?: number;
  className?: string;
  "aria-label"?: string;
}

/** Iconițe pentru părinte 1, părinte 2, Cu toții */
export function ParentIcon({
  parent,
  size = 20,
  className = "",
  "aria-label": ariaLabel,
}: ParentIconProps) {
  const labels = useFamilyLabels();
  const color = PARENT_COLORS[parent];
  const label = ariaLabel ?? labels.parentLabels[parent];

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
