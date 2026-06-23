import type { ParentType } from "./events";

export interface BlockedPeriod {
  id: string;
  userId: string;
  parentType: ParentType;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  startTime?: string; // HH:MM — if set, block begins at this time on startDate
  endTime?: string;   // HH:MM — if set, block ends at this time on endDate
  note?: string;
  createdAt: string;
}
