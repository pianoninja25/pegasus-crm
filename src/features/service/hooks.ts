"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { clone, delay } from "@/features/common/mock";
import {
  acUnits as seedAcUnits,
  contracts as seedContracts,
  customers as seedCustomers,
  engineers as seedEngineers,
  expenses as seedExpenses,
  invoices as seedInvoices,
  notifications as seedNotifications,
  quotations as seedQuotations,
  visits as seedVisits,
} from "./seed";
import type {
  AcUnit,
  AppNotification,
  AppUser,
  ChecklistItem,
  ContractStatus,
  ContractType,
  Customer,
  Expense,
  Invoice,
  Quotation,
  QuotationStatus,
  ServiceContract,
  ServiceFrequency,
  ServiceVisit,
  VisitStatus,
} from "./types";

/* -------------------------------------------------------------------------- */
/* In-memory stores                                                           */
/* -------------------------------------------------------------------------- */

let customersStore: Customer[] = clone(seedCustomers);
const unitsStore: AcUnit[] = clone(seedAcUnits);
let quotationsStore: Quotation[] = clone(seedQuotations);
let contractsStore: ServiceContract[] = clone(seedContracts);
let visitsStore: ServiceVisit[] = clone(seedVisits);
const invoicesStore: Invoice[] = clone(seedInvoices);
const expensesStore: Expense[] = clone(seedExpenses);
let notificationsStore: AppNotification[] = clone(seedNotifications);
let engineersStore: AppUser[] = clone(seedEngineers);

/* -------------------------------------------------------------------------- */
/* Query keys                                                                 */
/* -------------------------------------------------------------------------- */

export const serviceKeys = {
  customers: ["customers"] as const,
  customer: (id: string) => ["customers", id] as const,
  units: ["units"] as const,
  unitsByCustomer: (id: string) => ["units", "by-customer", id] as const,
  quotations: ["quotations"] as const,
  quotation: (id: string) => ["quotations", id] as const,
  contracts: ["contracts"] as const,
  contract: (id: string) => ["contracts", id] as const,
  visits: ["visits"] as const,
  visit: (id: string) => ["visits", id] as const,
  invoices: ["invoices"] as const,
  invoice: (id: string) => ["invoices", id] as const,
  expenses: ["expenses"] as const,
  expense: (id: string) => ["expenses", id] as const,
  notifications: ["notifications"] as const,
  engineers: ["engineers"] as const,
  engineer: (id: string) => ["engineers", id] as const,
};

/* -------------------------------------------------------------------------- */
/* Customers                                                                  */
/* -------------------------------------------------------------------------- */

export function useCustomers() {
  return useQuery({
    queryKey: serviceKeys.customers,
    queryFn: () => delay(clone(customersStore), 100),
  });
}

export function useCustomer(id: string | undefined) {
  return useQuery({
    queryKey: serviceKeys.customer(id ?? ""),
    queryFn: () =>
      delay(customersStore.find((c) => c.id === id) ?? null, 80),
    enabled: !!id,
  });
}

/**
 * Payload accepted by {@link useCreateCustomer}. Fields the seed always
 * derives or defaults (`id`, `tags`, `ownerId`, `lifetimeValue`,
 * `createdAt`, `lastTouchedAt`) are optional and will be auto-filled.
 */
export type CreateCustomerInput = Omit<
  Customer,
  "id" | "createdAt" | "lastTouchedAt" | "lifetimeValue" | "tags" | "ownerId"
> & {
  tags?: string[];
  ownerId?: string;
  lifetimeValue?: number;
};

/**
 * Persist a new customer to the in-memory store and refresh the customers
 * query. The new record sorts to the top of the list because both
 * `createdAt` and `lastTouchedAt` default to "now".
 */
export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateCustomerInput) => {
      await delay(null, 180);
      const now = new Date().toISOString();
      const id = `cu_${Math.random().toString(36).slice(2, 8)}`;
      const next: Customer = {
        id,
        type: input.type,
        contactPerson: input.contactPerson,
        name: input.name,
        companyName: input.companyName,
        phone: input.phone,
        email: input.email,
        address: input.address,
        city: input.city,
        country: input.country,
        lat: input.lat,
        lng: input.lng,
        tags: input.tags ?? [],
        ownerId: input.ownerId ?? "u_admin",
        notes: input.notes,
        lifetimeValue: input.lifetimeValue ?? 0,
        createdAt: now,
        lastTouchedAt: now,
      };
      customersStore = [next, ...customersStore];
      return next;
    },
    onSuccess: (created) => {
      qc.setQueryData<Customer[]>(serviceKeys.customers, (prev) =>
        prev ? [created, ...prev] : [created],
      );
      qc.setQueryData(serviceKeys.customer(created.id), created);
      qc.invalidateQueries({ queryKey: serviceKeys.customers });
    },
  });
}

/* -------------------------------------------------------------------------- */
/* AC units                                                                   */
/* -------------------------------------------------------------------------- */

export function useUnits() {
  return useQuery({
    queryKey: serviceKeys.units,
    queryFn: () => delay(clone(unitsStore), 90),
  });
}

export function useUnitsForCustomer(customerId: string | undefined) {
  return useQuery({
    queryKey: serviceKeys.unitsByCustomer(customerId ?? ""),
    queryFn: () =>
      delay(
        unitsStore.filter((u) => u.customerId === customerId),
        70,
      ),
    enabled: !!customerId,
  });
}

/* -------------------------------------------------------------------------- */
/* Quotations                                                                 */
/* -------------------------------------------------------------------------- */

export function useQuotations() {
  return useQuery({
    queryKey: serviceKeys.quotations,
    queryFn: () => delay(clone(quotationsStore), 100),
  });
}

export function useQuotation(id: string | undefined) {
  return useQuery({
    queryKey: serviceKeys.quotation(id ?? ""),
    queryFn: () =>
      delay(quotationsStore.find((q) => q.id === id) ?? null, 80),
    enabled: !!id,
  });
}

/**
 * Payload to create a new draft quotation. The id, number, status, ownerId
 * (defaulted server-side), createdAt and validUntil are populated by the
 * mutation. All monetary calculations live in `quotationTotal`.
 */
export type CreateQuotationInput = {
  customerId: string;
  category: Quotation["category"];
  title: string;
  notes?: string;
  lines: Array<Omit<Quotation["lines"][number], "id">>;
  discountPct: number;
  taxPct: number;
  /** ISO date (yyyy-mm-dd) parsed to end-of-day. */
  validUntil: string;
  ownerId?: string;
};

/**
 * Persist a new draft quotation. Inserts at the top of the in-memory
 * store and patches the TanStack cache so the list updates immediately.
 *
 * The new quotation always starts in `"draft"` status — sending is a
 * separate user action via {@link useSetQuotationStatus}.
 */
export function useCreateQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateQuotationInput) => {
      await delay(null, 200);
      const id = `q_new_${Math.random().toString(36).slice(2, 8)}`;
      const number = `QUO-${String(quotationsStore.length + 1).padStart(
        4,
        "0",
      )}`;
      const next: Quotation = {
        id,
        number,
        customerId: input.customerId,
        category: input.category,
        status: "draft",
        title: input.title,
        notes: input.notes ?? "",
        lines: input.lines.map((l, idx) => ({
          ...l,
          id: `${id}_l${idx + 1}`,
        })),
        discountPct: input.discountPct,
        taxPct: input.taxPct,
        ownerId: input.ownerId ?? "u_leo",
        createdAt: new Date().toISOString(),
        validUntil: new Date(input.validUntil).toISOString(),
      };
      quotationsStore = [next, ...quotationsStore];
      return next;
    },
    onSuccess: (created) => {
      qc.setQueryData<Quotation[]>(serviceKeys.quotations, (prev) =>
        prev ? [created, ...prev] : [created],
      );
      qc.setQueryData(serviceKeys.quotation(created.id), created);
      qc.invalidateQueries({ queryKey: serviceKeys.quotations });
    },
  });
}

export function useSetQuotationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: QuotationStatus;
    }) => {
      await delay(null, 80);
      quotationsStore = quotationsStore.map((q) => {
        if (q.id !== id) return q;
        const nowIso = new Date().toISOString();
        return {
          ...q,
          status,
          sentAt: status === "sent" ? nowIso : q.sentAt,
          decidedAt:
            status === "approved" || status === "rejected" ? nowIso : q.decidedAt,
        };
      });
      return quotationsStore.find((q) => q.id === id)!;
    },
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: serviceKeys.quotations });
      const previous = qc.getQueryData<Quotation[]>(serviceKeys.quotations);
      if (previous) {
        qc.setQueryData<Quotation[]>(
          serviceKeys.quotations,
          previous.map((q) => (q.id === id ? { ...q, status } : q)),
        );
      }
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(serviceKeys.quotations, ctx.previous);
    },
    onSuccess: (updated) => {
      qc.setQueryData(serviceKeys.quotation(updated.id), updated);
      qc.invalidateQueries({ queryKey: serviceKeys.quotations });
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Contracts                                                                  */
/* -------------------------------------------------------------------------- */

export function useContracts() {
  return useQuery({
    queryKey: serviceKeys.contracts,
    queryFn: () => delay(clone(contractsStore), 100),
  });
}

export function useContract(id: string | undefined) {
  return useQuery({
    queryKey: serviceKeys.contract(id ?? ""),
    queryFn: () =>
      delay(contractsStore.find((c) => c.id === id) ?? null, 80),
    enabled: !!id,
  });
}

/**
 * Payload to create a new service contract. The mutation derives
 * `id`, `number`, and initial `status` (`draft` if `startDate` is in
 * the future, `active` otherwise). `unitIds` defaults to an empty
 * array so the contract can cover all-future-units lazily.
 */
export type CreateContractInput = {
  customerId: string;
  type: ContractType;
  frequency: ServiceFrequency;
  customIntervalDays?: number;
  /** ISO date (yyyy-mm-dd). */
  startDate: string;
  /** ISO date (yyyy-mm-dd). */
  endDate: string;
  engineerId: string;
  value: number;
  notes?: string;
  unitIds?: string[];
};

/**
 * Persist a new service contract. The new record sorts to the top of
 * the list (highest id). Initial status is derived from the start
 * date: future starts → `draft`, today/past starts → `active`.
 */
export function useCreateContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateContractInput) => {
      await delay(null, 200);
      const id = `k_new_${Math.random().toString(36).slice(2, 8)}`;
      const number = `K-${new Date().getFullYear()}-${String(
        contractsStore.length + 1,
      ).padStart(4, "0")}`;
      const startsInFuture = new Date(input.startDate).getTime() > Date.now();
      const next: ServiceContract = {
        id,
        number,
        customerId: input.customerId,
        type: input.type,
        status: startsInFuture ? "draft" : "active",
        startDate: new Date(input.startDate).toISOString(),
        endDate: new Date(input.endDate).toISOString(),
        frequency: input.frequency,
        customIntervalDays: input.customIntervalDays,
        engineerId: input.engineerId,
        value: input.value,
        notes: input.notes ?? "",
        unitIds: input.unitIds ?? [],
      };
      contractsStore = [next, ...contractsStore];
      return next;
    },
    onSuccess: (created) => {
      qc.setQueryData<ServiceContract[]>(serviceKeys.contracts, (prev) =>
        prev ? [created, ...prev] : [created],
      );
      qc.setQueryData(serviceKeys.contract(created.id), created);
      qc.invalidateQueries({ queryKey: serviceKeys.contracts });
    },
  });
}

/**
 * Patch the status of an existing service contract.  Used by the
 * lifecycle buttons on the contract detail page (e.g. "Renew",
 * "Mark as completed").  Optimistic update keeps the list view snappy.
 */
export function useSetContractStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: ContractStatus;
    }) => {
      await delay(null, 80);
      contractsStore = contractsStore.map((c) =>
        c.id === id ? { ...c, status } : c,
      );
      return contractsStore.find((c) => c.id === id)!;
    },
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: serviceKeys.contracts });
      const previous = qc.getQueryData<ServiceContract[]>(
        serviceKeys.contracts,
      );
      if (previous) {
        qc.setQueryData<ServiceContract[]>(
          serviceKeys.contracts,
          previous.map((c) => (c.id === id ? { ...c, status } : c)),
        );
      }
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous)
        qc.setQueryData(serviceKeys.contracts, ctx.previous);
    },
    onSuccess: (updated) => {
      qc.setQueryData(serviceKeys.contract(updated.id), updated);
      qc.invalidateQueries({ queryKey: serviceKeys.contracts });
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Visits                                                                     */
/* -------------------------------------------------------------------------- */

export function useVisits() {
  return useQuery({
    queryKey: serviceKeys.visits,
    queryFn: () => delay(clone(visitsStore), 110),
  });
}

export function useVisit(id: string | undefined) {
  return useQuery({
    queryKey: serviceKeys.visit(id ?? ""),
    queryFn: () => delay(visitsStore.find((v) => v.id === id) ?? null, 80),
    enabled: !!id,
  });
}

export function useUpdateVisit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: Partial<ServiceVisit>;
    }) => {
      await delay(null, 90);
      visitsStore = visitsStore.map((v) =>
        v.id === id ? { ...v, ...patch } : v,
      );
      return visitsStore.find((v) => v.id === id)!;
    },
    onSuccess: (updated) => {
      qc.setQueryData(serviceKeys.visit(updated.id), updated);
      qc.invalidateQueries({ queryKey: serviceKeys.visits });
    },
  });
}

export function useToggleChecklistItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      visitId,
      itemId,
    }: {
      visitId: string;
      itemId: string;
    }) => {
      await delay(null, 40);
      visitsStore = visitsStore.map((v) => {
        if (v.id !== visitId) return v;
        const checklist: ChecklistItem[] = v.checklist.map((item) =>
          item.id === itemId ? { ...item, checked: !item.checked } : item,
        );
        return { ...v, checklist };
      });
      return visitsStore.find((v) => v.id === visitId)!;
    },
    onMutate: async ({ visitId, itemId }) => {
      await qc.cancelQueries({ queryKey: serviceKeys.visit(visitId) });
      const prev = qc.getQueryData<ServiceVisit>(serviceKeys.visit(visitId));
      if (prev) {
        qc.setQueryData<ServiceVisit>(serviceKeys.visit(visitId), {
          ...prev,
          checklist: prev.checklist.map((i) =>
            i.id === itemId ? { ...i, checked: !i.checked } : i,
          ),
        });
      }
      return { prev };
    },
    onError: (_e, vars, ctx) => {
      if (ctx?.prev)
        qc.setQueryData(serviceKeys.visit(vars.visitId), ctx.prev);
    },
    onSuccess: (updated) => {
      qc.setQueryData(serviceKeys.visit(updated.id), updated);
      qc.invalidateQueries({ queryKey: serviceKeys.visits });
    },
  });
}

export function useSetVisitStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: VisitStatus;
    }) => {
      await delay(null, 70);
      visitsStore = visitsStore.map((v) => {
        if (v.id !== id) return v;
        const nowIso = new Date().toISOString();
        return {
          ...v,
          status,
          startedAt:
            status === "in_progress" && !v.startedAt ? nowIso : v.startedAt,
          completedAt: status === "completed" ? nowIso : v.completedAt,
          customerSigned: status === "completed" ? true : v.customerSigned,
        };
      });
      return visitsStore.find((v) => v.id === id)!;
    },
    onSuccess: (updated) => {
      qc.setQueryData(serviceKeys.visit(updated.id), updated);
      qc.invalidateQueries({ queryKey: serviceKeys.visits });
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Invoices                                                                   */
/* -------------------------------------------------------------------------- */

export function useInvoices() {
  return useQuery({
    queryKey: serviceKeys.invoices,
    queryFn: () => delay(clone(invoicesStore), 100),
  });
}

export function useInvoice(id: string | undefined) {
  return useQuery({
    queryKey: serviceKeys.invoice(id ?? ""),
    queryFn: () =>
      delay(invoicesStore.find((i) => i.id === id) ?? null, 80),
    enabled: !!id,
  });
}

/* -------------------------------------------------------------------------- */
/* Expenses                                                                   */
/* -------------------------------------------------------------------------- */

export function useExpenses() {
  return useQuery({
    queryKey: serviceKeys.expenses,
    queryFn: () => delay(clone(expensesStore), 90),
  });
}

/* -------------------------------------------------------------------------- */
/* Notifications                                                              */
/* -------------------------------------------------------------------------- */

export function useNotifications() {
  return useQuery({
    queryKey: serviceKeys.notifications,
    queryFn: () => delay(clone(notificationsStore), 90),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await delay(null, 60);
      notificationsStore = notificationsStore.map((n) => ({
        ...n,
        unread: false,
      }));
      return notificationsStore;
    },
    onSuccess: (updated) => {
      qc.setQueryData(serviceKeys.notifications, updated);
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Engineers                                                                  */
/* -------------------------------------------------------------------------- */

export function useEngineers() {
  return useQuery({
    queryKey: serviceKeys.engineers,
    queryFn: () => delay(clone(engineersStore), 90),
  });
}

export function useEngineer(id: string | undefined) {
  return useQuery({
    queryKey: serviceKeys.engineer(id ?? ""),
    queryFn: () =>
      delay(engineersStore.find((e) => e.id === id) ?? null, 70),
    enabled: !!id,
  });
}

/**
 * Payload accepted by {@link useCreateEngineer}. Required identity fields
 * must be supplied — everything else (skills, rating, experience, hue) is
 * defaulted server-side.
 */
export type CreateEngineerInput = {
  name: string;
  title: string;
  email: string;
  phone: string;
  skills?: string[];
  experienceYears?: number;
  rating?: number;
  hue?: number;
};

/**
 * Persist a new engineer to the in-memory roster store and refresh the
 * engineers query. The record sorts to the top because it has the highest
 * `id` and no MTD jobs yet — visible immediately on `/dashboard/engineers`.
 */
export function useCreateEngineer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateEngineerInput) => {
      await delay(null, 180);
      const id = `u_eng_${Math.random().toString(36).slice(2, 8)}`;
      const next: AppUser = {
        id,
        role: "engineer",
        name: input.name,
        email: input.email,
        phone: input.phone,
        title: input.title,
        skills: input.skills ?? [],
        rating: input.rating ?? 0,
        experienceYears: input.experienceYears ?? 0,
        hue: input.hue ?? Math.round(Math.random() * 360),
      };
      engineersStore = [next, ...engineersStore];
      return next;
    },
    onSuccess: (created) => {
      qc.setQueryData<AppUser[]>(serviceKeys.engineers, (prev) =>
        prev ? [created, ...prev] : [created],
      );
      qc.setQueryData(serviceKeys.engineer(created.id), created);
      qc.invalidateQueries({ queryKey: serviceKeys.engineers });
    },
  });
}
