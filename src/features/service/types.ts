/**
 * Domain primitives for the AC service business management system.
 *
 * Keeping all shared enums + metadata in one file mirrors the
 * pattern from the legacy CRM types module (DEAL_STAGE_META, ACTIVITY_META,
 * ...) so the UI can render a coloured pill from any value in O(1).
 */

export type ID = string;

/* -------------------------------------------------------------------------- */
/* Users + roles                                                              */
/* -------------------------------------------------------------------------- */

/** Top-level access role for the application. */
export type UserRole = "administrator" | "manager" | "admin_staff" | "engineer";

export const ROLE_META: Record<UserRole, { label: string; tone: string }> = {
  administrator: {
    label: "Administrator",
    tone: "bg-violet-500/20 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300 ring-violet-500/40",
  },
  manager: {
    label: "Manager",
    tone: "bg-sky-500/20 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300 ring-sky-500/40",
  },
  admin_staff: {
    label: "Admin Staff",
    tone: "bg-amber-500/20 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 ring-amber-500/40",
  },
  engineer: {
    label: "Engineer",
    tone: "bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 ring-emerald-500/40",
  },
};

export interface AppUser {
  id: ID;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  /** Job title for the topbar / sidebar. */
  title: string;
  /** Engineers carry an additional skill list + availability. */
  skills?: string[];
  /** Star rating averaged across completed jobs (engineers only). */
  rating?: number;
  /** Years of HVAC experience. */
  experienceYears?: number;
  /** Mock avatar tint. */
  hue?: number;
}

export interface Company {
  id: ID;
  name: string;
  plan: "Starter" | "Growth" | "Scale";
}

/* -------------------------------------------------------------------------- */
/* Customers + AC Units                                                       */
/* -------------------------------------------------------------------------- */

export type CustomerType = "residential" | "commercial" | "industrial";

export const CUSTOMER_TYPE_META: Record<
  CustomerType,
  { label: string; tone: string }
> = {
  residential: {
    label: "Residential",
    tone: "bg-sky-500/20 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300 ring-sky-500/40",
  },
  commercial: {
    label: "Commercial",
    tone: "bg-violet-500/20 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300 ring-violet-500/40",
  },
  industrial: {
    label: "Industrial",
    tone: "bg-amber-500/20 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 ring-amber-500/40",
  },
};

/**
 * Where the customer is in their relationship with us.
 *
 * The app uses the "loose" CRM model: only ever one `Customer` entity, with
 * the **lifecycle stage derived** from the customer's actual business
 * activity (quotations, invoices, contracts). No separate Lead/Prospect
 * table — see {@link customerLifecycle} in `seed.ts` for the derivation.
 *
 * - `prospect`  → in the pipeline (drafts/sent quotes only, no money in yet)
 * - `active`    → we've actually transacted with them
 * - `vip`       → active **and** on a recurring service contract (best segment)
 * - `dormant`   → was active but no activity for 6+ months
 */
export type CustomerLifecycle = "prospect" | "active" | "vip" | "dormant";

export const CUSTOMER_LIFECYCLE_META: Record<
  CustomerLifecycle,
  { label: string; tone: string; color: string; dotClass: string }
> = {
  prospect: {
    label: "Prospect",
    tone: "bg-slate-500/20 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300 ring-slate-500/40",
    color: "#94a3b8",
    dotClass: "bg-slate-400",
  },
  active: {
    label: "Active",
    tone: "bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 ring-emerald-500/40",
    color: "#34d399",
    dotClass: "bg-emerald-500",
  },
  vip: {
    label: "VIP",
    tone: "bg-violet-500/20 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300 ring-violet-500/40",
    color: "#a78bfa",
    dotClass: "bg-violet-500",
  },
  dormant: {
    label: "Dormant",
    tone: "bg-amber-500/20 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 ring-amber-500/40",
    color: "#fbbf24",
    dotClass: "bg-amber-500",
  },
};

export interface Customer {
  id: ID;
  type: CustomerType;
  /** Person we usually talk to. */
  contactPerson: string;
  /** Display name. For commercial customers usually the company name; for
   *  residential usually the contact person's name. */
  name: string;
  companyName?: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  /** Latitude / longitude pair for the map view. */
  lat: number;
  lng: number;
  tags: string[];
  /** Account manager / owner inside our team. */
  ownerId: ID;
  notes: string;
  /** Lifetime value, USD. */
  lifetimeValue: number;
  /** ISO created timestamp. */
  createdAt: string;
  /** ISO last-touched timestamp. */
  lastTouchedAt: string;
}

export type UnitType =
  | "split"
  | "window"
  | "central"
  | "vrf"
  | "cassette"
  | "chiller";

export const UNIT_TYPE_META: Record<UnitType, { label: string }> = {
  split: { label: "Split" },
  window: { label: "Window" },
  central: { label: "Central" },
  vrf: { label: "VRF" },
  cassette: { label: "Cassette" },
  chiller: { label: "Chiller" },
};

export type UnitCondition = "excellent" | "good" | "fair" | "poor";

export const UNIT_CONDITION_META: Record<
  UnitCondition,
  { label: string; tone: string; score: number }
> = {
  excellent: {
    label: "Excellent",
    tone: "bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 ring-emerald-500/40",
    score: 4,
  },
  good: {
    label: "Good",
    tone: "bg-sky-500/20 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300 ring-sky-500/40",
    score: 3,
  },
  fair: {
    label: "Fair",
    tone: "bg-amber-500/20 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 ring-amber-500/40",
    score: 2,
  },
  poor: {
    label: "Poor",
    tone: "bg-rose-500/20 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 ring-rose-500/40",
    score: 1,
  },
};

export interface AcUnit {
  id: ID;
  customerId: ID;
  brand: string;
  model: string;
  type: UnitType;
  /** Cooling capacity in BTU. */
  btu: number;
  serialNumber: string;
  installedAt: string;
  location: string;
  condition: UnitCondition;
  /** Last serviced date (ISO). */
  lastServicedAt?: string;
}

/* -------------------------------------------------------------------------- */
/* Quotations                                                                 */
/* -------------------------------------------------------------------------- */

export type QuotationCategory =
  | "service"
  | "product"
  | "spare_parts"
  | "service_contract";

export const QUOTATION_CATEGORY_META: Record<
  QuotationCategory,
  { label: string; tone: string }
> = {
  service: {
    label: "Service",
    tone: "bg-sky-500/20 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300 ring-sky-500/40",
  },
  product: {
    label: "Product",
    tone: "bg-violet-500/20 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300 ring-violet-500/40",
  },
  spare_parts: {
    label: "Spare Parts",
    tone: "bg-amber-500/20 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 ring-amber-500/40",
  },
  service_contract: {
    label: "Service Contract",
    tone: "bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 ring-emerald-500/40",
  },
};

export type QuotationStatus =
  | "draft"
  | "sent"
  | "approved"
  | "rejected"
  | "expired";

export const QUOTATION_STATUS_META: Record<
  QuotationStatus,
  { label: string; tone: string; color: string }
> = {
  draft: {
    label: "Draft",
    tone: "bg-slate-500/20 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300 ring-slate-500/40",
    color: "#94a3b8",
  },
  sent: {
    label: "Sent",
    tone: "bg-sky-500/20 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300 ring-sky-500/40",
    color: "#38bdf8",
  },
  approved: {
    label: "Approved",
    tone: "bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 ring-emerald-500/40",
    color: "#34d399",
  },
  rejected: {
    label: "Rejected",
    tone: "bg-rose-500/20 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 ring-rose-500/40",
    color: "#fb7185",
  },
  expired: {
    label: "Expired",
    tone: "bg-amber-500/20 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 ring-amber-500/40",
    color: "#fbbf24",
  },
};

export interface QuotationLine {
  id: ID;
  description: string;
  quantity: number;
  unitPrice: number;
  /** Optional tax percentage applied to this line. */
  taxPct?: number;
}

export interface Quotation {
  id: ID;
  number: string;
  customerId: ID;
  category: QuotationCategory;
  status: QuotationStatus;
  title: string;
  notes?: string;
  lines: QuotationLine[];
  /** Optional global discount percentage. */
  discountPct: number;
  taxPct: number;
  ownerId: ID;
  /** ISO created timestamp. */
  createdAt: string;
  /** ISO validity date. */
  validUntil: string;
  /** ISO timestamp when sent / approved (if applicable). */
  sentAt?: string;
  decidedAt?: string;
  /** If approved + converted, the resulting entity ids. */
  convertedToContractId?: ID;
  convertedToWorkOrderId?: ID;
}

/* -------------------------------------------------------------------------- */
/* Service Contracts                                                          */
/* -------------------------------------------------------------------------- */

export type ContractType =
  | "ac_cleaning"
  | "ac_replacement"
  | "spare_part_replacement"
  | "preventive_maintenance"
  | "custom";

export const CONTRACT_TYPE_META: Record<
  ContractType,
  { label: string; tone: string }
> = {
  ac_cleaning: {
    label: "AC Cleaning",
    tone: "bg-sky-500/20 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300 ring-sky-500/40",
  },
  ac_replacement: {
    label: "AC Replacement",
    tone: "bg-violet-500/20 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300 ring-violet-500/40",
  },
  spare_part_replacement: {
    label: "Spare Part Replacement",
    tone: "bg-amber-500/20 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 ring-amber-500/40",
  },
  preventive_maintenance: {
    label: "Preventive Maintenance",
    tone: "bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 ring-emerald-500/40",
  },
  custom: {
    label: "Custom Package",
    tone: "bg-rose-500/20 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 ring-rose-500/40",
  },
};

export type ServiceFrequency =
  | "monthly"
  | "quarterly"
  | "biannual"
  | "annual"
  | "custom";

export const FREQUENCY_META: Record<
  ServiceFrequency,
  { label: string; intervalDays: number }
> = {
  monthly: { label: "Every month", intervalDays: 30 },
  quarterly: { label: "Every 3 months", intervalDays: 90 },
  biannual: { label: "Every 6 months", intervalDays: 182 },
  annual: { label: "Every year", intervalDays: 365 },
  custom: { label: "Custom interval", intervalDays: 60 },
};

export type ContractStatus =
  | "active"
  | "expiring_soon"
  | "completed"
  | "awaiting_renewal"
  | "draft";

export const CONTRACT_STATUS_META: Record<
  ContractStatus,
  { label: string; tone: string; color: string }
> = {
  draft: {
    label: "Draft",
    tone: "bg-slate-500/20 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300 ring-slate-500/40",
    color: "#94a3b8",
  },
  active: {
    label: "Active",
    tone: "bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 ring-emerald-500/40",
    color: "#34d399",
  },
  expiring_soon: {
    label: "Expiring soon",
    tone: "bg-amber-500/20 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 ring-amber-500/40",
    color: "#fbbf24",
  },
  awaiting_renewal: {
    label: "Awaiting renewal",
    tone: "bg-sky-500/20 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300 ring-sky-500/40",
    color: "#38bdf8",
  },
  completed: {
    label: "Completed",
    tone: "bg-violet-500/20 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300 ring-violet-500/40",
    color: "#a78bfa",
  },
};

export interface ServiceContract {
  id: ID;
  number: string;
  customerId: ID;
  type: ContractType;
  status: ContractStatus;
  /** ISO. */
  startDate: string;
  /** ISO. */
  endDate: string;
  frequency: ServiceFrequency;
  /** Custom interval (days) if frequency = custom. */
  customIntervalDays?: number;
  /** Assigned engineer. */
  engineerId: ID;
  /** Contract value, USD. */
  value: number;
  notes: string;
  /** Owning AC units this contract covers. */
  unitIds: ID[];
}

/* -------------------------------------------------------------------------- */
/* Service visits / work orders                                               */
/* -------------------------------------------------------------------------- */

export type VisitStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "overdue"
  | "cancelled";

export const VISIT_STATUS_META: Record<
  VisitStatus,
  { label: string; tone: string; color: string }
> = {
  scheduled: {
    label: "Scheduled",
    tone: "bg-sky-500/20 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300 ring-sky-500/40",
    color: "#38bdf8",
  },
  in_progress: {
    label: "In progress",
    tone: "bg-amber-500/20 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 ring-amber-500/40",
    color: "#fbbf24",
  },
  completed: {
    label: "Completed",
    tone: "bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 ring-emerald-500/40",
    color: "#34d399",
  },
  overdue: {
    label: "Overdue",
    tone: "bg-rose-500/20 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 ring-rose-500/40",
    color: "#fb7185",
  },
  cancelled: {
    label: "Cancelled",
    tone: "bg-slate-500/20 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300 ring-slate-500/40",
    color: "#94a3b8",
  },
};

export const SERVICE_CHECKLIST_TEMPLATE = [
  { id: "indoor_clean", label: "Indoor unit cleaned" },
  { id: "outdoor_clean", label: "Outdoor unit cleaned" },
  { id: "gas_pressure", label: "Gas pressure checked" },
  { id: "electrical", label: "Electrical inspection" },
  { id: "drainage", label: "Drainage inspection" },
  { id: "filter", label: "Filter cleaned" },
  { id: "spare_parts", label: "Spare parts replaced (if needed)" },
  { id: "photo_before", label: "Photo before service" },
  { id: "photo_after", label: "Photo after service" },
  { id: "signature", label: "Customer signature" },
] as const;

export type ChecklistItemId =
  (typeof SERVICE_CHECKLIST_TEMPLATE)[number]["id"];

export interface ChecklistItem {
  id: ChecklistItemId;
  label: string;
  checked: boolean;
  /** Optional per-item note. */
  note?: string;
}

export interface ServiceVisit {
  id: ID;
  number: string;
  customerId: ID;
  /** Engineer assigned to this visit. */
  engineerId: ID;
  /** Optional contract this visit belongs to (recurring). */
  contractId?: ID;
  /** Optional approved quotation that spawned a one-off job. */
  quotationId?: ID;
  type: ContractType;
  status: VisitStatus;
  /** ISO scheduled date/time. */
  scheduledAt: string;
  /** ISO actually started. */
  startedAt?: string;
  /** ISO actually finished. */
  completedAt?: string;
  durationMinutes?: number;
  /** Mock photo URLs (placeholder data URIs). */
  photos: string[];
  /** Customer-signed boolean. */
  customerSigned: boolean;
  notes: string;
  checklist: ChecklistItem[];
  /** Optional star rating 1–5 from the customer. */
  rating?: number;
  /** Revenue earned by this visit (split out for engineer performance). */
  revenue: number;
  /** Unit ids serviced on this visit. */
  unitIds: ID[];
}

/* -------------------------------------------------------------------------- */
/* Finance                                                                    */
/* -------------------------------------------------------------------------- */

export type PaymentMethod =
  | "cash"
  | "bank_transfer"
  | "credit_card"
  | "ewallet"
  | "check";

export const PAYMENT_METHOD_META: Record<
  PaymentMethod,
  { label: string }
> = {
  cash: { label: "Cash" },
  bank_transfer: { label: "Bank Transfer" },
  credit_card: { label: "Credit Card" },
  ewallet: { label: "E-Wallet" },
  check: { label: "Check" },
};

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "paid"
  | "partially_paid"
  | "overdue"
  | "cancelled";

export const INVOICE_STATUS_META: Record<
  InvoiceStatus,
  { label: string; tone: string; color: string }
> = {
  draft: {
    label: "Draft",
    tone: "bg-slate-500/20 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300 ring-slate-500/40",
    color: "#94a3b8",
  },
  sent: {
    label: "Sent",
    tone: "bg-sky-500/20 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300 ring-sky-500/40",
    color: "#38bdf8",
  },
  paid: {
    label: "Paid",
    tone: "bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 ring-emerald-500/40",
    color: "#34d399",
  },
  partially_paid: {
    label: "Partially Paid",
    tone: "bg-amber-500/20 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 ring-amber-500/40",
    color: "#fbbf24",
  },
  overdue: {
    label: "Overdue",
    tone: "bg-rose-500/20 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 ring-rose-500/40",
    color: "#fb7185",
  },
  cancelled: {
    label: "Cancelled",
    tone: "bg-slate-500/20 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300 ring-slate-500/40",
    color: "#94a3b8",
  },
};

export type IncomeSource =
  | "service_job"
  | "product_sale"
  | "spare_part_sale"
  | "service_contract";

export const INCOME_SOURCE_META: Record<IncomeSource, { label: string }> = {
  service_job: { label: "Service Job" },
  product_sale: { label: "Product Sale" },
  spare_part_sale: { label: "Spare Part Sale" },
  service_contract: { label: "Service Contract" },
};

export interface Invoice {
  id: ID;
  number: string;
  customerId: ID;
  source: IncomeSource;
  amount: number;
  /** ISO. */
  issuedAt: string;
  /** ISO. */
  dueAt: string;
  paidAt?: string;
  status: InvoiceStatus;
  method?: PaymentMethod;
  /** Optional reference to the visit / contract / quotation that triggered it. */
  visitId?: ID;
  contractId?: ID;
  quotationId?: ID;
  notes?: string;
}

export type ExpenseCategory =
  | "fuel"
  | "transport"
  | "spare_parts"
  | "tools"
  | "salaries"
  | "rent"
  | "utilities"
  | "marketing"
  | "misc";

export const EXPENSE_CATEGORY_META: Record<
  ExpenseCategory,
  { label: string; tone: string }
> = {
  fuel: {
    label: "Fuel",
    tone: "bg-amber-500/20 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 ring-amber-500/40",
  },
  transport: {
    label: "Transportation",
    tone: "bg-sky-500/20 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300 ring-sky-500/40",
  },
  spare_parts: {
    label: "Spare Parts",
    tone: "bg-violet-500/20 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300 ring-violet-500/40",
  },
  tools: {
    label: "Tools",
    tone: "bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 ring-emerald-500/40",
  },
  salaries: {
    label: "Salaries",
    tone: "bg-rose-500/20 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 ring-rose-500/40",
  },
  rent: {
    label: "Rent",
    tone: "bg-slate-500/20 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300 ring-slate-500/40",
  },
  utilities: {
    label: "Utilities",
    tone: "bg-sky-500/20 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300 ring-sky-500/40",
  },
  marketing: {
    label: "Marketing",
    tone: "bg-violet-500/20 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300 ring-violet-500/40",
  },
  misc: {
    label: "Miscellaneous",
    tone: "bg-slate-500/20 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300 ring-slate-500/40",
  },
};

export interface Expense {
  id: ID;
  category: ExpenseCategory;
  description: string;
  amount: number;
  /** ISO. */
  spentAt: string;
  vendor?: string;
  recordedById: ID;
  notes?: string;
}

/* -------------------------------------------------------------------------- */
/* Notifications + timeline                                                   */
/* -------------------------------------------------------------------------- */

export type NotificationKind =
  | "upcoming_service"
  | "expiring_contract"
  | "quotation_expiring"
  | "outstanding_payment"
  | "engineer_assigned"
  | "daily_schedule"
  | "overdue_maintenance"
  | "renewal_reminder";

export const NOTIFICATION_KIND_META: Record<
  NotificationKind,
  { label: string; tone: string }
> = {
  upcoming_service: {
    label: "Upcoming service",
    tone: "bg-sky-500/20 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300 ring-sky-500/40",
  },
  expiring_contract: {
    label: "Contract expiring",
    tone: "bg-amber-500/20 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 ring-amber-500/40",
  },
  quotation_expiring: {
    label: "Quotation expiring",
    tone: "bg-amber-500/20 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 ring-amber-500/40",
  },
  outstanding_payment: {
    label: "Outstanding payment",
    tone: "bg-rose-500/20 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 ring-rose-500/40",
  },
  engineer_assigned: {
    label: "Engineer assigned",
    tone: "bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 ring-emerald-500/40",
  },
  daily_schedule: {
    label: "Daily schedule",
    tone: "bg-violet-500/20 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300 ring-violet-500/40",
  },
  overdue_maintenance: {
    label: "Overdue maintenance",
    tone: "bg-rose-500/20 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 ring-rose-500/40",
  },
  renewal_reminder: {
    label: "Renewal reminder",
    tone: "bg-sky-500/20 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300 ring-sky-500/40",
  },
};

export interface AppNotification {
  id: ID;
  kind: NotificationKind;
  title: string;
  body: string;
  /** ISO created at. */
  createdAt: string;
  unread: boolean;
  /** Optional links into the app. */
  href?: string;
  customerId?: ID;
  contractId?: ID;
  visitId?: ID;
  quotationId?: ID;
  invoiceId?: ID;
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

export interface PeriodRange {
  label: string;
  from: Date;
  to: Date;
}

export function dayBounds(date: Date): { from: Date; to: Date } {
  const from = new Date(date);
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(to.getDate() + 1);
  return { from, to };
}
