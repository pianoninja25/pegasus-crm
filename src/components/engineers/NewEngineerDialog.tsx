"use client";

import { useEffect, useState } from "react";
import { HardHat, Mail, Wrench } from "lucide-react";

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
import { useT } from "@/features/locale/hooks";
import {
  useCreateEngineer,
  type CreateEngineerInput,
} from "@/features/service/hooks";
import type { AppUser } from "@/features/service/types";
import { cn } from "@/lib/utils";

/**
 * Catalogue of skills surfaced in the create dialog. Mirrors the SKILLS
 * constant in `features/service/seed.ts` — kept duplicated here so the dialog
 * remains self-contained without leaking a seed-only export.
 */
const SKILL_CATALOGUE = [
  "Split AC",
  "VRF Systems",
  "Chiller",
  "Refrigerant Recovery",
  "Electrical",
  "Brazing",
  "Vacuum + Charging",
  "Ductwork",
  "Controls",
] as const;

interface NewEngineerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (engineer: AppUser) => void;
}

interface FormState {
  name: string;
  title: string;
  email: string;
  phone: string;
  experienceYears: string;
  skills: string[];
}

const EMPTY_FORM: FormState = {
  name: "",
  title: "",
  email: "",
  phone: "",
  experienceYears: "",
  skills: [],
};

export function NewEngineerDialog({
  open,
  onOpenChange,
  onCreated,
}: NewEngineerDialogProps) {
  const t = useT();
  const createEngineer = useCreateEngineer();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  useEffect(() => {
    if (open) setForm(EMPTY_FORM);
  }, [open]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleSkill = (skill: string) =>
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(skill)
        ? f.skills.filter((s) => s !== skill)
        : [...f.skills, skill],
    }));

  const requiredOk =
    form.name.trim().length > 0 &&
    form.title.trim().length > 0 &&
    form.email.trim().length > 0 &&
    form.phone.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requiredOk || createEngineer.isPending) return;

    const exp = Number.parseInt(form.experienceYears, 10);
    const payload: CreateEngineerInput = {
      name: form.name.trim(),
      title: form.title.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      experienceYears: Number.isFinite(exp) && exp >= 0 ? exp : 0,
      skills: form.skills,
    };

    const created = await createEngineer.mutateAsync(payload);
    onCreated?.(created);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("engineers.create.title")}</DialogTitle>
          <DialogDescription>
            {t("engineers.create.description")}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="-mx-1.5 grid max-h-[70vh] gap-5 overflow-y-auto px-1.5"
        >
          {/* ── Identity ─────────────────────────────────────────────── */}
          <FormSection
            icon={<HardHat className="h-3.5 w-3.5" />}
            title={t("engineers.create.sectionIdentity")}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label={`${t("engineers.create.name")} *`}>
                <Input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder={t("engineers.create.namePlaceholder")}
                  required
                />
              </FormField>
              <FormField label={`${t("engineers.create.titleField")} *`}>
                <Input
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder={t("engineers.create.titlePlaceholder")}
                  required
                />
              </FormField>
            </div>
          </FormSection>

          {/* ── Contact ──────────────────────────────────────────────── */}
          <FormSection
            icon={<Mail className="h-3.5 w-3.5" />}
            title={t("engineers.create.sectionContact")}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label={`${t("engineers.create.email")} *`}>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="engineer@pegasus.ac"
                  required
                />
              </FormField>
              <FormField label={`${t("engineers.create.phone")} *`}>
                <Input
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="+62…"
                  required
                />
              </FormField>
            </div>
          </FormSection>

          {/* ── Profile ──────────────────────────────────────────────── */}
          <FormSection
            icon={<Wrench className="h-3.5 w-3.5" />}
            title={t("engineers.create.sectionProfile")}
          >
            <div className="grid gap-3 sm:grid-cols-[200px_1fr]">
              <FormField label={t("engineers.create.experience")}>
                <Input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={form.experienceYears}
                  onChange={(e) =>
                    update(
                      "experienceYears",
                      e.target.value.replace(/[^0-9]/g, ""),
                    )
                  }
                  placeholder="0"
                />
              </FormField>
              <FormField
                label={t("engineers.create.skills")}
                hint={t("engineers.create.skillsHint")}
              >
                <SkillChips
                  selected={form.skills}
                  onToggle={toggleSkill}
                />
              </FormField>
            </div>
          </FormSection>
        </form>

        <DialogFooter className="mt-1 flex items-center justify-between gap-2 sm:justify-between">
          <p className="text-[11px] text-muted-foreground">
            {t("engineers.create.requiredHint")}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => onOpenChange(false)}
              disabled={createEngineer.isPending}
            >
              {t("engineers.create.cancel")}
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-8 px-3 text-xs"
              disabled={!requiredOk || createEngineer.isPending}
              onClick={handleSubmit}
            >
              {createEngineer.isPending
                ? t("engineers.create.submitting")
                : t("engineers.create.submit")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ───────────────────────── Sub-components ─────────────────────────────── */

function SkillChips({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (skill: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {SKILL_CATALOGUE.map((skill) => {
        const active = selected.includes(skill);
        return (
          <button
            key={skill}
            type="button"
            onClick={() => onToggle(skill)}
            className={cn(
              "inline-flex items-center rounded-md border px-2.5 py-1 text-xs transition-colors",
              active
                ? "border-primary/50 bg-primary/15 text-primary"
                : "border-border/60 bg-card/40 text-muted-foreground hover:text-foreground",
            )}
          >
            {skill}
          </button>
        );
      })}
    </div>
  );
}
