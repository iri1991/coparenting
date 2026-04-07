export type HealthResponsibleParent = "tata" | "mama" | "both";

export interface ChildHealthCondition {
  id: string;
  childId: string;
  title: string;
  diagnosedAt?: string;
  status: "active" | "resolved";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChildTreatmentPlan {
  id: string;
  childId: string;
  conditionId?: string;
  medicationName: string;
  dosage: string;
  instructions?: string;
  startDate: string;
  endDate?: string;
  times: string[]; // HH:mm
  reminderLeadMinutes: number;
  responsibleParent: HealthResponsibleParent;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChildTreatmentAdministration {
  id: string;
  childId: string;
  planId: string;
  date: string; // YYYY-MM-DD
  timeLabel: string; // HH:mm
  status: "done" | "skipped";
  notes?: string;
  administeredByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChildMedicalReportRef {
  id: string;
  childId: string;
  name: string;
  contentType: string;
  createdAt: string;
}
