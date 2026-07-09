/**
 * Deterministic mock data seed for the AC Service Management System.
 *
 * Mirrors the architecture of the legacy CRM seed: a deterministic PRNG
 * (mulberry32) ensures the SSR + CSR output match exactly, so feature
 * hooks reading from this file can behave like a real API client.
 *
 * Generates a believable mid-size HVAC business:
 *   • A team of admins + engineers
 *   • ~70 customers (residential + commercial + industrial)
 *   • 1–4 AC units per customer
 *   • Service contracts with recurring schedules
 *   • One-off quotations + work orders
 *   • Invoices, payments, expenses
 *   • Notifications + checklist data
 */

import type {
  AcUnit,
  AppNotification,
  AppUser,
  ChecklistItem,
  Company,
  ContractStatus,
  ContractType,
  Customer,
  CustomerLifecycle,
  CustomerType,
  Expense,
  ExpenseCategory,
  ID,
  IncomeSource,
  Invoice,
  InvoiceStatus,
  PaymentMethod,
  Quotation,
  QuotationCategory,
  QuotationLine,
  QuotationStatus,
  ServiceContract,
  ServiceFrequency,
  ServiceVisit,
  UnitCondition,
  UnitType,
  VisitStatus,
} from "./types";
import {
  FREQUENCY_META,
  SERVICE_CHECKLIST_TEMPLATE,
} from "./types";

/* -------------------------------------------------------------------------- */
/* Deterministic PRNG                                                         */
/* -------------------------------------------------------------------------- */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260629);

function pick<T>(xs: readonly T[]): T {
  return xs[Math.floor(rand() * xs.length)] as T;
}

function pickN<T>(xs: readonly T[], n: number): T[] {
  const copy = [...xs];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length > 0; i++) {
    const idx = Math.floor(rand() * copy.length);
    out.push(copy.splice(idx, 1)[0] as T);
  }
  return out;
}

function intBetween(lo: number, hi: number): number {
  return Math.floor(rand() * (hi - lo + 1)) + lo;
}

function money(lo: number, hi: number): number {
  return Math.round((rand() * (hi - lo) + lo) / 10) * 10;
}

function chance(p: number): boolean {
  return rand() < p;
}

let counter = 0;
function id(prefix: string): ID {
  counter += 1;
  return `${prefix}_${counter.toString(36).padStart(4, "0")}`;
}

function isoDaysFromNow(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString();
}

function isoMinutesFromNow(mins: number): string {
  return new Date(Date.now() + mins * 60_000).toISOString();
}

/* -------------------------------------------------------------------------- */
/* Reference corpora                                                          */
/* -------------------------------------------------------------------------- */

const FIRST_NAMES_ID = [
  "Budi",
  "Siti",
  "Andi",
  "Dewi",
  "Eko",
  "Rina",
  "Hendra",
  "Maya",
  "Rizki",
  "Putri",
  "Joko",
  "Lina",
  "Agus",
  "Fitri",
  "Yusuf",
  "Anita",
  "Bayu",
  "Sari",
  "Dimas",
  "Wulan",
];

const FIRST_NAMES_EN = [
  "Aisha",
  "Liam",
  "Sofia",
  "Noah",
  "Mia",
  "Ethan",
  "Olivia",
  "Mason",
  "Ava",
  "Lucas",
  "Isabella",
  "Logan",
  "Charlotte",
  "Aiden",
  "Amelia",
  "Elijah",
];

const LAST_NAMES = [
  "Hartono",
  "Wijaya",
  "Susanto",
  "Tan",
  "Setiawan",
  "Hidayat",
  "Pratama",
  "Putra",
  "Nugroho",
  "Santoso",
  "Wibowo",
  "Patel",
  "Nguyen",
  "Garcia",
  "Martinez",
  "Wang",
  "Kim",
  "Smith",
];

const COMPANY_PREFIX = [
  "Cendana",
  "Helio",
  "Mahkota",
  "Atlas",
  "Nusantara",
  "Lumen",
  "Sentosa",
  "Orbit",
  "Citra",
  "Pegasus",
  "Aurora",
  "Mercer",
  "Vellum",
  "Borneo",
  "Garuda",
  "Solstice",
  "Tirta",
];

const COMPANY_SUFFIX = [
  "Group",
  "Plaza",
  "Tower",
  "Foods",
  "Hospital",
  "Clinic",
  "Hotel",
  "Resort",
  "Retail",
  "Mall",
  "Studios",
  "Logistics",
  "Manufacturing",
  "Office",
];

const CITIES: { city: string; country: string; lat: number; lng: number }[] = [
  { city: "Jakarta", country: "Indonesia", lat: -6.2088, lng: 106.8456 },
  { city: "Surabaya", country: "Indonesia", lat: -7.2575, lng: 112.7521 },
  { city: "Bandung", country: "Indonesia", lat: -6.9175, lng: 107.6191 },
  { city: "Denpasar", country: "Indonesia", lat: -8.6705, lng: 115.2126 },
  { city: "Medan", country: "Indonesia", lat: 3.5952, lng: 98.6722 },
  { city: "Semarang", country: "Indonesia", lat: -6.9667, lng: 110.4167 },
];

const STREETS = [
  "Jl. Sudirman",
  "Jl. Thamrin",
  "Jl. Gatot Subroto",
  "Jl. Rasuna Said",
  "Jl. Asia Afrika",
  "Jl. Diponegoro",
  "Jl. Cendana",
  "Jl. Kebon Sirih",
  "Jl. Merdeka",
  "Jl. Pahlawan",
  "Jl. Pemuda",
  "Jl. Veteran",
];

const BRANDS = [
  "Daikin",
  "Mitsubishi",
  "Panasonic",
  "LG",
  "Samsung",
  "Sharp",
  "Hitachi",
  "Toshiba",
  "Carrier",
  "York",
  "Trane",
];

const TAGS_RESIDENTIAL = [
  "VIP",
  "Recurring",
  "Loyal",
  "Referral",
  "New",
  "Premium",
];

const TAGS_COMMERCIAL = [
  "Strategic",
  "Anchor",
  "High-traffic",
  "Multi-site",
  "Renewal",
  "Expansion",
];

const SKILLS = [
  "Split AC",
  "VRF Systems",
  "Chiller",
  "Refrigerant Recovery",
  "Electrical",
  "Brazing",
  "Vacuum + Charging",
  "Ductwork",
  "Controls",
];

/* -------------------------------------------------------------------------- */
/* Company + team                                                             */
/* -------------------------------------------------------------------------- */

export const company: Company = {
  id: "co_pegasus_ac",
  name: "Pegasus AC Service",
  plan: "Growth",
};

/**
 * The default tenant these seed users belong to. Kept as a plain string
 * literal (instead of importing from the platform seed) so this module
 * remains free of platform-layer imports.
 */
const DEFAULT_TENANT_ID = "t_pegasus_ac";

export const users: AppUser[] = [
  {
    id: "u_leo",
    tenantId: DEFAULT_TENANT_ID,
    name: "Leo Santoso",
    email: "leo@pegasus.ac",
    phone: "+62 811-0001",
    role: "administrator",
    title: "Founder & Admin",
    hue: 215,
    createdAt: "2023-01-15T02:00:00.000Z",
  },
  {
    id: "u_sarah",
    tenantId: DEFAULT_TENANT_ID,
    name: "Sarah Chen",
    email: "sarah@pegasus.ac",
    phone: "+62 811-0002",
    role: "manager",
    title: "Operations Manager",
    hue: 262,
    createdAt: "2023-03-04T02:00:00.000Z",
  },
  {
    id: "u_maya",
    tenantId: DEFAULT_TENANT_ID,
    name: "Maya Putri",
    email: "maya@pegasus.ac",
    phone: "+62 811-0003",
    role: "admin_staff",
    title: "Admin Officer",
    hue: 12,
    createdAt: "2023-05-20T02:00:00.000Z",
  },
  {
    id: "u_rina",
    tenantId: DEFAULT_TENANT_ID,
    name: "Rina Hartono",
    email: "rina@pegasus.ac",
    phone: "+62 811-0004",
    role: "admin_staff",
    title: "Customer Service",
    hue: 320,
    createdAt: "2023-08-11T02:00:00.000Z",
  },
  {
    id: "u_budi",
    tenantId: DEFAULT_TENANT_ID,
    name: "Budi Wijaya",
    email: "budi@pegasus.ac",
    phone: "+62 812-1001",
    role: "engineer",
    title: "Senior Engineer",
    skills: pickN(SKILLS, 5),
    rating: 4.8,
    experienceYears: 12,
    hue: 145,
    createdAt: "2023-01-30T02:00:00.000Z",
  },
  {
    id: "u_andi",
    tenantId: DEFAULT_TENANT_ID,
    name: "Andi Susanto",
    email: "andi@pegasus.ac",
    phone: "+62 812-1002",
    role: "engineer",
    title: "Field Engineer",
    skills: pickN(SKILLS, 4),
    rating: 4.6,
    experienceYears: 8,
    hue: 200,
    createdAt: "2023-04-12T02:00:00.000Z",
  },
  {
    id: "u_eko",
    tenantId: DEFAULT_TENANT_ID,
    name: "Eko Pratama",
    email: "eko@pegasus.ac",
    phone: "+62 812-1003",
    role: "engineer",
    title: "Field Engineer",
    skills: pickN(SKILLS, 4),
    rating: 4.7,
    experienceYears: 6,
    hue: 290,
    createdAt: "2023-06-01T02:00:00.000Z",
  },
  {
    id: "u_hendra",
    tenantId: DEFAULT_TENANT_ID,
    name: "Hendra Nugroho",
    email: "hendra@pegasus.ac",
    phone: "+62 812-1004",
    role: "engineer",
    title: "Field Engineer",
    skills: pickN(SKILLS, 3),
    rating: 4.4,
    experienceYears: 4,
    hue: 30,
    createdAt: "2023-09-18T02:00:00.000Z",
  },
  {
    id: "u_dimas",
    tenantId: DEFAULT_TENANT_ID,
    name: "Dimas Setiawan",
    email: "dimas@pegasus.ac",
    phone: "+62 812-1005",
    role: "engineer",
    title: "Junior Engineer",
    skills: pickN(SKILLS, 3),
    rating: 4.5,
    experienceYears: 2,
    hue: 240,
    createdAt: "2024-02-05T02:00:00.000Z",
  },
];

export const currentUser: AppUser = users[0]!;

export const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

export const engineers: AppUser[] = users.filter((u) => u.role === "engineer");
export const adminStaff: AppUser[] = users.filter(
  (u) => u.role === "admin_staff" || u.role === "manager" || u.role === "administrator",
);

/* -------------------------------------------------------------------------- */
/* Customers                                                                  */
/* -------------------------------------------------------------------------- */

function generateCustomer(): Customer {
  const t: CustomerType = (() => {
    const r = rand();
    if (r < 0.35) return "residential";
    if (r < 0.85) return "commercial";
    return "industrial";
  })();
  const place = pick(CITIES);
  const jitter = (max: number) => (rand() - 0.5) * max;
  const lat = place.lat + jitter(0.18);
  const lng = place.lng + jitter(0.18);
  const owner = pick(adminStaff);

  let name: string;
  let companyName: string | undefined;
  let contactPerson: string;
  if (t === "residential") {
    contactPerson = `${pick(FIRST_NAMES_ID)} ${pick(LAST_NAMES)}`;
    name = contactPerson;
  } else {
    const prefix = pick(COMPANY_PREFIX);
    const suffix = pick(COMPANY_SUFFIX);
    companyName = `${prefix} ${suffix}`;
    name = companyName;
    contactPerson = `${pick([...FIRST_NAMES_ID, ...FIRST_NAMES_EN])} ${pick(LAST_NAMES)}`;
  }

  const createdDays = intBetween(15, 720);
  const touchedDays = intBetween(0, Math.min(createdDays, 60));
  const tagPool = t === "residential" ? TAGS_RESIDENTIAL : TAGS_COMMERCIAL;

  return {
    id: id("cu"),
    type: t,
    contactPerson,
    name,
    companyName,
    phone: `+62 ${intBetween(811, 899)}-${intBetween(1000, 9999)}-${intBetween(1000, 9999)}`,
    email: `${contactPerson.toLowerCase().replace(/\s+/g, ".").replace(/[^a-z.]/g, "")}@${
      companyName
        ? companyName.toLowerCase().replace(/\s+/g, "") + ".co.id"
        : "mail.com"
    }`,
    address: `${pick(STREETS)} No. ${intBetween(1, 280)}`,
    city: place.city,
    country: place.country,
    lat,
    lng,
    tags: pickN(tagPool, intBetween(1, 3)),
    ownerId: owner.id,
    notes:
      t === "residential"
        ? "Family residence. Prefers weekend service. Has small dog at home."
        : t === "commercial"
        ? "Multiple AC units across floors. Service must be scheduled outside operating hours where possible."
        : "Industrial site. Strict safety SOP. Coordinate with facility manager 48h ahead.",
    lifetimeValue: money(800, t === "industrial" ? 120_000 : t === "commercial" ? 38_000 : 6_500),
    createdAt: new Date(Date.now() - createdDays * 86_400_000).toISOString(),
    lastTouchedAt: new Date(Date.now() - touchedDays * 86_400_000).toISOString(),
  };
}

export const customers: Customer[] = Array.from({ length: 72 }, () =>
  generateCustomer(),
);

export const customerMap = Object.fromEntries(
  customers.map((c) => [c.id, c]),
);

/* -------------------------------------------------------------------------- */
/* AC Units                                                                   */
/* -------------------------------------------------------------------------- */

const UNIT_CONDITIONS: UnitCondition[] = ["excellent", "good", "fair", "poor"];
const UNIT_LOCATIONS_RESI = ["Living Room", "Master Bedroom", "Kid's Room", "Kitchen", "Office"];
const UNIT_LOCATIONS_COMM = [
  "Lobby",
  "Floor 1 East",
  "Floor 1 West",
  "Floor 2",
  "Meeting Room",
  "Server Room",
  "Reception",
  "Open Plan",
];
const UNIT_LOCATIONS_IND = [
  "Production Floor A",
  "Production Floor B",
  "Cold Storage",
  "Office Block",
  "Control Room",
  "Quality Lab",
];

function generateUnitsFor(customer: Customer): AcUnit[] {
  const count = customer.type === "industrial"
    ? intBetween(4, 10)
    : customer.type === "commercial"
    ? intBetween(2, 6)
    : intBetween(1, 4);
  const locationPool =
    customer.type === "residential"
      ? UNIT_LOCATIONS_RESI
      : customer.type === "industrial"
      ? UNIT_LOCATIONS_IND
      : UNIT_LOCATIONS_COMM;
  const installedDays = intBetween(60, 2200);
  const out: AcUnit[] = [];
  for (let i = 0; i < count; i++) {
    const type: UnitType = customer.type === "residential"
      ? (chance(0.85) ? "split" : "window")
      : customer.type === "industrial"
      ? pick(["chiller", "vrf", "central"])
      : pick(["split", "cassette", "vrf", "central"]);
    const installed = installedDays - i * intBetween(30, 200);
    const lastService = intBetween(7, 180);
    out.push({
      id: id("u"),
      customerId: customer.id,
      brand: pick(BRANDS),
      model: `${type.toUpperCase()}-${intBetween(100, 999)}${pick(["A", "B", "X", "Pro"])}`,
      type,
      btu: pick([5000, 9000, 12000, 18000, 24000, 36000, 48000, 60000, 120000]),
      serialNumber: `SN${intBetween(100000, 999999)}-${pick(["A", "B", "C"])}`,
      installedAt: new Date(Date.now() - Math.max(installed, 30) * 86_400_000).toISOString(),
      location: pick(locationPool),
      condition: pick(UNIT_CONDITIONS),
      lastServicedAt: chance(0.9)
        ? new Date(Date.now() - lastService * 86_400_000).toISOString()
        : undefined,
    });
  }
  return out;
}

export const acUnits: AcUnit[] = customers.flatMap(generateUnitsFor);
export const unitMap = Object.fromEntries(acUnits.map((u) => [u.id, u]));
export const unitsByCustomer: Record<ID, AcUnit[]> = acUnits.reduce(
  (acc, u) => {
    (acc[u.customerId] ??= []).push(u);
    return acc;
  },
  {} as Record<ID, AcUnit[]>,
);

/* -------------------------------------------------------------------------- */
/* Quotations                                                                 */
/* -------------------------------------------------------------------------- */

const QUOTE_TITLES: Record<QuotationCategory, string[]> = {
  service: [
    "AC Deep Cleaning",
    "Annual Maintenance",
    "Refrigerant Top-up",
    "Compressor Diagnostic",
    "Drainage Repair",
  ],
  product: [
    "Daikin Split 1.5HP Installation",
    "Mitsubishi 2HP Replacement",
    "Cassette AC Upgrade",
    "VRF System Installation",
  ],
  spare_parts: [
    "Compressor Replacement",
    "Capacitor Set",
    "Filter Pack (5x)",
    "Thermostat Replacement",
    "PCB Board Replacement",
  ],
  service_contract: [
    "12-Month Preventive Maintenance",
    "Quarterly Cleaning Plan",
    "Annual VRF Service Plan",
    "Premium Care Package",
  ],
};

const PART_PRICES: Record<string, [number, number]> = {
  service: [80, 800],
  product: [350, 4500],
  spare_parts: [25, 1500],
  service_contract: [600, 12_000],
};

function lineFor(category: QuotationCategory): QuotationLine {
  const [lo, hi] = PART_PRICES[category]!;
  return {
    id: id("ql"),
    description: pick(QUOTE_TITLES[category]),
    quantity: intBetween(1, 4),
    unitPrice: money(lo, hi),
    taxPct: chance(0.5) ? 11 : undefined,
  };
}

function generateQuotation(): Quotation {
  const customer = pick(customers);
  const category: QuotationCategory = pick([
    "service",
    "product",
    "spare_parts",
    "service_contract",
  ]);
  const owner = pick(adminStaff);
  const status: QuotationStatus = (() => {
    const r = rand();
    if (r < 0.18) return "draft";
    if (r < 0.5) return "sent";
    if (r < 0.78) return "approved";
    if (r < 0.92) return "rejected";
    return "expired";
  })();
  const createdDays = intBetween(1, 90);
  const validityDays = intBetween(7, 45);
  const createdAt = isoDaysFromNow(-createdDays);
  const validUntil = isoDaysFromNow(-createdDays + validityDays);

  const lines: QuotationLine[] = Array.from({ length: intBetween(1, 4) }, () =>
    lineFor(category),
  );

  return {
    id: id("q"),
    number: `Q-${new Date(createdAt).getFullYear()}${(createdAt.slice(5, 7))}-${counter
      .toString(36)
      .padStart(4, "0")
      .toUpperCase()}`,
    customerId: customer.id,
    category,
    status,
    title: pick(QUOTE_TITLES[category]),
    notes:
      "Quote valid for the work scope described above. Includes site visit, labour, and standard consumables. Excludes structural work and warranty on third-party parts.",
    lines,
    discountPct: chance(0.3) ? intBetween(2, 10) : 0,
    taxPct: 11,
    ownerId: owner.id,
    createdAt,
    validUntil,
    sentAt:
      status === "draft"
        ? undefined
        : isoDaysFromNow(-createdDays + intBetween(0, 2)),
    decidedAt:
      status === "approved" || status === "rejected"
        ? isoDaysFromNow(-createdDays + intBetween(3, validityDays))
        : undefined,
  };
}

export const quotations: Quotation[] = Array.from({ length: 64 }, () =>
  generateQuotation(),
);
export const quotationMap = Object.fromEntries(quotations.map((q) => [q.id, q]));

export function quotationSubtotal(q: Quotation): number {
  return q.lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);
}

export function quotationTotal(q: Quotation): number {
  const sub = quotationSubtotal(q);
  const afterDiscount = sub * (1 - q.discountPct / 100);
  const tax = afterDiscount * (q.taxPct / 100);
  return Math.round(afterDiscount + tax);
}

/* -------------------------------------------------------------------------- */
/* Service Contracts                                                          */
/* -------------------------------------------------------------------------- */

const CONTRACT_TYPES: ContractType[] = [
  "ac_cleaning",
  "ac_replacement",
  "spare_part_replacement",
  "preventive_maintenance",
  "custom",
];

const FREQUENCIES: ServiceFrequency[] = [
  "monthly",
  "quarterly",
  "biannual",
  "annual",
];

function pickContractStatus(startDate: Date, endDate: Date): ContractStatus {
  const now = new Date();
  const msToEnd = endDate.getTime() - now.getTime();
  const dayMs = 86_400_000;
  if (now < startDate) return "draft";
  if (msToEnd <= 0) {
    return chance(0.45) ? "completed" : "awaiting_renewal";
  }
  if (msToEnd <= 30 * dayMs) return "expiring_soon";
  return "active";
}

function generateContract(): ServiceContract {
  const customer = pick(customers);
  const type = pick(CONTRACT_TYPES);
  const frequency: ServiceFrequency = pick(FREQUENCIES);
  const durationMonths = pick([6, 12, 12, 12, 24, 24, 36]);
  const startOffsetDays = intBetween(-365, 60);
  const startDate = new Date(Date.now() + startOffsetDays * 86_400_000);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + durationMonths);
  const status = pickContractStatus(startDate, endDate);
  const eng = pick(engineers);
  const units = unitsByCustomer[customer.id] ?? [];
  const unitIds = units.length === 0
    ? []
    : pickN(
        units.map((u) => u.id),
        Math.min(units.length, intBetween(1, units.length)),
      );

  return {
    id: id("k"),
    number: `K-${startDate.getFullYear()}-${counter.toString().padStart(4, "0")}`,
    customerId: customer.id,
    type,
    status,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    frequency,
    engineerId: eng.id,
    value: money(1200, 24_000),
    notes:
      "Includes labour, cleaning chemicals and standard consumables. Customer to provide power + water access. Spare parts billed separately at agreed rates.",
    unitIds,
  };
}

export const contracts: ServiceContract[] = Array.from({ length: 38 }, () =>
  generateContract(),
);
export const contractMap = Object.fromEntries(contracts.map((k) => [k.id, k]));
export const contractsByCustomer: Record<ID, ServiceContract[]> = contracts.reduce(
  (acc, c) => {
    (acc[c.customerId] ??= []).push(c);
    return acc;
  },
  {} as Record<ID, ServiceContract[]>,
);

/* -------------------------------------------------------------------------- */
/* Service visits                                                             */
/* -------------------------------------------------------------------------- */

function buildChecklist(progress: number): ChecklistItem[] {
  return SERVICE_CHECKLIST_TEMPLATE.map((tpl, idx) => ({
    id: tpl.id,
    label: tpl.label,
    checked: idx < progress,
  }));
}

function visitStatusFor(scheduled: Date, hasContract: boolean): VisitStatus {
  const now = Date.now();
  const ms = scheduled.getTime() - now;
  const dayMs = 86_400_000;
  if (ms < -7 * dayMs) {
    return chance(0.85) ? "completed" : "overdue";
  }
  if (ms < 0) {
    return chance(0.6) ? "completed" : hasContract ? "overdue" : "in_progress";
  }
  if (ms < 4 * 3_600_000) return chance(0.4) ? "in_progress" : "scheduled";
  return "scheduled";
}

function generateContractVisits(contract: ServiceContract): ServiceVisit[] {
  const intervalDays =
    contract.frequency === "custom"
      ? contract.customIntervalDays ?? 60
      : FREQUENCY_META[contract.frequency].intervalDays;
  const start = new Date(contract.startDate).getTime();
  const end = new Date(contract.endDate).getTime();
  const out: ServiceVisit[] = [];
  for (let t = start; t <= end + 86_400_000; t += intervalDays * 86_400_000) {
    const scheduled = new Date(t);
    const status = visitStatusFor(scheduled, true);
    const checklistProgress =
      status === "completed"
        ? SERVICE_CHECKLIST_TEMPLATE.length
        : status === "in_progress"
        ? intBetween(3, 7)
        : 0;
    const duration =
      status === "completed" || status === "in_progress"
        ? intBetween(45, 180)
        : undefined;
    const revenue =
      status === "completed"
        ? Math.round(contract.value / 6)
        : 0;
    out.push({
      id: id("v"),
      number: `V-${scheduled.getFullYear()}${(scheduled.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${counter.toString().padStart(4, "0")}`,
      customerId: contract.customerId,
      engineerId: contract.engineerId,
      contractId: contract.id,
      type: contract.type,
      status,
      scheduledAt: scheduled.toISOString(),
      startedAt:
        status === "completed" || status === "in_progress"
          ? new Date(scheduled.getTime() - intBetween(0, 30) * 60_000).toISOString()
          : undefined,
      completedAt:
        status === "completed"
          ? new Date(
              scheduled.getTime() + (duration ?? 60) * 60_000,
            ).toISOString()
          : undefined,
      durationMinutes: duration,
      photos:
        status === "completed"
          ? Array.from({ length: intBetween(2, 4) }, (_, i) =>
              `placeholder-photo-${i + 1}`,
            )
          : [],
      customerSigned: status === "completed",
      notes:
        status === "completed"
          ? "Service completed cleanly. Customer reported improved cooling. Recommend filter replacement next visit."
          : status === "in_progress"
          ? "Engineer on-site. Started indoor unit cleaning."
          : "Routine visit per service contract.",
      checklist: buildChecklist(checklistProgress),
      rating: status === "completed" ? intBetween(4, 5) : undefined,
      revenue,
      unitIds: contract.unitIds,
    });
  }
  return out;
}

function generateQuotationVisits(): ServiceVisit[] {
  const approved = quotations.filter(
    (q) =>
      q.status === "approved" &&
      q.category !== "service_contract" &&
      q.category !== "spare_parts",
  );
  return approved.slice(0, 18).map((q) => {
    const customer = customerMap[q.customerId]!;
    const eng = pick(engineers);
    const offset = intBetween(-25, 14);
    const scheduled = new Date(Date.now() + offset * 86_400_000);
    const status = visitStatusFor(scheduled, false);
    const checklistProgress =
      status === "completed"
        ? SERVICE_CHECKLIST_TEMPLATE.length
        : status === "in_progress"
        ? intBetween(3, 7)
        : 0;
    const duration =
      status === "completed" || status === "in_progress"
        ? intBetween(60, 240)
        : undefined;
    return {
      id: id("v"),
      number: `V-${scheduled.getFullYear()}${(scheduled.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${counter.toString().padStart(4, "0")}`,
      customerId: customer.id,
      engineerId: eng.id,
      quotationId: q.id,
      type: "custom",
      status,
      scheduledAt: scheduled.toISOString(),
      startedAt:
        status === "completed" || status === "in_progress"
          ? new Date(scheduled.getTime() - intBetween(0, 30) * 60_000).toISOString()
          : undefined,
      completedAt:
        status === "completed"
          ? new Date(scheduled.getTime() + (duration ?? 60) * 60_000).toISOString()
          : undefined,
      durationMinutes: duration,
      photos:
        status === "completed"
          ? Array.from({ length: intBetween(2, 4) }, (_, i) =>
              `placeholder-photo-${i + 1}`,
            )
          : [],
      customerSigned: status === "completed",
      notes:
        status === "completed"
          ? "Work order completed. Customer signed off on the new installation."
          : "Job from approved quotation " + q.number,
      checklist: buildChecklist(checklistProgress),
      rating: status === "completed" ? intBetween(4, 5) : undefined,
      revenue:
        status === "completed" ? Math.round(quotationTotal(q) * 0.7) : 0,
      unitIds: (unitsByCustomer[customer.id] ?? [])
        .slice(0, intBetween(1, 2))
        .map((u) => u.id),
    };
  });
}

export const visits: ServiceVisit[] = [
  ...contracts.flatMap(generateContractVisits),
  ...generateQuotationVisits(),
].sort(
  (a, b) =>
    new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
);

export const visitMap = Object.fromEntries(visits.map((v) => [v.id, v]));
export const visitsByCustomer: Record<ID, ServiceVisit[]> = visits.reduce(
  (acc, v) => {
    (acc[v.customerId] ??= []).push(v);
    return acc;
  },
  {} as Record<ID, ServiceVisit[]>,
);
export const visitsByEngineer: Record<ID, ServiceVisit[]> = visits.reduce(
  (acc, v) => {
    (acc[v.engineerId] ??= []).push(v);
    return acc;
  },
  {} as Record<ID, ServiceVisit[]>,
);

/* -------------------------------------------------------------------------- */
/* Invoices                                                                   */
/* -------------------------------------------------------------------------- */

const PAYMENT_METHODS: PaymentMethod[] = [
  "cash",
  "bank_transfer",
  "credit_card",
  "ewallet",
  "check",
];

function invoiceStatusForOffset(daysOverdue: number): InvoiceStatus {
  if (daysOverdue < -30) return "draft";
  if (daysOverdue < -5) {
    return chance(0.75) ? "sent" : "paid";
  }
  if (daysOverdue < 0) {
    return chance(0.7) ? "paid" : "sent";
  }
  if (daysOverdue < 15) {
    return chance(0.65) ? "paid" : chance(0.5) ? "partially_paid" : "sent";
  }
  return chance(0.55) ? "overdue" : "paid";
}

function generateInvoiceFromVisit(visit: ServiceVisit): Invoice | null {
  if (visit.status !== "completed") return null;
  const customer = customerMap[visit.customerId]!;
  const issuedAt = new Date(
    (visit.completedAt ?? visit.scheduledAt),
  );
  const dueDate = new Date(issuedAt.getTime() + 14 * 86_400_000);
  const daysOverdue = Math.floor(
    (Date.now() - dueDate.getTime()) / 86_400_000,
  );
  const status = invoiceStatusForOffset(daysOverdue);
  const source: IncomeSource = visit.contractId
    ? "service_contract"
    : "service_job";
  const method =
    status === "paid" || status === "partially_paid"
      ? pick(PAYMENT_METHODS)
      : undefined;
  return {
    id: id("i"),
    number: `INV-${issuedAt.getFullYear()}${(issuedAt.getMonth() + 1).toString().padStart(2, "0")}-${counter
      .toString()
      .padStart(4, "0")}`,
    customerId: customer.id,
    source,
    amount: visit.revenue || money(150, 1800),
    issuedAt: issuedAt.toISOString(),
    dueAt: dueDate.toISOString(),
    paidAt:
      status === "paid"
        ? new Date(
            dueDate.getTime() - intBetween(0, 12) * 86_400_000,
          ).toISOString()
        : undefined,
    status,
    method,
    visitId: visit.id,
    contractId: visit.contractId,
    quotationId: visit.quotationId,
  };
}

function generateProductSaleInvoice(): Invoice {
  const approved = quotations.filter(
    (q) => q.status === "approved" && (q.category === "product" || q.category === "spare_parts"),
  );
  const q = pick(approved.length > 0 ? approved : quotations);
  const customer = customerMap[q.customerId]!;
  const issuedAt = new Date(
    q.decidedAt ?? q.createdAt,
  );
  const dueDate = new Date(issuedAt.getTime() + 14 * 86_400_000);
  const daysOverdue = Math.floor(
    (Date.now() - dueDate.getTime()) / 86_400_000,
  );
  const status = invoiceStatusForOffset(daysOverdue);
  const method =
    status === "paid" || status === "partially_paid"
      ? pick(PAYMENT_METHODS)
      : undefined;
  return {
    id: id("i"),
    number: `INV-${issuedAt.getFullYear()}${(issuedAt.getMonth() + 1).toString().padStart(2, "0")}-${counter
      .toString()
      .padStart(4, "0")}`,
    customerId: customer.id,
    source: q.category === "product" ? "product_sale" : "spare_part_sale",
    amount: quotationTotal(q),
    issuedAt: issuedAt.toISOString(),
    dueAt: dueDate.toISOString(),
    paidAt:
      status === "paid"
        ? new Date(
            dueDate.getTime() - intBetween(0, 12) * 86_400_000,
          ).toISOString()
        : undefined,
    status,
    method,
    quotationId: q.id,
  };
}

export const invoices: Invoice[] = [
  ...visits
    .map(generateInvoiceFromVisit)
    .filter((i): i is Invoice => i !== null),
  ...Array.from({ length: 22 }, () => generateProductSaleInvoice()),
].sort(
  (a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime(),
);

export const invoiceMap = Object.fromEntries(invoices.map((i) => [i.id, i]));

/* -------------------------------------------------------------------------- */
/* Expenses                                                                   */
/* -------------------------------------------------------------------------- */

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "fuel",
  "transport",
  "spare_parts",
  "tools",
  "salaries",
  "rent",
  "utilities",
  "marketing",
  "misc",
];

const EXPENSE_DESCRIPTIONS: Record<ExpenseCategory, string[]> = {
  fuel: ["Field vehicle fuel", "Generator diesel", "Service van petrol"],
  transport: ["Toll roads", "Inter-city transport", "Truck rental"],
  spare_parts: [
    "Compressor stock replenishment",
    "Filter pack restock",
    "Capacitor batch",
    "Refrigerant cylinder R32",
  ],
  tools: [
    "Vacuum pump replacement",
    "Manifold gauge set",
    "Cordless drill",
    "Crimping kit",
  ],
  salaries: ["Engineer payroll", "Admin payroll", "Bonus payout"],
  rent: ["Workshop rent", "Office rent"],
  utilities: ["Electricity bill", "Internet", "Water bill"],
  marketing: ["Google Ads", "Brochure printing", "Trade show booth"],
  misc: ["Office supplies", "Refreshments", "Cleaning supplies"],
};

const EXPENSE_AMOUNTS: Record<ExpenseCategory, [number, number]> = {
  fuel: [40, 220],
  transport: [20, 380],
  spare_parts: [80, 4200],
  tools: [60, 1800],
  salaries: [1800, 9500],
  rent: [1500, 6500],
  utilities: [110, 950],
  marketing: [80, 2200],
  misc: [15, 350],
};

function generateExpense(): Expense {
  const category = pick(EXPENSE_CATEGORIES);
  const [lo, hi] = EXPENSE_AMOUNTS[category];
  const spentAt = isoDaysFromNow(-intBetween(0, 120));
  return {
    id: id("e"),
    category,
    description: pick(EXPENSE_DESCRIPTIONS[category]),
    amount: money(lo, hi),
    spentAt,
    vendor: chance(0.6) ? pick(COMPANY_PREFIX) + " " + pick(COMPANY_SUFFIX) : undefined,
    recordedById: pick(adminStaff).id,
  };
}

export const expenses: Expense[] = Array.from({ length: 84 }, () =>
  generateExpense(),
).sort((a, b) => new Date(b.spentAt).getTime() - new Date(a.spentAt).getTime());

export const expenseMap = Object.fromEntries(expenses.map((e) => [e.id, e]));

/* -------------------------------------------------------------------------- */
/* Notifications                                                              */
/* -------------------------------------------------------------------------- */

function generateNotifications(): AppNotification[] {
  const out: AppNotification[] = [];

  visits
    .filter(
      (v) =>
        v.status === "scheduled" &&
        new Date(v.scheduledAt).getTime() <= Date.now() + 2 * 86_400_000 &&
        new Date(v.scheduledAt).getTime() >= Date.now() - 86_400_000,
    )
    .slice(0, 6)
    .forEach((v, idx) => {
      const customer = customerMap[v.customerId];
      out.push({
        id: id("n"),
        kind: "upcoming_service",
        title: `Service scheduled — ${customer?.name ?? "Customer"}`,
        body: `Visit ${v.number} is scheduled for ${new Date(v.scheduledAt).toLocaleString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })}.`,
        createdAt: isoMinutesFromNow(-intBetween(5, 120) - idx * 15),
        unread: idx < 3,
        href: `/dashboard/work-orders/${v.id}`,
        visitId: v.id,
        customerId: v.customerId,
      });
    });

  visits
    .filter((v) => v.status === "overdue")
    .slice(0, 4)
    .forEach((v) => {
      const customer = customerMap[v.customerId];
      out.push({
        id: id("n"),
        kind: "overdue_maintenance",
        title: `Overdue — ${customer?.name ?? "Customer"}`,
        body: `Visit ${v.number} was scheduled for ${new Date(v.scheduledAt).toLocaleDateString()} but is not yet completed.`,
        createdAt: isoMinutesFromNow(-intBetween(30, 360)),
        unread: true,
        href: `/dashboard/work-orders/${v.id}`,
        visitId: v.id,
        customerId: v.customerId,
      });
    });

  contracts
    .filter((c) => c.status === "expiring_soon" || c.status === "awaiting_renewal")
    .slice(0, 5)
    .forEach((c) => {
      const customer = customerMap[c.customerId];
      out.push({
        id: id("n"),
        kind:
          c.status === "awaiting_renewal" ? "renewal_reminder" : "expiring_contract",
        title:
          c.status === "awaiting_renewal"
            ? `Renewal reminder — ${customer?.name}`
            : `Contract expiring — ${customer?.name}`,
        body: `Contract ${c.number} ${
          c.status === "awaiting_renewal" ? "is up for renewal" : "expires"
        } on ${new Date(c.endDate).toLocaleDateString()}.`,
        createdAt: isoMinutesFromNow(-intBetween(15, 720)),
        unread: chance(0.6),
        href: `/dashboard/contracts/${c.id}`,
        contractId: c.id,
        customerId: c.customerId,
      });
    });

  quotations
    .filter((q) => q.status === "sent")
    .slice(0, 3)
    .forEach((q) => {
      const customer = customerMap[q.customerId];
      out.push({
        id: id("n"),
        kind: "quotation_expiring",
        title: `Awaiting response — ${customer?.name}`,
        body: `Quotation ${q.number} expires on ${new Date(q.validUntil).toLocaleDateString()}.`,
        createdAt: isoMinutesFromNow(-intBetween(60, 360)),
        unread: chance(0.5),
        href: `/dashboard/quotations/${q.id}`,
        quotationId: q.id,
        customerId: q.customerId,
      });
    });

  invoices
    .filter((i) => i.status === "overdue")
    .slice(0, 4)
    .forEach((inv) => {
      const customer = customerMap[inv.customerId];
      out.push({
        id: id("n"),
        kind: "outstanding_payment",
        title: `Overdue invoice — ${customer?.name}`,
        body: `${inv.number} for ${customer?.name ?? "customer"} is overdue by ${Math.floor(
          (Date.now() - new Date(inv.dueAt).getTime()) / 86_400_000,
        )} days.`,
        createdAt: isoMinutesFromNow(-intBetween(30, 600)),
        unread: chance(0.7),
        href: `/dashboard/finance/invoices/${inv.id}`,
        invoiceId: inv.id,
        customerId: inv.customerId,
      });
    });

  return out.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export const notifications: AppNotification[] = generateNotifications();
export const notificationMap = Object.fromEntries(
  notifications.map((n) => [n.id, n]),
);

/* -------------------------------------------------------------------------- */
/* Derived summary helpers                                                    */
/* -------------------------------------------------------------------------- */

export function unreadNotificationCount(): number {
  return notifications.filter((n) => n.unread).length;
}

export function overdueVisitsCount(): number {
  return visits.filter((v) => v.status === "overdue").length;
}

export function upcomingVisitsCount(): number {
  return visits.filter(
    (v) =>
      v.status === "scheduled" &&
      new Date(v.scheduledAt).getTime() <= Date.now() + 7 * 86_400_000 &&
      new Date(v.scheduledAt).getTime() >= Date.now(),
  ).length;
}

export interface FinancialBucket {
  income: number;
  expense: number;
  net: number;
}

function bucketBetween(from: Date, to: Date): FinancialBucket {
  const income = invoices
    .filter((i) => {
      const t = new Date(i.paidAt ?? i.issuedAt).getTime();
      return (
        (i.status === "paid" || i.status === "partially_paid") &&
        t >= from.getTime() &&
        t < to.getTime()
      );
    })
    .reduce((sum, i) => sum + i.amount * (i.status === "partially_paid" ? 0.5 : 1), 0);
  const expense = expenses
    .filter((e) => {
      const t = new Date(e.spentAt).getTime();
      return t >= from.getTime() && t < to.getTime();
    })
    .reduce((sum, e) => sum + e.amount, 0);
  return { income: Math.round(income), expense: Math.round(expense), net: Math.round(income - expense) };
}

function todayRange(): { from: Date; to: Date } {
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(to.getDate() + 1);
  return { from, to };
}

function weekRange(): { from: Date; to: Date } {
  const from = new Date();
  const day = from.getDay();
  from.setDate(from.getDate() - day);
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(to.getDate() + 7);
  return { from, to };
}

function monthRange(): { from: Date; to: Date } {
  const from = new Date();
  from.setDate(1);
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setMonth(to.getMonth() + 1);
  return { from, to };
}

function yearRange(): { from: Date; to: Date } {
  const from = new Date();
  from.setMonth(0, 1);
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setFullYear(to.getFullYear() + 1);
  return { from, to };
}

export function salesToday(): FinancialBucket {
  const { from, to } = todayRange();
  return bucketBetween(from, to);
}

export function salesThisWeek(): FinancialBucket {
  const { from, to } = weekRange();
  return bucketBetween(from, to);
}

export function salesThisMonth(): FinancialBucket {
  const { from, to } = monthRange();
  return bucketBetween(from, to);
}

export function salesThisYear(): FinancialBucket {
  const { from, to } = yearRange();
  return bucketBetween(from, to);
}

/* -------------------------------------------------------------------------- */
/* Contracts roll-ups                                                         */
/* -------------------------------------------------------------------------- */

export function contractStatusBuckets(): Record<ContractStatus, number> {
  return contracts.reduce(
    (acc, c) => {
      acc[c.status] = (acc[c.status] ?? 0) + 1;
      return acc;
    },
    {
      active: 0,
      expiring_soon: 0,
      completed: 0,
      awaiting_renewal: 0,
      draft: 0,
    } as Record<ContractStatus, number>,
  );
}

/**
 * Top-line KPIs surfaced on the contracts list page. Counted across
 * the full contract roster (not the filtered/visible page) so the
 * cards stay stable while users explore.
 */
export interface ContractInsights {
  /** Contracts in `active` or `expiring_soon` status. */
  activeCount: number;
  /** Annualised recurring revenue across active + expiring_soon. */
  recurringValue: number;
  /** Contracts expiring within the next 30 days (status `expiring_soon`). */
  expiringSoonCount: number;
  /** USD value at risk if those contracts are not renewed. */
  expiringSoonValue: number;
  /** Contracts whose end-date is in the past but not yet completed. */
  awaitingRenewalCount: number;
  /** Sum of work orders generated by active + expiring contracts. */
  scheduledWorkOrders: number;
}

export function contractInsights(): ContractInsights {
  const activeStatuses: ContractStatus[] = ["active", "expiring_soon"];
  const activeContracts = contracts.filter((c) =>
    activeStatuses.includes(c.status),
  );
  const expiringSoon = contracts.filter((c) => c.status === "expiring_soon");
  const awaitingRenewal = contracts.filter(
    (c) => c.status === "awaiting_renewal",
  );
  const activeIds = new Set(activeContracts.map((c) => c.id));
  const scheduledWorkOrders = visits.filter(
    (v) =>
      v.contractId &&
      activeIds.has(v.contractId) &&
      (v.status === "scheduled" || v.status === "in_progress"),
  ).length;
  return {
    activeCount: activeContracts.length,
    recurringValue: activeContracts.reduce((s, c) => s + c.value, 0),
    expiringSoonCount: expiringSoon.length,
    expiringSoonValue: expiringSoon.reduce((s, c) => s + c.value, 0),
    awaitingRenewalCount: awaitingRenewal.length,
    scheduledWorkOrders,
  };
}

/* -------------------------------------------------------------------------- */
/* Work order insights (enterprise summary cards)                             */
/* -------------------------------------------------------------------------- */

export interface WorkOrderInsights {
  /** Total work orders. */
  total: number;
  /** Currently scheduled — not yet started. */
  scheduledCount: number;
  /** Engineers on-site right now (status `in_progress`). */
  inProgressCount: number;
  /** Closed-out & signed off. */
  completedCount: number;
  /** Past their scheduled time without a start event. */
  overdueCount: number;
  /** Sum of revenue earned from closed-out work orders. */
  completedRevenue: number;
  /** Annual run-rate projection from completed revenue (×52/4 weeks). */
  monthlyRunRate: number;
}

export function workOrderInsights(): WorkOrderInsights {
  let scheduledCount = 0;
  let inProgressCount = 0;
  let completedCount = 0;
  let overdueCount = 0;
  let completedRevenue = 0;
  const now = Date.now();
  const last30Cutoff = now - 30 * 86_400_000;
  let last30Revenue = 0;
  for (const v of visits) {
    if (v.status === "scheduled") scheduledCount += 1;
    if (v.status === "in_progress") inProgressCount += 1;
    if (v.status === "overdue") overdueCount += 1;
    if (v.status === "completed") {
      completedCount += 1;
      completedRevenue += v.revenue;
      if (v.completedAt && new Date(v.completedAt).getTime() >= last30Cutoff) {
        last30Revenue += v.revenue;
      }
    }
  }
  return {
    total: visits.length,
    scheduledCount,
    inProgressCount,
    completedCount,
    overdueCount,
    completedRevenue,
    monthlyRunRate: last30Revenue,
  };
}

/* -------------------------------------------------------------------------- */
/* Customer insights (enterprise summary cards)                               */
/* -------------------------------------------------------------------------- */

export interface CustomerInsights {
  /** Total customers in the database. */
  total: number;
  /** New customers acquired in the trailing 30 days. */
  newLast30: number;
  /** Newly added in the 30 days BEFORE that — used for delta arrows. */
  newPrev30: number;
  /** Customers with at least one non-terminal contract (active / expiring / awaiting renewal). */
  onContract: number;
  /** Total active contracts across all customers. */
  activeContracts: number;
  /** Customers who haven't been touched in 60+ days. */
  staleCount: number;
  /** Total contracted recurring revenue across active service contracts (USD). */
  recurringRevenueUSD: number;
  /** Sum of all customer LTV. */
  totalLifetimeValueUSD: number;
  /** Average LTV per customer. */
  averageLifetimeValueUSD: number;
  /** Highest-value customer record. */
  topCustomer: { name: string; lifetimeValue: number } | null;
  /** Customer-type distribution as a tuple list. */
  typeDistribution: { type: CustomerType; count: number; pct: number }[];
  /** Total AC units installed across the customer base — the serviceable
   *  asset footprint your engineers are responsible for. */
  unitsUnderManagement: number;
}

/* -------------------------------------------------------------------------- */
/* Customer lifecycle (derived stage)                                         */
/* -------------------------------------------------------------------------- */

/**
 * Derive a customer's lifecycle stage from their activity. Pure function —
 * no mutation, deterministic given the inputs. Used by the customers list +
 * detail pages so the "Customer vs Prospect" semantics are explicit.
 *
 * Rules (first match wins):
 *  1. On an active service contract → `vip`
 *  2. Has an approved quotation OR a paid/partially-paid invoice → `active`
 *  3. Otherwise, if last contact was 180+ days ago → `dormant`
 *  4. Otherwise → `prospect`
 */
export function customerLifecycle(customer: Customer): CustomerLifecycle {
  const myContracts = contractsByCustomer[customer.id] ?? [];
  const hasActiveContract = myContracts.some(
    (c) =>
      c.status === "active" ||
      c.status === "expiring_soon" ||
      c.status === "awaiting_renewal",
  );
  if (hasActiveContract) return "vip";

  const hasApprovedQuote = quotations.some(
    (q) => q.customerId === customer.id && q.status === "approved",
  );
  const hasPaidInvoice = invoices.some(
    (i) =>
      i.customerId === customer.id &&
      (i.status === "paid" || i.status === "partially_paid"),
  );
  if (hasApprovedQuote || hasPaidInvoice) return "active";

  const dormantCutoff = Date.now() - 180 * 86_400_000;
  if (new Date(customer.lastTouchedAt).getTime() < dormantCutoff) {
    return "dormant";
  }
  return "prospect";
}

/**
 * Pre-computed lifecycle index for the seeded customer set. Cheap O(1)
 * lookup from the customers list/detail pages — newly-created customers
 * created at runtime fall through to {@link customerLifecycle} on demand.
 */
export const lifecycleByCustomer: Record<ID, CustomerLifecycle> =
  customers.reduce(
    (acc, c) => {
      acc[c.id] = customerLifecycle(c);
      return acc;
    },
    {} as Record<ID, CustomerLifecycle>,
  );

export function customerInsights(): CustomerInsights {
  const now = Date.now();
  const dayMs = 86_400_000;
  const cutoff30 = now - 30 * dayMs;
  const cutoff60 = now - 60 * dayMs;
  const cutoffPrev = now - 60 * dayMs;
  const cutoffPrevStart = now - 90 * dayMs;

  let newLast30 = 0;
  let newPrev30 = 0;
  let staleCount = 0;
  let totalLtv = 0;
  let topCustomer: { name: string; lifetimeValue: number } | null = null;
  const typeCounts: Record<CustomerType, number> = {
    residential: 0,
    commercial: 0,
    industrial: 0,
  };

  for (const c of customers) {
    typeCounts[c.type] += 1;
    const created = new Date(c.createdAt).getTime();
    if (created >= cutoff30) newLast30 += 1;
    else if (created >= cutoffPrevStart && created < cutoffPrev) newPrev30 += 1;
    if (new Date(c.lastTouchedAt).getTime() < cutoff60) staleCount += 1;
    totalLtv += c.lifetimeValue;
    if (!topCustomer || c.lifetimeValue > topCustomer.lifetimeValue) {
      topCustomer = { name: c.name, lifetimeValue: c.lifetimeValue };
    }
  }

  // Active = contracts in non-terminal states for at least one of their units.
  const activeContractStatuses: ContractStatus[] = [
    "active",
    "expiring_soon",
    "awaiting_renewal",
  ];
  const activeContracts = contracts.filter((c) =>
    activeContractStatuses.includes(c.status),
  );
  const onContractCustomerIds = new Set(activeContracts.map((c) => c.customerId));
  const recurringRevenueUSD = activeContracts.reduce(
    (sum, c) => sum + c.value,
    0,
  );

  const unitsUnderManagement = Object.values(unitsByCustomer).reduce(
    (sum, list) => sum + list.length,
    0,
  );

  const total = customers.length;
  return {
    total,
    newLast30,
    newPrev30,
    onContract: onContractCustomerIds.size,
    activeContracts: activeContracts.length,
    staleCount,
    recurringRevenueUSD,
    totalLifetimeValueUSD: totalLtv,
    averageLifetimeValueUSD: total === 0 ? 0 : totalLtv / total,
    topCustomer,
    typeDistribution: (Object.keys(typeCounts) as CustomerType[]).map((k) => ({
      type: k,
      count: typeCounts[k],
      pct: total === 0 ? 0 : (typeCounts[k] / total) * 100,
    })),
    unitsUnderManagement,
  };
}

export function engineerStats(engineerId: ID, from: Date, to: Date) {
  const eng = userMap[engineerId];
  const eVisits = visits.filter(
    (v) => v.engineerId === engineerId &&
      new Date(v.scheduledAt).getTime() >= from.getTime() &&
      new Date(v.scheduledAt).getTime() < to.getTime(),
  );
  const completed = eVisits.filter((v) => v.status === "completed");
  const scheduled = eVisits.filter(
    (v) => v.status === "scheduled" || v.status === "in_progress",
  );
  const hours =
    completed.reduce((sum, v) => sum + (v.durationMinutes ?? 0), 0) / 60;
  const revenue = completed.reduce((sum, v) => sum + v.revenue, 0);
  const ratings = completed
    .map((v) => v.rating)
    .filter((r): r is number => typeof r === "number");
  const avgRating =
    ratings.length > 0
      ? ratings.reduce((s, r) => s + r, 0) / ratings.length
      : eng?.rating ?? 0;
  return {
    engineer: eng,
    completedJobs: completed.length,
    scheduledJobs: scheduled.length,
    serviceHours: Math.round(hours * 10) / 10,
    revenue,
    rating: Math.round(avgRating * 10) / 10,
  };
}
