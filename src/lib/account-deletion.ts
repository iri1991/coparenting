/**
 * Ștergerea unui cont (cerută de App Store / Google Play și GDPR).
 *
 * - Datele personale ale utilizatorului (cont, dispozitive push, tokenuri) se șterg mereu.
 * - Dacă în familie rămâne celălalt părinte, datele comune (calendar, mesaje etc.) rămân la el.
 * - Dacă utilizatorul era ultimul membru, se șterg toate datele familiei și se anulează abonamentul.
 */
import { ObjectId } from "mongodb";
import type { Db } from "@/lib/plan";
import { removeUserFromFamily } from "@/lib/admin-actions";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

/** Colecțiile cu documente legate de o familie prin `familyId`. */
const FAMILY_COLLECTIONS = [
  "schedule_events",
  "schedule_proposals",
  "blocked_periods",
  "children",
  "residences",
  "invitations",
  "messages",
  "scheduled_messages",
  "special_days",
  "shared_expenses",
  "joint_decisions",
  "parenting_guide",
  "family_rituals",
  "family_ritual_checkins",
  "family_recurring_activities",
  "family_recurring_activity_overrides",
  "child_activities",
  "child_documents",
  "child_health_conditions",
  "child_treatment_plans",
  "child_treatment_administrations",
  "child_medical_reports",
  "child_mood_entries",
  "transition_notes",
  "useful_links",
  "activity_suggestion_decisions",
  "activity_reminder_logs",
  "ritual_reminder_logs",
  "treatment_reminder_logs",
  "family_activity",
  "admin_notes",
];

async function purgeFamily(db: Db, familyId: ObjectId): Promise<void> {
  const family = (await db.collection("families").findOne({ _id: familyId }, { projection: { stripeSubscriptionId: 1 } })) as
    | { stripeSubscriptionId?: string | null }
    | null;
  if (family?.stripeSubscriptionId && isStripeConfigured()) {
    try {
      await getStripe().subscriptions.cancel(family.stripeSubscriptionId);
    } catch (e) {
      console.error("[account-deletion] stripe cancel failed", e);
    }
  }
  await Promise.all(FAMILY_COLLECTIONS.map((c) => db.collection(c).deleteMany({ familyId })));
  await db.collection("families").deleteOne({ _id: familyId });
}

export interface AccountDeletionResult {
  familyDeleted: boolean;
}

export async function deleteUserAccount(db: Db, userId: string): Promise<AccountDeletionResult> {
  const oid = new ObjectId(userId);
  const user = (await db.collection("users").findOne({ _id: oid }, { projection: { email: 1, familyId: 1 } })) as
    | { email?: string; familyId?: unknown }
    | null;
  if (!user) return { familyDeleted: false };

  let familyDeleted = false;
  if (user.familyId) {
    const familyId = new ObjectId(String(user.familyId));
    await removeUserFromFamily(userId, familyId);
    const family = await db.collection("families").findOne({ _id: familyId }, { projection: { memberIds: 1 } });
    const remaining = ((family as { memberIds?: string[] } | null)?.memberIds ?? []).length;
    if (remaining === 0) {
      await purgeFamily(db, familyId);
      familyDeleted = true;
    }
  }

  const email = user.email?.toLowerCase() ?? "";
  await Promise.all([
    db.collection("push_subscriptions").deleteMany({ userId }),
    db.collection("native_push_tokens").deleteMany({ userId }),
    email ? db.collection("password_reset_tokens").deleteMany({ email }) : Promise.resolve(),
    email ? db.collection("rate_limits").deleteMany({ key: `login:${email}` }) : Promise.resolve(),
  ]);
  // Ultimul pas: fără documentul de cont, orice sesiune existentă devine invalidă (vezi lib/auth).
  await db.collection("users").deleteOne({ _id: oid });
  return { familyDeleted };
}
