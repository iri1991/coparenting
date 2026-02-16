/** Plan de plată al unei familii. */
export type PlanType = "free" | "pro" | "family";

export const PLAN_NAMES: Record<PlanType, string> = {
  free: "Free",
  pro: "Pro",
  family: "Family+",
};

/** Limitări per plan. */
export const PLAN_LIMITS = {
  free: {
    maxChildren: 1,
    maxBlockedDaysPerMonth: 5,
    maxResidences: 1,
    maxRecurringActivities: 3,
  },
  pro: {
    maxChildren: 3,
    maxBlockedDaysPerMonth: -1, // nelimitat
    maxResidences: -1,
    maxRecurringActivities: -1,
  },
  family: {
    maxChildren: -1,
    maxBlockedDaysPerMonth: -1,
    maxResidences: -1,
    maxRecurringActivities: -1,
  },
} as const;

/** Funcționalități per plan (true = disponibil). */
export const PLAN_FEATURES = {
  free: {
    weeklyProposal: false,
    documents: false,
    auditLog: false,
    multipleLocations: false,
    childProfileExtended: false, // alergii/medicație/contacte – pe Free doar nume
    exportPdf: false,
    caregivers: false,
  },
  pro: {
    weeklyProposal: true,
    documents: true,
    auditLog: true,
    multipleLocations: true,
    childProfileExtended: true,
    exportPdf: true,
    caregivers: false,
  },
  family: {
    weeklyProposal: true,
    documents: true,
    auditLog: true,
    multipleLocations: true,
    childProfileExtended: true,
    exportPdf: true,
    caregivers: true,
  },
} as const;
