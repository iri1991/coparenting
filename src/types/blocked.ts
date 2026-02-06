import type { ParentType } from "./events";

export interface BlockedPeriod {
  id: string;
  userId: string;
  parentType: ParentType;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  note?: string;
  createdAt: string;
}
