export interface ChildActivityEntry {
  id: string;
  familyId: string;
  userId: string;
  parentType: "tata" | "mama";
  activityName: string;
  notes?: string;
  periodEndDate: string; // YYYY-MM-DD
  createdAt: string;
}

export interface UsefulLinkEntry {
  id: string;
  familyId: string;
  userId: string;
  title: string;
  url: string;
  category?: string;
  createdAt: string;
}

