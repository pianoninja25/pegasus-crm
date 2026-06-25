/**
 * Deterministic mock data seed. Generates a believable CRM workspace at
 * module import time. Re-imports are cached by the module system, so every
 * feature hook reading from this file sees the same data — that gives us
 * filter/sort/detail-page-lookup behaviour identical to a real backend.
 */

import type {
  ActivityKind,
  DealStage,
  ID,
  LeadStatus,
  Priority,
  TeamMember,
  Workspace,
} from "./types";
import { ACTIVE_STAGES } from "./types";

/* -------------------------------------------------------------------------- */
/* Deterministic PRNG so the seed is stable across reloads + SSR / CSR.       */
/* mulberry32 — small, fast, good distribution.                               */
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

const rand = mulberry32(20260625);

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

function maybe<T>(value: T, probability = 0.5): T | undefined {
  return rand() < probability ? value : undefined;
}

let counter = 0;
function id(prefix: string): ID {
  counter += 1;
  return `${prefix}_${counter.toString(36).padStart(4, "0")}`;
}

/* -------------------------------------------------------------------------- */
/* People + name corpus                                                       */
/* -------------------------------------------------------------------------- */

const FIRST_NAMES = [
  "Aisha", "Liam", "Sofia", "Noah", "Mia", "Ethan", "Olivia", "Mason",
  "Ava", "Lucas", "Isabella", "Logan", "Charlotte", "Aiden", "Amelia",
  "Elijah", "Harper", "Jackson", "Evelyn", "Sebastian", "Abigail",
  "Mateo", "Emily", "Daniel", "Elizabeth", "Henry", "Sofia", "Jacob",
  "Avery", "Michael", "Ella", "Alexander", "Madison", "William", "Scarlett",
  "Benjamin", "Victoria", "James", "Aria", "Owen", "Grace", "Theodore",
  "Chloe", "Leo", "Camila", "Nathan", "Layla", "Asher", "Penelope", "Carter",
  "Riley", "Wyatt", "Zoe", "Julian", "Nora", "Anthony", "Lily", "Hudson",
  "Hannah", "Ezra", "Lillian", "Caleb", "Addison", "Isaiah", "Eleanor",
  "Yuki", "Wei", "Priya", "Diego", "Fatima", "Kwame", "Anika", "Joaquin",
];

const LAST_NAMES = [
  "Patel", "Nguyen", "Garcia", "Martinez", "Wang", "Kim", "Smith",
  "Johnson", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor",
  "Anderson", "Thomas", "Jackson", "White", "Harris", "Lewis", "Robinson",
  "Walker", "Young", "Allen", "King", "Wright", "Scott", "Green", "Adams",
  "Baker", "Hill", "Carter", "Mitchell", "Roberts", "Turner", "Phillips",
  "Campbell", "Parker", "Evans", "Edwards", "Collins", "Stewart", "Morris",
  "Cook", "Rogers", "Cooper", "Ortiz", "Reed", "Bailey", "Bell",
  "Okafor", "Singh", "Sato", "Andersen", "Becker", "Costa", "Eriksen",
];

const TITLES_BY_DEPT: Record<string, string[]> = {
  engineering: [
    "Head of Engineering",
    "VP Engineering",
    "Engineering Manager",
    "Staff Engineer",
    "Senior Engineer",
    "Platform Lead",
  ],
  product: [
    "Head of Product",
    "VP Product",
    "Senior Product Manager",
    "Product Manager",
    "Product Designer",
  ],
  ops: [
    "COO",
    "Head of Operations",
    "Operations Manager",
    "Field Operations Lead",
    "Workflow Architect",
  ],
  sales: [
    "VP Sales",
    "Director of Sales",
    "Account Executive",
    "Sales Manager",
    "Customer Success Lead",
  ],
  finance: [
    "CFO",
    "VP Finance",
    "Finance Director",
    "Controller",
    "FP&A Manager",
  ],
  marketing: [
    "CMO",
    "VP Marketing",
    "Director of Demand Gen",
    "Marketing Manager",
    "Content Lead",
  ],
  exec: ["CEO", "Founder", "Co-Founder", "President"],
};

const DEPARTMENTS = Object.keys(TITLES_BY_DEPT);

/* -------------------------------------------------------------------------- */
/* Companies                                                                  */
/* -------------------------------------------------------------------------- */

const INDUSTRIES = [
  "SaaS",
  "Fintech",
  "Healthcare",
  "Logistics",
  "Manufacturing",
  "Retail",
  "Energy",
  "Media",
  "Education",
  "Real Estate",
  "Travel",
  "Cybersecurity",
  "AI / ML",
  "E-commerce",
  "Telecom",
];

const COMPANY_PREFIX = [
  "Helio", "Atlas", "Northwind", "Lumen", "Stride", "Orbit", "Anvil",
  "Beacon", "Capstone", "Drift", "Echo", "Forge", "Glacier", "Halo",
  "Ion", "Juno", "Krane", "Lattice", "Mercer", "Nimbus", "Oxide",
  "Parallax", "Quanta", "Riverlane", "Solstice", "Terra", "Uplink",
  "Vector", "Wayfair", "Xenon", "Yonder", "Zephyr", "Cinder", "Aurora",
  "Compass", "Helix", "Mosaic", "Vellum", "Pioneer", "Cascade",
];

const COMPANY_SUFFIX = [
  "Labs",
  "Systems",
  "Logistics",
  "Health",
  "Capital",
  "Robotics",
  "Group",
  "Energy",
  "Networks",
  "Bio",
  "Materials",
  "Cloud",
  "Insurance",
  "Studios",
  "Foods",
  "Mobility",
];

const CITY_COUNTRY: { city: string; country: string }[] = [
  { city: "San Francisco", country: "USA" },
  { city: "New York", country: "USA" },
  { city: "Austin", country: "USA" },
  { city: "Toronto", country: "Canada" },
  { city: "London", country: "UK" },
  { city: "Berlin", country: "Germany" },
  { city: "Amsterdam", country: "Netherlands" },
  { city: "Paris", country: "France" },
  { city: "Stockholm", country: "Sweden" },
  { city: "Singapore", country: "Singapore" },
  { city: "Tokyo", country: "Japan" },
  { city: "Sydney", country: "Australia" },
  { city: "Bangalore", country: "India" },
  { city: "São Paulo", country: "Brazil" },
  { city: "Mexico City", country: "Mexico" },
  { city: "Jakarta", country: "Indonesia" },
];

const TAG_POOL = [
  "Strategic", "Champion", "Decision-maker", "Influencer", "Renewal",
  "Expansion", "Inbound", "Outbound", "Webinar", "Partner",
  "Enterprise", "Mid-market", "SMB", "Trial", "Demo-booked",
  "Cold", "Warm", "Hot", "Replied", "On-hold",
];

const SOURCES = [
  "Inbound",
  "Outbound",
  "Referral",
  "Event",
  "Webinar",
  "Partner",
  "Cold call",
  "Paid ads",
  "LinkedIn",
  "Content",
];

/* -------------------------------------------------------------------------- */
/* Workspace + team                                                           */
/* -------------------------------------------------------------------------- */

export const workspace: Workspace = {
  id: "ws_pegasus_crm",
  name: "Pegasus Inc.",
  plan: "Growth",
};

export const teamMembers: TeamMember[] = [
  {
    id: "u_leo",
    name: "Leo Santoso",
    email: "leo@pegasus.io",
    title: "Founder",
    role: "owner",
  },
  {
    id: "u_sarah",
    name: "Sarah Chen",
    email: "sarah@pegasus.io",
    title: "Head of Sales",
    role: "admin",
  },
  {
    id: "u_marcus",
    name: "Marcus Patel",
    email: "marcus@pegasus.io",
    title: "Account Executive",
    role: "member",
  },
  {
    id: "u_jess",
    name: "Jessica Wong",
    email: "jess@pegasus.io",
    title: "Account Executive",
    role: "member",
  },
  {
    id: "u_diego",
    name: "Diego Alvarez",
    email: "diego@pegasus.io",
    title: "Customer Success",
    role: "member",
  },
  {
    id: "u_aria",
    name: "Aria Okafor",
    email: "aria@pegasus.io",
    title: "Sales Development Rep",
    role: "member",
  },
];

export const currentUser: TeamMember = teamMembers[0]!;

/* -------------------------------------------------------------------------- */
/* Generators                                                                 */
/* -------------------------------------------------------------------------- */

export interface SeedCompany {
  id: ID;
  name: string;
  domain: string;
  industry: string;
  size: number;
  /** Annual revenue, USD. */
  annualRevenue: number;
  city: string;
  country: string;
  founded: number;
  description: string;
  tags: string[];
  ownerId: ID;
  source: string;
  createdAt: string;
  updatedAt: string;
}

function generateCompanies(count: number): SeedCompany[] {
  const out: SeedCompany[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < count; i++) {
    const prefix = pick(COMPANY_PREFIX);
    const suffix = pick(COMPANY_SUFFIX);
    const name = `${prefix} ${suffix}`;
    if (seen.has(name)) {
      i -= 1;
      continue;
    }
    seen.add(name);
    const place = pick(CITY_COUNTRY);
    const industry = pick(INDUSTRIES);
    const size = pick([8, 15, 28, 50, 95, 180, 320, 540, 880, 1500, 3200, 6800]);
    const annualRevenue = size * intBetween(80_000, 220_000);
    const createdDays = intBetween(7, 720);
    const updatedDays = intBetween(0, createdDays);
    out.push({
      id: id("co"),
      name,
      domain: `${prefix.toLowerCase()}${suffix.toLowerCase().replace(/[^a-z]/g, "")}.com`,
      industry,
      size,
      annualRevenue,
      city: place.city,
      country: place.country,
      founded: intBetween(1985, 2024),
      description: `${name} is a ${industry.toLowerCase()} company headquartered in ${place.city}. ${size.toLocaleString()} employees across ${intBetween(1, 8)} offices.`,
      tags: pickN(TAG_POOL, intBetween(1, 3)),
      ownerId: pick(teamMembers).id,
      source: pick(SOURCES),
      createdAt: new Date(Date.now() - createdDays * 86_400_000).toISOString(),
      updatedAt: new Date(Date.now() - updatedDays * 86_400_000).toISOString(),
    });
  }
  return out;
}

export interface SeedContact {
  id: ID;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  title: string;
  department: string;
  companyId: ID | null;
  city: string;
  country: string;
  tags: string[];
  ownerId: ID;
  source: string;
  /** When the contact was last "touched" by the team — emailed, called, etc. */
  lastTouchedAt: string;
  createdAt: string;
  notes: string;
  starred: boolean;
}

function generateContacts(count: number, companies: SeedCompany[]): SeedContact[] {
  const out: SeedContact[] = [];
  const emails = new Set<string>();
  for (let i = 0; i < count; i++) {
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const fullName = `${firstName} ${lastName}`;
    const department = pick(DEPARTMENTS);
    const title = pick(TITLES_BY_DEPT[department] ?? ["Manager"]);
    const company = rand() < 0.92 ? pick(companies) : null;
    const domain = company?.domain ?? `${lastName.toLowerCase()}.io`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
    if (emails.has(email)) {
      i -= 1;
      continue;
    }
    emails.add(email);
    const place = company
      ? { city: company.city, country: company.country }
      : pick(CITY_COUNTRY);
    const createdDays = intBetween(1, 540);
    const touchedDays = intBetween(0, Math.min(createdDays, 90));
    out.push({
      id: id("c"),
      firstName,
      lastName,
      fullName,
      email,
      phone: `+1 (${intBetween(200, 999)}) ${intBetween(200, 999)}-${intBetween(1000, 9999)}`,
      title,
      department,
      companyId: company?.id ?? null,
      city: place.city,
      country: place.country,
      tags: pickN(TAG_POOL, intBetween(0, 3)),
      ownerId: pick(teamMembers).id,
      source: pick(SOURCES),
      lastTouchedAt: new Date(Date.now() - touchedDays * 86_400_000).toISOString(),
      createdAt: new Date(Date.now() - createdDays * 86_400_000).toISOString(),
      notes:
        rand() < 0.35
          ? `Met at ${pick(["the Helix conference", "a partner event", "the SaaStr meetup", "a customer office hour", "an exec dinner"])} — interested in the ${pick(["pipeline view", "team analytics", "API access", "SSO + audit log", "integrations"])}.`
          : "",
      starred: rand() < 0.12,
    });
  }
  return out;
}

export interface SeedDeal {
  id: ID;
  name: string;
  companyId: ID;
  contactIds: ID[];
  ownerId: ID;
  stage: DealStage;
  /** USD. */
  value: number;
  /** Win probability override; if absent we derive from stage. */
  probabilityOverride?: number;
  /** Expected close date. */
  expectedCloseAt: string;
  /** Actually closed date — populated only for closed_won / closed_lost. */
  closedAt?: string;
  source: string;
  tags: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
  /** Per-stage history with timestamps — drives the deal-detail timeline. */
  stageHistory: { stage: DealStage; at: string; actorId: ID }[];
}

const DEAL_TITLE_TEMPLATES = [
  "Annual Pro plan",
  "Enterprise seat expansion",
  "Multi-year renewal",
  "Pilot → production",
  "Strategic partnership",
  "SSO + audit log add-on",
  "Platform migration",
  "Procurement upgrade",
  "Co-marketing engagement",
  "Custom integration build",
];

function generateDeals(count: number, companies: SeedCompany[], contacts: SeedContact[]): SeedDeal[] {
  const out: SeedDeal[] = [];
  for (let i = 0; i < count; i++) {
    const company = pick(companies);
    const companyContacts = contacts.filter((c) => c.companyId === company.id);
    const contactCount = Math.min(companyContacts.length, intBetween(1, 3));
    const contactIds = pickN(companyContacts, contactCount).map((c) => c.id);
    const stageRoll = rand();
    let stage: DealStage;
    if (stageRoll < 0.22) stage = "lead";
    else if (stageRoll < 0.42) stage = "qualified";
    else if (stageRoll < 0.6) stage = "proposal";
    else if (stageRoll < 0.74) stage = "negotiation";
    else if (stageRoll < 0.92) stage = "closed_won";
    else stage = "closed_lost";

    const value = pick([
      4_800, 9_500, 15_000, 28_000, 42_000, 75_000, 120_000,
      180_000, 240_000, 360_000, 480_000, 720_000, 1_200_000,
    ]);
    const createdDays = intBetween(2, 240);
    const updatedDays = intBetween(0, Math.min(createdDays, 30));
    const closeOffset = stage === "closed_won" || stage === "closed_lost"
      ? -intBetween(0, 60)
      : intBetween(3, 120);

    // Build stage history newest-first then reverse so it reads oldest-first.
    const reachedStages: DealStage[] = [];
    for (const s of ["lead", "qualified", "proposal", "negotiation"] as const) {
      reachedStages.push(s);
      if (s === stage) break;
    }
    if (stage === "closed_won" || stage === "closed_lost") {
      reachedStages.push(stage);
    }
    const stageHistory = reachedStages.map((s, idx) => {
      const offset = createdDays - Math.floor(((idx + 1) / reachedStages.length) * (createdDays - 1));
      return {
        stage: s,
        at: new Date(Date.now() - offset * 86_400_000).toISOString(),
        actorId: pick(teamMembers).id,
      };
    });

    out.push({
      id: id("d"),
      name: `${company.name} — ${pick(DEAL_TITLE_TEMPLATES)}`,
      companyId: company.id,
      contactIds,
      ownerId: pick(teamMembers).id,
      stage,
      value,
      expectedCloseAt: new Date(Date.now() + closeOffset * 86_400_000).toISOString(),
      closedAt: (stage === "closed_won" || stage === "closed_lost")
        ? new Date(Date.now() + closeOffset * 86_400_000).toISOString()
        : undefined,
      source: pick(SOURCES),
      tags: pickN(TAG_POOL, intBetween(0, 2)),
      description: `${pick([
        "Customer is consolidating tools and wants a single pane of glass.",
        "Replacing an in-house spreadsheet workflow that broke at scale.",
        "Renewal locked in — pushing to expand seats by 40%.",
        "Procurement working through MSA + security questionnaire.",
        "POC went well; final sign-off pending finance review.",
        "Champion left — need to re-engage with new buyer.",
      ])} ${maybe("Champion: " + (companyContacts[0]?.fullName ?? "TBD"), 0.6) ?? ""}`.trim(),
      createdAt: new Date(Date.now() - createdDays * 86_400_000).toISOString(),
      updatedAt: new Date(Date.now() - updatedDays * 86_400_000).toISOString(),
      stageHistory,
    });
  }
  return out;
}

export interface SeedActivity {
  id: ID;
  kind: ActivityKind;
  subject: string;
  body: string;
  priority: Priority;
  ownerId: ID;
  contactId?: ID;
  companyId?: ID;
  dealId?: ID;
  /** When the activity is or was scheduled to happen. */
  dueAt: string;
  /** Completed timestamp; if absent the activity is open. */
  completedAt?: string;
  durationMinutes?: number;
  createdAt: string;
}

const ACTIVITY_SUBJECTS: Record<ActivityKind, string[]> = {
  call: [
    "Discovery call",
    "Pricing walkthrough",
    "Technical deep dive",
    "Decision-maker introduction",
    "Renewal conversation",
  ],
  email: [
    "Send proposal",
    "Reply to security questionnaire",
    "Follow up on demo",
    "Forward case study",
    "Share onboarding plan",
  ],
  meeting: [
    "Quarterly business review",
    "Onboarding kickoff",
    "Roadmap sync",
    "Champion alignment",
    "Mutual action plan review",
  ],
  task: [
    "Draft MSA redlines",
    "Confirm budget approver",
    "Upload signed order form",
    "Hand off to CS",
    "Update Salesforce mirror",
  ],
  note: [
    "Internal sync notes",
    "Champion debrief",
    "Post-demo learnings",
    "Compliance flagged item",
    "Pricing memo",
  ],
};

function generateActivities(
  count: number,
  contacts: SeedContact[],
  companies: SeedCompany[],
  deals: SeedDeal[],
): SeedActivity[] {
  const out: SeedActivity[] = [];
  for (let i = 0; i < count; i++) {
    const kind = pick<ActivityKind>(["call", "email", "meeting", "task", "note"]);
    const dealAttach = rand() < 0.55 ? pick(deals) : undefined;
    const contact = dealAttach
      ? contacts.find((c) => c.id === dealAttach.contactIds[0])
      : pick(contacts);
    const company = dealAttach
      ? companies.find((co) => co.id === dealAttach.companyId)
      : contact?.companyId
        ? companies.find((co) => co.id === contact!.companyId)
        : undefined;

    const isCompleted = rand() < 0.62;
    const completedDays = isCompleted ? -intBetween(0, 30) : intBetween(0, 21);
    const createdDays = intBetween(
      Math.max(0, -completedDays),
      Math.max(2, -completedDays + 14),
    );

    out.push({
      id: id("a"),
      kind,
      subject: pick(ACTIVITY_SUBJECTS[kind]),
      body:
        rand() < 0.6
          ? `${pick([
              "Walked through the budget question with",
              "Followed up on the security review for",
              "Confirmed next steps with",
              "Re-engaged after silent treatment from",
              "Scoped the procurement timeline with",
            ])} ${contact?.fullName ?? "the team"}.`
          : "",
      priority: pick<Priority>(["low", "normal", "normal", "normal", "high", "urgent"]),
      ownerId: pick(teamMembers).id,
      contactId: contact?.id,
      companyId: company?.id,
      dealId: dealAttach?.id,
      dueAt: new Date(Date.now() + completedDays * 86_400_000).toISOString(),
      completedAt: isCompleted
        ? new Date(Date.now() + completedDays * 86_400_000).toISOString()
        : undefined,
      durationMinutes:
        kind === "call" || kind === "meeting" ? intBetween(15, 60) : undefined,
      createdAt: new Date(Date.now() - createdDays * 86_400_000).toISOString(),
    });
  }
  return out;
}

export interface SeedLead {
  id: ID;
  fullName: string;
  email: string;
  company: string;
  title: string;
  status: LeadStatus;
  source: string;
  /** 0..100 — derived predictive score. */
  score: number;
  ownerId: ID;
  city: string;
  country: string;
  createdAt: string;
  lastContactedAt: string;
}

function generateLeads(count: number): SeedLead[] {
  const out: SeedLead[] = [];
  for (let i = 0; i < count; i++) {
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const fullName = `${firstName} ${lastName}`;
    const prefix = pick(COMPANY_PREFIX);
    const suffix = pick(COMPANY_SUFFIX);
    const companyName = `${prefix} ${suffix}`;
    const domain = `${prefix.toLowerCase()}${suffix.toLowerCase().replace(/[^a-z]/g, "")}.com`;
    const place = pick(CITY_COUNTRY);
    const status = pick<LeadStatus>([
      "new", "new", "new", "working", "working", "nurture", "converted", "disqualified",
    ]);
    const createdDays = intBetween(0, 90);
    const contactedDays = intBetween(0, Math.min(createdDays, 30));
    out.push({
      id: id("l"),
      fullName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
      company: companyName,
      title: pick(TITLES_BY_DEPT[pick(DEPARTMENTS)] ?? ["Manager"]),
      status,
      source: pick(SOURCES),
      score: intBetween(15, 95),
      ownerId: pick(teamMembers).id,
      city: place.city,
      country: place.country,
      createdAt: new Date(Date.now() - createdDays * 86_400_000).toISOString(),
      lastContactedAt: new Date(Date.now() - contactedDays * 86_400_000).toISOString(),
    });
  }
  return out;
}

export interface SeedConversation {
  id: ID;
  channel: "email" | "linkedin" | "whatsapp" | "phone";
  subject: string;
  preview: string;
  fromName: string;
  fromEmail: string;
  contactId?: ID;
  companyId?: ID;
  dealId?: ID;
  ownerId: ID;
  receivedAt: string;
  unread: boolean;
  starred: boolean;
  needsReply: boolean;
}

const CONVO_SUBJECTS = [
  "Re: pricing for 50-seat plan",
  "Question on the security questionnaire",
  "Following up — demo recap?",
  "Intro: meet our procurement team",
  "Quick favor on the case study",
  "Updated MSA attached",
  "Re: invoice scheduling",
  "Champion debrief",
  "Renewal — timing check",
  "Quick win to share",
];

const CONVO_PREVIEWS = [
  "Thanks for the proposal. We're reviewing internally and should have feedback by Friday.",
  "Our security team flagged a couple of items — sending the redlined version now.",
  "Loved the walk-through last week. Want to bring in our CTO for the next round.",
  "Looping in Marisa from procurement so we can move on the order form.",
  "Could we use your logo in our upcoming launch deck? Happy to share before we publish.",
  "Updated terms inline. Mostly aligned but the cap on liability is a sticking point.",
  "We can do quarterly billing but need NET 60 — flagging early so it's not a surprise.",
  "Met with the team after the demo. Three big wins, two concerns I want to share live.",
  "Heads up — our procurement is asking us to consolidate vendors. Want to discuss.",
  "Pushed your update to our team channel and got immediate +1s. Booking a follow-up.",
];

function generateConversations(
  count: number,
  contacts: SeedContact[],
  companies: SeedCompany[],
  deals: SeedDeal[],
): SeedConversation[] {
  const out: SeedConversation[] = [];
  for (let i = 0; i < count; i++) {
    const dealAttach = rand() < 0.5 ? pick(deals) : undefined;
    const contact = dealAttach
      ? contacts.find((c) => c.id === dealAttach.contactIds[0])
      : pick(contacts);
    const company = dealAttach
      ? companies.find((co) => co.id === dealAttach.companyId)
      : contact?.companyId
        ? companies.find((co) => co.id === contact!.companyId)
        : undefined;
    const receivedDays = intBetween(0, 21);
    const receivedHours = intBetween(0, 23);
    out.push({
      id: id("conv"),
      channel: pick<SeedConversation["channel"]>([
        "email", "email", "email", "linkedin", "whatsapp", "phone",
      ]),
      subject: pick(CONVO_SUBJECTS),
      preview: pick(CONVO_PREVIEWS),
      fromName: contact?.fullName ?? "Unknown",
      fromEmail: contact?.email ?? "no-reply@example.com",
      contactId: contact?.id,
      companyId: company?.id,
      dealId: dealAttach?.id,
      ownerId: pick(teamMembers).id,
      receivedAt: new Date(
        Date.now() - receivedDays * 86_400_000 - receivedHours * 3_600_000,
      ).toISOString(),
      unread: rand() < 0.42,
      starred: rand() < 0.12,
      needsReply: rand() < 0.55,
    });
  }
  return out;
}

export interface SeedNotification {
  id: ID;
  kind: "deal" | "activity" | "mention" | "system";
  title: string;
  body: string;
  link: string;
  receivedAt: string;
  read: boolean;
  actor?: { id: ID; name: string };
}

function generateNotifications(
  contacts: SeedContact[],
  deals: SeedDeal[],
): SeedNotification[] {
  const out: SeedNotification[] = [];
  const sample = pickN(deals, 12);
  for (const d of sample) {
    const actor = pick(teamMembers);
    const offsetMin = intBetween(2, 60 * 24 * 6);
    out.push({
      id: id("n"),
      kind: rand() < 0.5 ? "deal" : "activity",
      title: rand() < 0.5
        ? `Deal moved to ${d.stage.replace("_", " ")}`
        : `${actor.name} logged an activity on ${d.name}`,
      body: d.name,
      link: `/dashboard/deals/${d.id}`,
      receivedAt: new Date(Date.now() - offsetMin * 60_000).toISOString(),
      read: rand() < 0.5,
      actor: { id: actor.id, name: actor.name },
    });
  }
  // a handful of mentions on contacts
  for (const c of pickN(contacts, 6)) {
    const actor = pick(teamMembers);
    out.push({
      id: id("n"),
      kind: "mention",
      title: `${actor.name} mentioned you on ${c.fullName}`,
      body: `"@you — can you take this one? Champion-shaped and asking for a 30-min walkthrough."`,
      link: `/dashboard/contacts/${c.id}`,
      receivedAt: new Date(Date.now() - intBetween(5, 60 * 24 * 4) * 60_000).toISOString(),
      read: rand() < 0.3,
      actor: { id: actor.id, name: actor.name },
    });
  }
  out.push({
    id: id("n"),
    kind: "system",
    title: "Welcome to Pegasus CRM",
    body: "Your workspace is seeded with a believable book of business. Tweak the theme, kick the tires, ship the demo.",
    link: "/dashboard/settings",
    receivedAt: new Date(Date.now() - 60 * 60_000).toISOString(),
    read: false,
  });
  return out.sort(
    (a, b) =>
      new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime(),
  );
}

/* -------------------------------------------------------------------------- */
/* Materialise the seed                                                       */
/* -------------------------------------------------------------------------- */

export const companies = generateCompanies(40);
export const contacts = generateContacts(180, companies);
export const deals = generateDeals(64, companies, contacts);
export const activities = generateActivities(220, contacts, companies, deals);
export const leads = generateLeads(36);
export const conversations = generateConversations(50, contacts, companies, deals);
export const notifications = generateNotifications(contacts, deals);

/* -------------------------------------------------------------------------- */
/* Index helpers                                                              */
/* -------------------------------------------------------------------------- */

export const memberMap: Record<ID, TeamMember> = Object.fromEntries(
  teamMembers.map((m) => [m.id, m]),
);

export const companyMap: Record<ID, SeedCompany> = Object.fromEntries(
  companies.map((c) => [c.id, c]),
);

export const contactMap: Record<ID, SeedContact> = Object.fromEntries(
  contacts.map((c) => [c.id, c]),
);

export const dealMap: Record<ID, SeedDeal> = Object.fromEntries(
  deals.map((d) => [d.id, d]),
);

/* -------------------------------------------------------------------------- */
/* Aggregates used by the dashboard overview                                  */
/* -------------------------------------------------------------------------- */

export function pipelineByStage() {
  const totals: Record<DealStage, { count: number; value: number }> = {
    lead: { count: 0, value: 0 },
    qualified: { count: 0, value: 0 },
    proposal: { count: 0, value: 0 },
    negotiation: { count: 0, value: 0 },
    closed_won: { count: 0, value: 0 },
    closed_lost: { count: 0, value: 0 },
  };
  for (const d of deals) {
    const slot = totals[d.stage];
    slot.count += 1;
    slot.value += d.value;
  }
  return totals;
}

export function openPipelineValue(): number {
  return deals
    .filter((d) => ACTIVE_STAGES.includes(d.stage))
    .reduce((s, d) => s + d.value, 0);
}

export function wonThisMonth(): number {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  return deals
    .filter((d) => d.stage === "closed_won" && d.closedAt && new Date(d.closedAt) >= start)
    .reduce((s, d) => s + d.value, 0);
}

export function winRate(): number {
  const closed = deals.filter(
    (d) => d.stage === "closed_won" || d.stage === "closed_lost",
  );
  if (closed.length === 0) return 0;
  const won = closed.filter((d) => d.stage === "closed_won").length;
  return won / closed.length;
}

export function overdueActivitiesCount(): number {
  const now = Date.now();
  return activities.filter(
    (a) => !a.completedAt && new Date(a.dueAt).getTime() < now,
  ).length;
}
