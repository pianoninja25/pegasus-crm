/**
 * Cross-feature primitives. Lifted out of any specific feature so the
 * contact/company/deal/activity types can share them without circular
 * imports.
 */

export type ID = string;

/** Pipeline stages — order matters for the kanban + reports. */
export const DEAL_STAGES = [
  "lead",
  "qualified",
  "proposal",
  "negotiation",
  "closed_won",
  "closed_lost",
] as const;
export type DealStage = (typeof DEAL_STAGES)[number];

export const DEAL_STAGE_META: Record<
  DealStage,
  {
    label: string;
    description: string;
    tone: string;
    /** Hex colour for inline styling (gradients, swatches, dot indicators). */
    color: string;
    probability: number;
  }
> = {
  lead: {
    label: "Lead",
    description: "First contact made, no qualification yet.",
    tone: "bg-slate-500/15 text-slate-300 ring-slate-500/30",
    color: "#94a3b8",
    probability: 0.1,
  },
  qualified: {
    label: "Qualified",
    description: "Budget, authority, need and timeline confirmed.",
    tone: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
    color: "#38bdf8",
    probability: 0.3,
  },
  proposal: {
    label: "Proposal",
    description: "Proposal or quote shared, awaiting feedback.",
    tone: "bg-violet-500/15 text-violet-300 ring-violet-500/30",
    color: "#a78bfa",
    probability: 0.55,
  },
  negotiation: {
    label: "Negotiation",
    description: "Terms, pricing or contract being worked out.",
    tone: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
    color: "#fbbf24",
    probability: 0.75,
  },
  closed_won: {
    label: "Closed · Won",
    description: "Signed, paid or in onboarding.",
    tone: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
    color: "#34d399",
    probability: 1,
  },
  closed_lost: {
    label: "Closed · Lost",
    description: "Lost to competitor, budget, timing or silence.",
    tone: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
    color: "#fb7185",
    probability: 0,
  },
};

/** "Active" stages exclude the terminal closed_* stages. */
export const ACTIVE_STAGES: DealStage[] = [
  "lead",
  "qualified",
  "proposal",
  "negotiation",
];

export type LeadStatus = "new" | "working" | "nurture" | "converted" | "disqualified";

export const LEAD_STATUS_META: Record<
  LeadStatus,
  { label: string; tone: string }
> = {
  new: {
    label: "New",
    tone: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
  },
  working: {
    label: "Working",
    tone: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  },
  nurture: {
    label: "Nurture",
    tone: "bg-violet-500/15 text-violet-300 ring-violet-500/30",
  },
  converted: {
    label: "Converted",
    tone: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  },
  disqualified: {
    label: "Disqualified",
    tone: "bg-slate-500/15 text-slate-300 ring-slate-500/30",
  },
};

export type ActivityKind = "call" | "email" | "meeting" | "task" | "note";

export const ACTIVITY_META: Record<
  ActivityKind,
  { label: string; tone: string }
> = {
  call: { label: "Call", tone: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30" },
  email: { label: "Email", tone: "bg-sky-500/15 text-sky-300 ring-sky-500/30" },
  meeting: { label: "Meeting", tone: "bg-violet-500/15 text-violet-300 ring-violet-500/30" },
  task: { label: "Task", tone: "bg-amber-500/15 text-amber-300 ring-amber-500/30" },
  note: { label: "Note", tone: "bg-slate-500/15 text-slate-300 ring-slate-500/30" },
};

export type Priority = "low" | "normal" | "high" | "urgent";

export const PRIORITY_META: Record<Priority, { label: string; tone: string }> = {
  low: { label: "Low", tone: "bg-slate-500/15 text-slate-300 ring-slate-500/30" },
  normal: {
    label: "Normal",
    tone: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
  },
  high: {
    label: "High",
    tone: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  },
  urgent: {
    label: "Urgent",
    tone: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
  },
};

export interface MoneyAmount {
  amount: number;
  currency: string;
}

export interface TeamMember {
  id: ID;
  name: string;
  email: string;
  title: string;
  role: "owner" | "admin" | "member" | "viewer";
}

export interface Workspace {
  id: ID;
  name: string;
  plan: "Starter" | "Growth" | "Scale";
}
