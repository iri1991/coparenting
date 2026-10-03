/**
 * Interogări pentru panoul de admin. Doar server-side.
 */
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { isEmailConfigured } from "@/lib/email";
import { isPushConfigured } from "@/lib/push";
import { isStripeConfigured } from "@/lib/stripe";
import type { PlanType } from "@/types/plan";

const DAY_MS = 24 * 60 * 60 * 1000;

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * DAY_MS);
}

function toPlan(p: unknown): PlanType {
  return p === "pro" || p === "family" ? p : "free";
}

function iso(d: unknown): string | null {
  if (!d) return null;
  const date = d instanceof Date ? d : new Date(String(d));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** Funcționalități urmărite: colecție cu `familyId` → etichetă. */
export const FEATURE_COLLECTIONS: { collection: string; label: string }[] = [
  { collection: "schedule_events", label: "Calendar (evenimente)" },
  { collection: "messages", label: "Chat" },
  { collection: "schedule_proposals", label: "Propuneri săptămânale" },
  { collection: "blocked_periods", label: "Zile blocate" },
  { collection: "special_days", label: "Zile speciale" },
  { collection: "shared_expenses", label: "Cheltuieli" },
  { collection: "joint_decisions", label: "Decizii comune" },
  { collection: "parenting_guide", label: "Ghid parental" },
  { collection: "family_rituals", label: "Ritualuri" },
  { collection: "family_recurring_activities", label: "Activități recurente" },
  { collection: "child_activities", label: "Activități copil" },
  { collection: "transition_notes", label: "Note de predare" },
  { collection: "child_mood_entries", label: "Stare copil" },
  { collection: "child_health_conditions", label: "Sănătate" },
  { collection: "child_documents", label: "Documente" },
  { collection: "useful_links", label: "Linkuri utile" },
];

async function distinctFamilyCounts(): Promise<Map<string, Map<string, number>>> {
  const db = await getDb();
  const result = new Map<string, Map<string, number>>();
  await Promise.all(
    FEATURE_COLLECTIONS.map(async ({ collection }) => {
      const rows = (await db
        .collection(collection)
        .aggregate([{ $match: { familyId: { $type: "objectId" } } }, { $group: { _id: "$familyId", count: { $sum: 1 } } }])
        .toArray()) as { _id: ObjectId; count: number }[];
      result.set(collection, new Map(rows.map((r) => [String(r._id), r.count])));
    })
  );
  return result;
}

// ─── Overview ────────────────────────────────────────────────────────────────

export interface AdminOverview {
  totals: {
    users: number;
    usersNew30: number;
    usersActive7: number;
    usersActive30: number;
    usersNeverActive: number;
    families: number;
    familiesActive: number;
    familiesNew30: number;
    paidFamilies: number;
    paymentIssues: number;
    pendingInvitations: number;
    pushSubscribers: number;
    events: number;
    eventsNew7: number;
    messages: number;
    messagesNew7: number;
  };
  plans: Record<PlanType, number>;
  funnel: { label: string; value: number; hint?: string }[];
  weeklySignups: { weekStart: string; users: number; families: number }[];
  features: { label: string; families: number; items: number }[];
  attention: {
    usersWithoutFamily: { id: string; email: string; createdAt: string | null }[];
    familiesUnconfigured: { id: string; name: string; createdAt: string | null }[];
    familiesSingleParent: { id: string; name: string; createdAt: string | null; hasPendingInvite: boolean }[];
    paymentIssues: { id: string; name: string; status: string }[];
  };
  recentUsers: { id: string; email: string; name: string; familyId: string | null; createdAt: string | null }[];
  system: { label: string; ok: boolean; detail?: string }[];
}

type FamilyDoc = {
  _id: ObjectId;
  name?: string | null;
  parent1Name?: string | null;
  parent2Name?: string | null;
  plan?: string;
  active?: boolean;
  memberIds?: string[];
  createdAt?: Date;
  subscriptionStatus?: string;
};

export function familyDisplayName(f: { _id: ObjectId | string; name?: string | null; parent1Name?: string | null; parent2Name?: string | null }): string {
  if (f.name?.trim()) return f.name.trim();
  const parents = [f.parent1Name?.trim(), f.parent2Name?.trim()].filter(Boolean);
  if (parents.length) return parents.join(" & ");
  return `Familie ${String(f._id).slice(-6)}`;
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const db = await getDb();
  const d7 = daysAgo(7);
  const d30 = daysAgo(30);
  const d2 = daysAgo(2);
  const weeksBack = 12;
  const since = daysAgo(weeksBack * 7);

  const [
    users,
    usersNew30,
    usersActive7,
    usersActive30,
    usersNeverActive,
    families,
    pendingInvitations,
    pendingInvites,
    pushSubscribers,
    events,
    eventsNew7,
    messages,
    messagesNew7,
    childrenFamilies,
    residenceFamilies,
    recentUserDocs,
    signupUsers,
    usersWithoutFamilyDocs,
    activeMemberDocs,
    featureCounts,
  ] = await Promise.all([
    db.collection("users").countDocuments(),
    db.collection("users").countDocuments({ createdAt: { $gte: d30 } }),
    db.collection("users").countDocuments({ lastActiveAt: { $gte: d7 } }),
    db.collection("users").countDocuments({ lastActiveAt: { $gte: d30 } }),
    db.collection("users").countDocuments({ lastActiveAt: { $exists: false } }),
    db.collection("families").find({}).project({ name: 1, parent1Name: 1, parent2Name: 1, plan: 1, active: 1, memberIds: 1, createdAt: 1, subscriptionStatus: 1 }).toArray() as Promise<FamilyDoc[]>,
    db.collection("invitations").countDocuments({ status: "pending", expiresAt: { $gt: new Date() } }),
    db.collection("invitations").distinct("familyId", { status: "pending", expiresAt: { $gt: new Date() } }),
    db.collection("push_subscriptions").distinct("userId"),
    db.collection("schedule_events").countDocuments(),
    db.collection("schedule_events").countDocuments({ created_at: { $gte: d7 } }),
    db.collection("messages").countDocuments(),
    db.collection("messages").countDocuments({ createdAt: { $gte: d7 } }),
    db.collection("children").distinct("familyId"),
    db.collection("residences").distinct("familyId"),
    db.collection("users").find({}).sort({ createdAt: -1 }).limit(8).project({ email: 1, name: 1, familyId: 1, createdAt: 1 }).toArray(),
    db.collection("users").find({ createdAt: { $gte: since } }).project({ createdAt: 1 }).toArray(),
    db.collection("users").find({ familyId: null, createdAt: { $lt: d2 } }).sort({ createdAt: -1 }).limit(8).project({ email: 1, createdAt: 1 }).toArray(),
    db.collection("users").find({ familyId: { $ne: null }, lastActiveAt: { $gte: d7 } }).project({ familyId: 1 }).toArray(),
    distinctFamilyCounts(),
  ]);

  const childSet = new Set(childrenFamilies.map(String));
  const residenceSet = new Set(residenceFamilies.map(String));
  const inviteSet = new Set(pendingInvites.map(String));
  const activeFamilySet = new Set(activeMemberDocs.map((u) => String((u as { familyId?: unknown }).familyId)));
  const eventFamilies = featureCounts.get("schedule_events") ?? new Map();

  const plans: Record<PlanType, number> = { free: 0, pro: 0, family: 0 };
  let familiesActive = 0;
  let familiesNew30 = 0;
  let configured = 0;
  let twoParents = 0;
  let withEvents = 0;
  const familiesUnconfigured: AdminOverview["attention"]["familiesUnconfigured"] = [];
  const familiesSingleParent: AdminOverview["attention"]["familiesSingleParent"] = [];
  const paymentIssues: AdminOverview["attention"]["paymentIssues"] = [];

  const sortedFamilies = [...families].sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
  for (const f of sortedFamilies) {
    const id = String(f._id);
    const isActive = f.active !== false;
    plans[toPlan(f.plan)]++;
    if (isActive) familiesActive++;
    if (f.createdAt && f.createdAt >= d30) familiesNew30++;
    const isConfigured = childSet.has(id) && residenceSet.has(id);
    if (isConfigured) configured++;
    const members = (f.memberIds ?? []).length;
    if (members >= 2) twoParents++;
    if (eventFamilies.has(id)) withEvents++;
    if (!isActive) continue;
    const name = familyDisplayName(f);
    if (!isConfigured && f.createdAt && f.createdAt < d2 && familiesUnconfigured.length < 8) {
      familiesUnconfigured.push({ id, name, createdAt: iso(f.createdAt) });
    }
    if (isConfigured && members < 2 && familiesSingleParent.length < 8) {
      familiesSingleParent.push({ id, name, createdAt: iso(f.createdAt), hasPendingInvite: inviteSet.has(id) });
    }
    if (f.subscriptionStatus && ["past_due", "unpaid", "incomplete"].includes(f.subscriptionStatus)) {
      paymentIssues.push({ id, name, status: f.subscriptionStatus });
    }
  }

  const usersWithFamily = await db.collection("users").countDocuments({ familyId: { $ne: null } });

  // Înscrieri pe săptămâni (luni ca început de săptămână)
  const weekStart = (d: Date) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    const day = (x.getDay() + 6) % 7;
    x.setDate(x.getDate() - day);
    return x.toISOString().slice(0, 10);
  };
  const buckets = new Map<string, { users: number; families: number }>();
  const thisWeek = new Date(weekStart(new Date()));
  for (let i = weeksBack - 1; i >= 0; i--) {
    const w = new Date(thisWeek);
    w.setDate(w.getDate() - i * 7);
    buckets.set(w.toISOString().slice(0, 10), { users: 0, families: 0 });
  }
  for (const u of signupUsers) {
    const c = (u as { createdAt?: Date }).createdAt;
    if (!c) continue;
    const b = buckets.get(weekStart(c));
    if (b) b.users++;
  }
  for (const f of families) {
    if (!f.createdAt || f.createdAt < since) continue;
    const b = buckets.get(weekStart(f.createdAt));
    if (b) b.families++;
  }

  const features = FEATURE_COLLECTIONS.map(({ collection, label }) => {
    const m = featureCounts.get(collection) ?? new Map<string, number>();
    let items = 0;
    for (const v of m.values()) items += v;
    return { label, families: m.size, items };
  }).sort((a, b) => b.families - a.families);

  const paidFamilies = plans.pro + plans.family;

  return {
    totals: {
      users,
      usersNew30,
      usersActive7,
      usersActive30,
      usersNeverActive,
      families: families.length,
      familiesActive,
      familiesNew30,
      paidFamilies,
      paymentIssues: paymentIssues.length,
      pendingInvitations,
      pushSubscribers: pushSubscribers.length,
      events,
      eventsNew7,
      messages,
      messagesNew7,
    },
    plans,
    funnel: [
      { label: "Conturi create", value: users },
      { label: "Au creat / intrat într-o familie", value: usersWithFamily, hint: "utilizatori" },
      { label: "Familii configurate", value: configured, hint: "copil + locație" },
      { label: "Familii cu 2 părinți", value: twoParents },
      { label: "Familii cu evenimente", value: withEvents },
      { label: "Familii active 7 zile", value: activeFamilySet.size },
    ],
    weeklySignups: [...buckets.entries()].map(([weekStart, v]) => ({ weekStart, ...v })),
    features,
    attention: {
      usersWithoutFamily: usersWithoutFamilyDocs.map((u) => ({
        id: String(u._id),
        email: (u as { email?: string }).email ?? "",
        createdAt: iso((u as { createdAt?: Date }).createdAt),
      })),
      familiesUnconfigured,
      familiesSingleParent,
      paymentIssues,
    },
    recentUsers: recentUserDocs.map((u) => ({
      id: String(u._id),
      email: (u as { email?: string }).email ?? "",
      name: (u as { name?: string }).name ?? "",
      familyId: (u as { familyId?: unknown }).familyId ? String((u as { familyId?: unknown }).familyId) : null,
      createdAt: iso((u as { createdAt?: Date }).createdAt),
    })),
    system: [
      { label: "Email (Resend)", ok: isEmailConfigured() },
      { label: "Push (VAPID)", ok: isPushConfigured(), detail: `${pushSubscribers.length} utilizatori abonați` },
      { label: "Stripe", ok: isStripeConfigured() },
      { label: "CRON_SECRET", ok: Boolean(process.env.CRON_SECRET) },
    ],
  };
}

// ─── Users ───────────────────────────────────────────────────────────────────

export interface AdminUserRow {
  id: string;
  email: string;
  name: string;
  parentType: string | null;
  familyId: string | null;
  familyName: string | null;
  familyActive: boolean | null;
  plan: PlanType;
  subscriptionStatus: string | null;
  stripeCustomerId: string | null;
  createdAt: string | null;
  lastActiveAt: string | null;
  pushDevices: number;
}

export async function getAdminUsers(): Promise<AdminUserRow[]> {
  const db = await getDb();
  const [users, families, pushRows] = await Promise.all([
    db.collection("users").find({}).sort({ createdAt: -1 }).project({ passwordHash: 0 }).toArray(),
    db.collection("families").find({}).project({ name: 1, parent1Name: 1, parent2Name: 1, plan: 1, active: 1, subscriptionStatus: 1, stripeCustomerId: 1 }).toArray(),
    db.collection("push_subscriptions").aggregate([{ $group: { _id: "$userId", count: { $sum: 1 } } }]).toArray(),
  ]);
  const famById = new Map(families.map((f) => [String(f._id), f as FamilyDoc & { stripeCustomerId?: string }]));
  const pushByUser = new Map((pushRows as { _id: string; count: number }[]).map((r) => [String(r._id), r.count]));
  return users.map((u) => {
    const doc = u as { _id: ObjectId; email?: string; name?: string; parentType?: string; familyId?: unknown; createdAt?: Date; lastActiveAt?: Date };
    const fid = doc.familyId ? String(doc.familyId) : null;
    const fam = fid ? famById.get(fid) : undefined;
    return {
      id: String(doc._id),
      email: doc.email ?? "",
      name: doc.name ?? "",
      parentType: doc.parentType ?? null,
      familyId: fid,
      familyName: fam ? familyDisplayName(fam) : null,
      familyActive: fam ? fam.active !== false : null,
      plan: toPlan(fam?.plan),
      subscriptionStatus: fam?.subscriptionStatus ?? null,
      stripeCustomerId: fam?.stripeCustomerId ?? null,
      createdAt: iso(doc.createdAt),
      lastActiveAt: iso(doc.lastActiveAt),
      pushDevices: pushByUser.get(String(doc._id)) ?? 0,
    };
  });
}

// ─── Families ────────────────────────────────────────────────────────────────

export interface AdminFamilyRow {
  id: string;
  name: string;
  plan: PlanType;
  active: boolean;
  memberEmails: string[];
  memberCount: number;
  childrenCount: number;
  residencesCount: number;
  eventsCount: number;
  messagesCount: number;
  featuresUsed: number;
  pendingInvites: number;
  lastActiveAt: string | null;
  createdAt: string | null;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  stripeCustomerId: string | null;
}

export async function getAdminFamilies(): Promise<AdminFamilyRow[]> {
  const db = await getDb();
  const [families, users, children, residences, invites, featureCounts] = await Promise.all([
    db.collection("families").find({}).sort({ createdAt: -1 }).toArray(),
    db.collection("users").find({ familyId: { $ne: null } }).project({ email: 1, familyId: 1, lastActiveAt: 1 }).toArray(),
    db.collection("children").aggregate([{ $group: { _id: "$familyId", count: { $sum: 1 } } }]).toArray(),
    db.collection("residences").aggregate([{ $group: { _id: "$familyId", count: { $sum: 1 } } }]).toArray(),
    db.collection("invitations").aggregate([
      { $match: { status: "pending", expiresAt: { $gt: new Date() } } },
      { $group: { _id: "$familyId", count: { $sum: 1 } } },
    ]).toArray(),
    distinctFamilyCounts(),
  ]);
  const countMap = (rows: unknown[]) => new Map((rows as { _id: unknown; count: number }[]).map((r) => [String(r._id), r.count]));
  const childrenMap = countMap(children);
  const residencesMap = countMap(residences);
  const invitesMap = countMap(invites);
  const usersByFamily = new Map<string, { email: string; lastActiveAt?: Date }[]>();
  for (const u of users) {
    const fid = String((u as { familyId?: unknown }).familyId);
    const list = usersByFamily.get(fid) ?? [];
    list.push({ email: (u as { email?: string }).email ?? "", lastActiveAt: (u as { lastActiveAt?: Date }).lastActiveAt });
    usersByFamily.set(fid, list);
  }

  return families.map((f) => {
    const doc = f as FamilyDoc & { stripeCustomerId?: string; currentPeriodEnd?: string };
    const id = String(doc._id);
    const members = usersByFamily.get(id) ?? [];
    const lastActive = members.reduce<Date | null>((acc, m) => (m.lastActiveAt && (!acc || m.lastActiveAt > acc) ? m.lastActiveAt : acc), null);
    let featuresUsed = 0;
    for (const m of featureCounts.values()) if (m.has(id)) featuresUsed++;
    return {
      id,
      name: familyDisplayName(doc),
      plan: toPlan(doc.plan),
      active: doc.active !== false,
      memberEmails: members.map((m) => m.email),
      memberCount: (doc.memberIds ?? []).length,
      childrenCount: childrenMap.get(id) ?? 0,
      residencesCount: residencesMap.get(id) ?? 0,
      eventsCount: featureCounts.get("schedule_events")?.get(id) ?? 0,
      messagesCount: featureCounts.get("messages")?.get(id) ?? 0,
      featuresUsed,
      pendingInvites: invitesMap.get(id) ?? 0,
      lastActiveAt: iso(lastActive),
      createdAt: iso(doc.createdAt),
      subscriptionStatus: doc.subscriptionStatus ?? null,
      currentPeriodEnd: doc.currentPeriodEnd ?? null,
      stripeCustomerId: doc.stripeCustomerId ?? null,
    };
  });
}

export interface AdminFamilyDetail {
  id: string;
  name: string;
  parent1Name: string | null;
  parent2Name: string | null;
  plan: PlanType;
  active: boolean;
  createdAt: string | null;
  createdByUserId: string | null;
  householdMode: string | null;
  activityCity: string | null;
  stripe: {
    customerId: string | null;
    subscriptionId: string | null;
    priceId: string | null;
    status: string | null;
    currentPeriodEnd: string | null;
  };
  members: { id: string; email: string; name: string; parentType: string | null; createdAt: string | null; lastActiveAt: string | null; pushDevices: number }[];
  orphanMemberIds: string[];
  children: { id: string; name: string; birthDate: string | null }[];
  residences: { id: string; name: string }[];
  invitations: { id: string; email: string; status: string; createdAt: string | null; expiresAt: string | null; lastReminderSentAt: string | null }[];
  usage: { label: string; count: number }[];
  lastEventCreatedAt: string | null;
  lastMessageAt: string | null;
  recentEvents: { id: string; date: string; parent: string | null; title: string | null; createdAt: string | null }[];
  notes: { id: string; text: string; adminEmail: string; createdAt: string | null }[];
  audit: { id: string; action: string; adminEmail: string; createdAt: string | null; details?: Record<string, unknown> }[];
}

export async function getAdminFamilyDetail(id: string): Promise<AdminFamilyDetail | null> {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  const familyId = new ObjectId(id);
  const family = (await db.collection("families").findOne({ _id: familyId })) as
    | (FamilyDoc & {
        createdByUserId?: string;
        householdMode?: string;
        activityCity?: string;
        stripeCustomerId?: string;
        stripeSubscriptionId?: string;
        stripePriceId?: string;
        currentPeriodEnd?: string;
      })
    | null;
  if (!family) return null;

  const memberIds = (family.memberIds ?? []).filter((m) => ObjectId.isValid(m));
  const [members, children, residences, invitations, usageCounts, lastEvent, lastMessage, recentEvents, notes, audit, pushRows] =
    await Promise.all([
      db.collection("users").find({ $or: [{ familyId }, { _id: { $in: memberIds.map((m) => new ObjectId(m)) } }] }).project({ passwordHash: 0 }).toArray(),
      db.collection("children").find({ familyId }).project({ name: 1, birthDate: 1 }).toArray(),
      db.collection("residences").find({ familyId }).sort({ order: 1 }).project({ name: 1 }).toArray(),
      db.collection("invitations").find({ familyId }).sort({ createdAt: -1 }).limit(20).toArray(),
      Promise.all(FEATURE_COLLECTIONS.map(async ({ collection, label }) => ({ label, count: await db.collection(collection).countDocuments({ familyId }) }))),
      db.collection("schedule_events").find({ familyId }).sort({ created_at: -1 }).limit(1).project({ created_at: 1 }).toArray(),
      db.collection("messages").find({ familyId }).sort({ createdAt: -1 }).limit(1).project({ createdAt: 1 }).toArray(),
      db.collection("schedule_events").find({ familyId }).sort({ date: -1 }).limit(10).project({ date: 1, parent: 1, title: 1, created_at: 1 }).toArray(),
      db.collection("admin_notes").find({ familyId }).sort({ createdAt: -1 }).limit(50).toArray(),
      db.collection("admin_audit_log").find({ targetType: "family", targetId: id }).sort({ createdAt: -1 }).limit(20).toArray(),
      db.collection("push_subscriptions").aggregate([{ $match: { userId: { $in: memberIds } } }, { $group: { _id: "$userId", count: { $sum: 1 } } }]).toArray(),
    ]);

  const pushByUser = new Map((pushRows as { _id: string; count: number }[]).map((r) => [String(r._id), r.count]));
  const memberDocs = members as { _id: ObjectId; email?: string; name?: string; parentType?: string; createdAt?: Date; lastActiveAt?: Date }[];
  const foundIds = new Set(memberDocs.map((m) => String(m._id)));

  return {
    id,
    name: familyDisplayName(family),
    parent1Name: family.parent1Name ?? null,
    parent2Name: family.parent2Name ?? null,
    plan: toPlan(family.plan),
    active: family.active !== false,
    createdAt: iso(family.createdAt),
    createdByUserId: family.createdByUserId ?? null,
    householdMode: family.householdMode ?? null,
    activityCity: family.activityCity ?? null,
    stripe: {
      customerId: family.stripeCustomerId ?? null,
      subscriptionId: family.stripeSubscriptionId ?? null,
      priceId: family.stripePriceId ?? null,
      status: family.subscriptionStatus ?? null,
      currentPeriodEnd: family.currentPeriodEnd ?? null,
    },
    members: memberDocs.map((m) => ({
      id: String(m._id),
      email: m.email ?? "",
      name: m.name ?? "",
      parentType: m.parentType ?? null,
      createdAt: iso(m.createdAt),
      lastActiveAt: iso(m.lastActiveAt),
      pushDevices: pushByUser.get(String(m._id)) ?? 0,
    })),
    orphanMemberIds: memberIds.filter((m) => !foundIds.has(m)),
    children: children.map((c) => ({
      id: String(c._id),
      name: (c as { name?: string }).name ?? "",
      birthDate: (c as { birthDate?: string }).birthDate ?? null,
    })),
    residences: residences.map((r) => ({ id: String(r._id), name: (r as { name?: string }).name ?? "" })),
    invitations: invitations.map((i) => {
      const doc = i as { _id: ObjectId; email?: string; status?: string; createdAt?: Date; expiresAt?: Date; lastReminderSentAt?: Date };
      const expired = doc.status === "pending" && doc.expiresAt && doc.expiresAt < new Date();
      return {
        id: String(doc._id),
        email: doc.email ?? "",
        status: expired ? "expired" : doc.status ?? "pending",
        createdAt: iso(doc.createdAt),
        expiresAt: iso(doc.expiresAt),
        lastReminderSentAt: iso(doc.lastReminderSentAt),
      };
    }),
    usage: usageCounts,
    lastEventCreatedAt: iso((lastEvent[0] as { created_at?: Date } | undefined)?.created_at),
    lastMessageAt: iso((lastMessage[0] as { createdAt?: Date } | undefined)?.createdAt),
    recentEvents: recentEvents.map((e) => ({
      id: String(e._id),
      date: (e as { date?: string }).date ?? "",
      parent: (e as { parent?: string }).parent ?? null,
      title: (e as { title?: string }).title ?? null,
      createdAt: iso((e as { created_at?: Date }).created_at),
    })),
    notes: notes.map((n) => ({
      id: String(n._id),
      text: (n as { text?: string }).text ?? "",
      adminEmail: (n as { adminEmail?: string }).adminEmail ?? "",
      createdAt: iso((n as { createdAt?: Date }).createdAt),
    })),
    audit: audit.map((a) => ({
      id: String(a._id),
      action: (a as { action?: string }).action ?? "",
      adminEmail: (a as { adminEmail?: string }).adminEmail ?? "",
      createdAt: iso((a as { createdAt?: Date }).createdAt),
      details: (a as { details?: Record<string, unknown> }).details,
    })),
  };
}

// ─── Audit ───────────────────────────────────────────────────────────────────

export interface AdminAuditRow {
  id: string;
  action: string;
  adminEmail: string;
  targetType: string | null;
  targetId: string | null;
  details: Record<string, unknown> | null;
  createdAt: string | null;
}

export async function getAdminAuditLog(limit = 100): Promise<AdminAuditRow[]> {
  const db = await getDb();
  const rows = await db.collection("admin_audit_log").find({}).sort({ createdAt: -1 }).limit(limit).toArray();
  return rows.map((a) => ({
    id: String(a._id),
    action: (a as { action?: string }).action ?? "",
    adminEmail: (a as { adminEmail?: string }).adminEmail ?? "",
    targetType: (a as { targetType?: string }).targetType ?? null,
    targetId: (a as { targetId?: string }).targetId ?? null,
    details: (a as { details?: Record<string, unknown> }).details ?? null,
    createdAt: iso((a as { createdAt?: Date }).createdAt),
  }));
}
