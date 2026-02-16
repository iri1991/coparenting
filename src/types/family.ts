/** Rol în cuplu (abstract), fiecare familie își setează numele (ex. Tata/Mama sau Irinel/Andreea). */
export type ParentRole = "parent1" | "parent2";

import type { PlanType } from "./plan";

export interface Family {
  id: string;
  /** Nume opțional al „cercului” (ex. „Familia X”) */
  name?: string;
  /** ID-ul utilizatorului care a creat familia (invită celălalt părinte). */
  createdByUserId: string;
  /** User IDs ai celor doi părinți (după ce al doilea acceptă invitația). */
  memberIds: string[];
  /** Nume afișat pentru parent1 (ex. Irinel, Tata). */
  parent1Name?: string;
  /** Nume afișat pentru parent2 (ex. Andreea, Mama). */
  parent2Name?: string;
  /** Plan de plată: free | pro | family */
  plan?: PlanType;
  /** Familia este activă (poate fi dezactivată din admin). Implicit true. */
  active?: boolean;
  /** Token unic pentru link partajare program săptămânal (Pro/Family+). */
  shareToken?: string;
  /** Data la care a fost creat linkul de partajare. */
  shareCreatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** Un document încărcat (ex. pașaport, act) – referință cu nume afișat */
export interface TravelDocumentRef {
  id: string;
  name: string;
}

export interface Child {
  id: string;
  familyId: string;
  name: string;
  /** Alergii, intoleranțe etc. */
  allergies?: string;
  /** Documente călătorie – listă de fișiere încărcate cu nume */
  travelDocuments?: TravelDocumentRef[];
  /** Alte informații (sănătate, medicamente, contact doctor etc.) */
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Residence {
  id: string;
  familyId: string;
  name: string;
  /** Ordine afișare / preferință. */
  order?: number;
  createdAt: string;
  updatedAt: string;
}

export type InvitationStatus = "pending" | "accepted" | "expired";

export interface Invitation {
  id: string;
  familyId: string;
  email: string;
  invitedByUserId: string;
  token: string;
  status: InvitationStatus;
  expiresAt: string;
  acceptedAt?: string;
  createdAt: string;
}
