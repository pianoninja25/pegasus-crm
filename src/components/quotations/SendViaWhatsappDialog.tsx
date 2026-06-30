"use client";

import {
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  Info,
  Loader2,
  MessageCircle,
  Paperclip,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useT } from "@/features/locale/hooks";
import { cn } from "@/lib/utils";

/**
 * Local-storage flag that lets the user dismiss the explainer permanently
 * after they understand the 3-step flow. Scoped per-browser, no server hit.
 */
const SKIP_FLAG_KEY = "pegasus-ac/skip-whatsapp-helper";

interface SendViaWhatsappDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-filled WhatsApp message (already template-rendered). */
  messagePreview: string;
  /** Customer's display name — purely for the helper's UI. */
  customerName: string;
  /** Generates the PDF + opens wa.me. Awaitable so we can show progress. */
  onRun: () => Promise<void>;
}

/**
 * Mini-tutorial dialog that explains the realistic WhatsApp share flow
 * before running it. Solves the "I clicked send but the PDF didn't attach"
 * confusion by being explicit about each step upfront.
 *
 * Two-phase UI:
 *   1. Explainer       — shown before the action runs; user confirms
 *   2. Completion hint — shown after the PDF is downloaded + wa.me opened,
 *                        reminding them to attach the file in WhatsApp
 *
 * Power users can dismiss it permanently via "don't show again" — the next
 * click on "Send via WhatsApp" then skips straight to the action.
 */
export function SendViaWhatsappDialog({
  open,
  onOpenChange,
  messagePreview,
  customerName,
  onRun,
}: SendViaWhatsappDialogProps) {
  const t = useT();
  const [dontShow, setDontShow] = useState(false);
  const [phase, setPhase] = useState<"explain" | "running" | "done">(
    "explain",
  );

  useEffect(() => {
    if (open) {
      setPhase("explain");
      setDontShow(false);
    }
  }, [open]);

  const handleConfirm = async () => {
    if (dontShow && typeof window !== "undefined") {
      localStorage.setItem(SKIP_FLAG_KEY, "1");
    }
    setPhase("running");
    try {
      await onRun();
      setPhase("done");
    } catch {
      setPhase("explain");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 p-0">
        <DialogHeader className="space-y-1.5 border-b border-border/60 px-5 py-4">
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <MessageCircle className="h-4 w-4" />
            </span>
            {t("quotations.detail.waDialog.title")}
          </DialogTitle>
          {phase === "explain" && (
            <DialogDescription className="pl-9 text-[11px] leading-relaxed">
              {t("quotations.detail.waDialog.lead")}
            </DialogDescription>
          )}
        </DialogHeader>

        {phase !== "done" ? (
          <div className="space-y-4 px-5 py-4">
            <Step
              index={1}
              icon={<Download className="h-3.5 w-3.5" />}
              title={t("quotations.detail.waDialog.step1Title")}
              body={t("quotations.detail.waDialog.step1Body")}
              active={phase === "running"}
            />
            <Step
              index={2}
              icon={<ExternalLink className="h-3.5 w-3.5" />}
              title={t("quotations.detail.waDialog.step2Title")}
              body={t("quotations.detail.waDialog.step2Body")}
              active={phase === "running"}
            />
            <Step
              index={3}
              icon={<Paperclip className="h-3.5 w-3.5" />}
              title={t("quotations.detail.waDialog.step3Title")}
              body={t("quotations.detail.waDialog.step3Body")}
              highlight
            />

            <p className="flex items-start gap-1.5 rounded-md border border-border/40 bg-muted/30 p-2 text-[10px] leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 h-3 w-3 shrink-0" />
              <span>{t("quotations.detail.waDialog.attachReason")}</span>
            </p>

            <details className="group rounded-md border border-border/40 bg-card/40 text-[11px]">
              <summary className="flex cursor-pointer list-none items-center gap-1.5 px-2.5 py-1.5 text-muted-foreground transition-colors hover:text-foreground">
                <FileText className="h-3 w-3" />
                {t("quotations.detail.waDialog.preview")} ({customerName})
              </summary>
              <pre className="max-h-32 overflow-y-auto whitespace-pre-wrap break-words border-t border-border/40 bg-background/40 px-2.5 py-2 font-mono text-[10px] text-muted-foreground">
                {messagePreview}
              </pre>
            </details>
          </div>
        ) : (
          /* ── Done phase ─────────────────────────────────────────── */
          <div className="space-y-4 px-5 py-4">
            <div className="flex items-start gap-3 rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-xs font-semibold text-foreground">
                  {t("quotations.detail.waDialog.pdfReady")}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {t("quotations.detail.waDialog.pdfReadyHint")}
                </p>
              </div>
            </div>
            <ol className="space-y-2 rounded-md border border-border/40 bg-muted/20 p-3 text-[11px] text-muted-foreground">
              <li className="flex items-start gap-2">
                <Paperclip className="mt-0.5 h-3 w-3 shrink-0" />
                <span>{t("quotations.detail.waDialog.step3Body")}</span>
              </li>
            </ol>
          </div>
        )}

        <DialogFooter className="flex-row items-center justify-between gap-2 border-t border-border/60 px-5 py-3 sm:justify-between">
          {phase === "explain" ? (
            <>
              <label className="flex cursor-pointer items-center gap-2 text-[11px] text-muted-foreground">
                <Checkbox
                  checked={dontShow}
                  onCheckedChange={(checked) =>
                    setDontShow(checked === true)
                  }
                  className="h-3.5 w-3.5"
                />
                {t("quotations.detail.waDialog.dontShowAgain")}
              </label>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-xs"
                  onClick={() => onOpenChange(false)}
                >
                  {t("quotations.detail.waDialog.cancel")}
                </Button>
                <Button
                  size="sm"
                  className="h-8 gap-1.5 bg-emerald-600 px-3 text-xs hover:bg-emerald-600/90 dark:bg-emerald-500 dark:hover:bg-emerald-500/90"
                  onClick={handleConfirm}
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  {t("quotations.detail.waDialog.confirm")}
                </Button>
              </div>
            </>
          ) : phase === "running" ? (
            <Button
              size="sm"
              className="ml-auto h-8 gap-1.5 px-3 text-xs"
              disabled
            >
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {t("quotations.detail.waDialog.confirm")}
            </Button>
          ) : (
            <Button
              size="sm"
              className="ml-auto h-8 gap-1.5 px-3 text-xs"
              onClick={() => onOpenChange(false)}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {t("quotations.detail.shareWaSent")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Has the user opted out of the WhatsApp helper dialog? */
export function shouldSkipWhatsappHelper(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(SKIP_FLAG_KEY) === "1";
}

/* ───────────────────────── Sub-components ────────────────────────── */

function Step({
  index,
  icon,
  title,
  body,
  highlight,
  active,
}: {
  index: number;
  icon: React.ReactNode;
  title: string;
  body: string;
  /** Renders the step in the brand-emerald style to draw attention. */
  highlight?: boolean;
  /** Adds a subtle pulse while the operation is in flight. */
  active?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="relative">
        <span
          className={cn(
            "inline-flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-semibold",
            highlight
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border-border/60 bg-card text-muted-foreground",
          )}
        >
          {index}
        </span>
        {active && (
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/30" />
        )}
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
          {icon}
          {title}
        </div>
        <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
          {body}
        </p>
      </div>
    </div>
  );
}
