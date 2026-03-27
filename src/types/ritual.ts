export type RitualResponsibleParent = "tata" | "mama" | "both";

export interface FamilyRitual {
  id: string;
  title: string;
  /** Opțional: ora recomandată în format HH:mm (ex. 19:30). */
  timeLabel?: string;
  /** Cu câte minute înainte să trimită reminder (0 = la ora exactă). */
  reminderLeadMinutes: number;
  /** Cine primește reminderul pentru ritual. */
  responsibleParent: RitualResponsibleParent;
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

