/** Tipuri pentru răspunsurile API-ului HomeSplit (oglindă a celor din aplicația web). */
export type ParentType = "tata" | "mama" | "together" | "other";

export interface ScheduleEvent {
  id: string;
  date: string;
  parent: ParentType;
  location: "tunari" | "otopeni" | "other";
  locationLabel?: string;
  residenceId?: string;
  title?: string;
  notes?: string;
  startTime?: string;
  endTime?: string;
  caretakerLabel?: string;
}

export interface Residence {
  id: string;
  name: string;
}

export interface Bootstrap {
  user: { id: string; email: string | null; name: string | null; parentType: "tata" | "mama" | null };
  needsSetup?: boolean;
  familyDeactivated?: boolean;
  family: {
    id: string;
    name: string | null;
    parent1Name: string;
    parent2Name: string;
    plan: "free" | "pro" | "family";
    memberCount: number;
    myParentIndex: number;
    children: { id: string; name: string; birthDate: string | null }[];
    residences: Residence[];
  } | null;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderLabel: string;
  text: string;
  createdAt: string;
  seenByOther?: boolean;
  replyTo?: { id: string; senderId: string; senderLabel: string; text: string } | null;
}
