// Content management for the practice app (PRD §9 and §10).
//
// Each piece of content (a prayer, a meditation, a daily verse, a Jātaka tale) is one CMS
// item. An item holds the working copy that editors change, and separately
// the live copy that the app shows, so editing published content never
// changes the app until it is approved and published again (PRD §10.3).
// Every save is kept as a numbered version, and every action is recorded in
// an audit log.

import type { Prayer } from "@/lib/practice/prayers";
import type { MeditationPractice } from "@/lib/practice/meditations";
import type { DailyVerse } from "@/lib/practice/verses";
import type { JatakaStory } from "@/lib/learn/jataka";

export const CMS_TYPES = ["prayer", "meditation", "verse", "story"] as const;
export type CmsType = (typeof CMS_TYPES)[number];

export interface CmsData {
  prayer: Prayer;
  meditation: MeditationPractice;
  verse: DailyVerse;
  story: JatakaStory;
}

export const TYPE_LABELS: Record<CmsType, { one: string; many: string }> = {
  prayer: { one: "Prayer", many: "Prayers" },
  meditation: { one: "Meditation", many: "Meditations" },
  verse: { one: "Daily verse", many: "Daily Dhamma" },
  story: { one: "Jātaka tale", many: "Jātaka tales" },
};

// ── Publishing states (PRD §10.3) ─────────────────────────────────────────
export const STATUSES = ["draft", "submitted", "in_review", "changes_requested", "approved", "scheduled", "published", "archived"] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<Status, string> = {
  draft: "Draft",
  submitted: "Submitted for review",
  in_review: "In review",
  changes_requested: "Changes requested",
  approved: "Approved",
  scheduled: "Scheduled",
  published: "Published",
  archived: "Archived",
};

// ── Roles (PRD §10.1) ─────────────────────────────────────────────────────
export const ROLES = ["super_admin", "content_admin", "editor", "language_reviewer", "subject_reviewer", "media_manager"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  content_admin: "Content Admin",
  editor: "Editor",
  language_reviewer: "Language Reviewer",
  subject_reviewer: "Subject Reviewer",
  media_manager: "Media Manager",
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  super_admin: "Everything, including who has access.",
  content_admin: "Create, edit, approve, schedule, publish and archive content.",
  editor: "Create and edit content, and send it for review.",
  language_reviewer: "Review and sign off the languages they are assigned.",
  subject_reviewer: "Review tradition, doctrine and sources, and sign off.",
  media_manager: "Generate and manage audio.",
};

export type ReviewLang = "pali" | "hi" | "en";

export interface Actor {
  /** Email, or "admin" for the admin-password Super Admin. */
  id: string;
  name: string;
  role: Role;
  /** Languages a Language Reviewer may sign off. */
  languages: ReviewLang[];
}

export interface RoleAssignment {
  email: string;
  role: Role;
  languages?: ReviewLang[];
}

export type Permission = "view" | "edit" | "create" | "review_language" | "review_subject" | "approve" | "publish" | "audio" | "manage_roles";

const PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: ["view", "edit", "create", "review_language", "review_subject", "approve", "publish", "audio", "manage_roles"],
  content_admin: ["view", "edit", "create", "review_language", "review_subject", "approve", "publish", "audio"],
  editor: ["view", "edit", "create"],
  language_reviewer: ["view", "review_language"],
  subject_reviewer: ["view", "review_subject"],
  media_manager: ["view", "audio"],
};

export function can(actor: Actor, permission: Permission): boolean {
  return PERMISSIONS[actor.role].includes(permission);
}

export function canReviewLanguage(actor: Actor, lang: ReviewLang): boolean {
  if (!can(actor, "review_language")) return false;
  return actor.role !== "language_reviewer" || actor.languages.includes(lang);
}

// ── Workflow transitions ──────────────────────────────────────────────────
export interface Transition {
  to: Status;
  label: string;
  /** Who may make it. */
  needs: Permission[];
  /** A note is required (e.g. what to change). */
  noteRequired?: boolean;
}

const REVIEWERS: Permission[] = ["edit", "review_language", "review_subject"];

export const TRANSITIONS: Record<Status, Transition[]> = {
  draft: [{ to: "submitted", label: "Submit for review", needs: ["edit"] }],
  submitted: [
    { to: "in_review", label: "Start review", needs: REVIEWERS },
    { to: "draft", label: "Withdraw", needs: ["edit"] },
  ],
  in_review: [
    { to: "changes_requested", label: "Request changes", needs: REVIEWERS, noteRequired: true },
    { to: "approved", label: "Approve", needs: ["approve"] },
  ],
  changes_requested: [{ to: "submitted", label: "Resubmit for review", needs: ["edit"] }],
  approved: [
    { to: "published", label: "Publish now", needs: ["publish"] },
    { to: "scheduled", label: "Schedule", needs: ["publish"] },
    { to: "draft", label: "Back to draft", needs: ["edit"] },
  ],
  scheduled: [
    { to: "published", label: "Publish now", needs: ["publish"] },
    { to: "approved", label: "Unschedule", needs: ["publish"] },
  ],
  published: [{ to: "archived", label: "Archive (remove from app)", needs: ["publish"] }],
  archived: [{ to: "draft", label: "Restore as draft", needs: ["edit"] }],
};

export function allowedTransitions(actor: Actor, status: Status): Transition[] {
  return TRANSITIONS[status].filter((t) => t.needs.some((p) => can(actor, p)));
}

// ── Stored documents ─────────────────────────────────────────────────────
export interface WorkflowEvent {
  at: string;
  by: string;
  from: Status;
  to: Status;
  note?: string;
}

export interface CmsItem<T extends CmsType = CmsType> {
  type: T;
  slug: string;
  status: Status;
  /** Working copy. */
  data: CmsData[T];
  /** Version number of the working copy. */
  version: number;
  updatedAt: string;
  updatedBy: string;
  createdAt: string;
  createdBy: string;
  /** Subject (doctrine, tradition, sources) review of the working copy. */
  subjectReview: { status: "pending" | "reviewed"; by?: string; at?: string };
  /** When a scheduled item goes live. */
  scheduledAt?: string;
  /** What the app shows; absent until first published, removed when archived. */
  live?: { data: CmsData[T]; version: number; publishedAt: string; publishedBy: string };
  history: WorkflowEvent[];
}

export interface Version<T extends CmsType = CmsType> {
  version: number;
  at: string;
  by: string;
  note?: string;
  data: CmsData[T];
}

export interface AuditEntry {
  at: string;
  by: string;
  role: Role;
  action: string;
  type?: CmsType;
  slug?: string;
  detail?: string;
}

/** Title shown in lists. */
export function itemTitle(item: CmsItem): string {
  if (item.type === "prayer") {
    const d = item.data as Prayer;
    return `${d.title.pi} — ${d.title.en}`;
  }
  if (item.type === "meditation") {
    const d = item.data as MeditationPractice;
    return `${d.title.en} (${d.pali})`;
  }
  if (item.type === "story") {
    const d = item.data as JatakaStory;
    return `${d.title.en} (Jātaka ${d.number})`;
  }
  const d = item.data as DailyVerse;
  return d.reference;
}

export const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
