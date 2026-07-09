"use client";

import { useEffect, useMemo, useState } from "react";
import { Mail, Shield, UserRound } from "lucide-react";

import { FormField, FormSection } from "@/components/common/FormSection";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTenants } from "@/features/platform/hooks";
import { usePlatformStore } from "@/features/platform/store";
import {
  ROLE_META,
  TENANT_ROLES,
  type AppUser,
  type ID,
  type UserRole,
} from "@/features/service/types";

/**
 * Cross-tenant "invite user" dialog used from both `/admin/users` and the
 * tenant detail page. When `defaultTenantId` is supplied (from a tenant
 * detail page) the tenant field is preselected but still editable.
 */
interface NewUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTenantId?: ID;
  onCreated?: (user: AppUser) => void;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  title: string;
  role: Exclude<UserRole, "superadmin">;
  tenantId: ID;
}

const DEFAULT_ROLE: Exclude<UserRole, "superadmin"> = "admin_staff";

export function NewUserDialog({
  open,
  onOpenChange,
  defaultTenantId,
  onCreated,
}: NewUserDialogProps) {
  const tenants = useTenants();
  const createUser = usePlatformStore((s) => s.createUser);

  const initialTenantId = useMemo(
    () => defaultTenantId ?? tenants[0]?.id ?? "",
    [defaultTenantId, tenants],
  );

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    title: "",
    role: DEFAULT_ROLE,
    tenantId: initialTenantId,
  });
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        name: "",
        email: "",
        phone: "",
        title: "",
        role: DEFAULT_ROLE,
        tenantId: initialTenantId,
      });
      setPending(false);
    }
  }, [open, initialTenantId]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const requiredOk =
    form.name.trim().length > 0 &&
    /.+@.+\..+/.test(form.email.trim()) &&
    form.tenantId.length > 0;

  const submit = () => {
    if (!requiredOk || pending) return;
    setPending(true);
    const created = createUser({
      tenantId: form.tenantId,
      name: form.name,
      email: form.email,
      phone: form.phone,
      title: form.title,
      role: form.role,
    });
    onCreated?.(created);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Invite user</DialogTitle>
          <DialogDescription>
            Add a member to any tenant on the platform. This mock demo doesn&apos;t
            actually send an invite email — the user is created directly and
            can sign in immediately.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="-mx-1.5 grid max-h-[70vh] gap-5 overflow-y-auto px-1.5"
        >
          <FormSection
            icon={<UserRound className="h-3.5 w-3.5" />}
            title="Identity"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Full name *">
                <Input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Jane Doe"
                  required
                />
              </FormField>
              <FormField label="Job title">
                <Input
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="Operations Manager"
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection
            icon={<Mail className="h-3.5 w-3.5" />}
            title="Contact"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Work email *">
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="jane@acmehvac.com"
                  required
                />
              </FormField>
              <FormField label="Phone">
                <Input
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="+1 415-555-0100"
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection
            icon={<Shield className="h-3.5 w-3.5" />}
            title="Access"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Tenant *">
                <Select
                  value={form.tenantId}
                  onValueChange={(v) => update("tenantId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Role *">
                <Select
                  value={form.role}
                  onValueChange={(v) =>
                    update("role", v as FormState["role"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TENANT_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {ROLE_META[r].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </FormSection>
        </form>

        <DialogFooter className="mt-1 flex items-center justify-between gap-2 sm:justify-between">
          <p className="text-[11px] text-muted-foreground">
            Fields marked * are required.
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-8 px-3 text-xs"
              disabled={!requiredOk || pending}
              onClick={submit}
            >
              {pending ? "Inviting…" : "Invite user"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
