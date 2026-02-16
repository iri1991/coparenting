import type { ParentType, LocationType } from "./events";

export interface ProposalDay {
  date: string; // YYYY-MM-DD
  parent: ParentType;
  location: LocationType;
}

export interface WeekProposal {
  id: string;
  familyId: string;
  weekStart: string; // YYYY-MM-DD (Monday)
  days: ProposalDay[];
  /** userId -> ISO date when they approved */
  approvedBy: Record<string, string>;
  status: "pending" | "approved";
  createdAt: string;
}
