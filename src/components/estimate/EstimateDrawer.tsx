/**
 * BuildCalc Pro Master Bid Cart (slide-over drawer).
 *
 * Localized UI shell: every label comes from the locale dictionary.
 * The drawer slides from the inline-end side (right in LTR, left in RTL)
 * so the animation respects document flow.
 *
 * Aggregates estimate lines from every calculator on the site with live
 * pricing: Direct Cost → Markup → Contingency → Tax → Total Bid.
 * Includes bid settings, client/company capture, and JSON export/import.
 */
"use client";

import * as React from "react";
import Link from "next/link";
import {
  Trash2,
  Minus,
  Plus,
  ShoppingCart,
  HardHat,
  Download,
  Upload,
  Eraser,
  ReceiptText,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatMoney, formatNumber } from "@/lib/utils";
import {
  useEstimateStore,
  useBidSummary,
} from "@/store/useEstimateStore";
import { useUiStore } from "@/store/useUiStore";
import { downloadJsonFile, readJsonFile, estimateFilename } from "@/lib/export";
import type { EstimateLineItem } from "@/types/estimator";
import { toolIcon } from "@/lib/tool-icons";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslation } from "@/i18n/I18nProvider";
import { isRtlLocale, localePath } from "@/i18n/config";

const CATEGORY_ICON = {
  concrete: "Layers",
  "framing-roofing": "House",
  finishes: "Paintbrush",
  "site-exterior": "Shovel",
  mep: "Zap",
  "financial-business": "Percent",
  utilities: "Sigma",
} as const;

/* ------------------------------------------------------------------ */
/*  Small building blocks                                              */
/* ------------------------------------------------------------------ */

function PercentStepper({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const { t } = useTranslation();
  const step = (dir: 1 | -1) =>
    onChange(Math.min(100, Math.max(0, Math.round((value + dir) * 10) / 10)));
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-zinc-950 px-3 py-2">
      <span className="text-xs font-semibold text-zinc-400">{label}</span>
      <div className="flex items-center gap-1" dir="ltr">
        <button
          type="button"
          onClick={() => step(-1)}
          className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
          aria-label={`${t.common.decreaseQty}: ${label}`}
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-14 text-center font-mono text-sm font-bold tabular-nums">
          {formatNumber(value, 1)}%
        </span>
        <button
          type="button"
          onClick={() => step(1)}
          className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
          aria-label={`${t.common.increaseQty}: ${label}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function LineItemRow({ item }: { item: EstimateLineItem }) {
  const { t } = useTranslation();
  const updateItem = useEstimateStore((s) => s.updateItem);
  const removeItem = useEstimateStore((s) => s.removeItem);
  const Icon = toolIcon(CATEGORY_ICON[item.category]);

  const nudgeQty = (dir: 1 | -1) => {
    const next = Math.max(0, Math.round((item.quantity + dir) * 100) / 100);
    updateItem(item.id, { quantity: next });
  };

  return (
    <div className="rounded-lg border border-border bg-zinc-950/60 p-3">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-zinc-900 border border-border">
          <Icon className="h-4 w-4 text-primary" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{item.title}</p>
          <p className="text-xs text-zinc-500">
            {t.categories[item.category].title}
            {item.wastePercent > 0 && (
              <span className="ms-1.5 rounded bg-accent/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-accent">
                +{item.wastePercent}%
              </span>
            )}
          </p>
          {item.notes && (
            <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{item.notes}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            removeItem(item.id);
            toast.info(t.common.lineRemoved, { description: item.title });
          }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-zinc-500 hover:bg-red-950 hover:text-red-400"
          aria-label={`Remove ${item.title}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 rounded-md border border-border bg-zinc-900 px-1 py-1" dir="ltr">
          <button
            type="button"
            onClick={() => nudgeQty(-1)}
            className="flex h-7 w-7 items-center justify-center rounded text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
            aria-label={t.common.decreaseQty}
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="min-w-16 text-center font-mono text-sm font-bold tabular-nums">
            {formatNumber(item.quantity)}
            <span className="ms-1 text-[10px] font-semibold text-zinc-500">
              {item.unit}
            </span>
          </span>
          <button
            type="button"
            onClick={() => nudgeQty(1)}
            className="flex h-7 w-7 items-center justify-center rounded text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
            aria-label={t.common.increaseQty}
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="text-end">
          <p className="font-mono text-sm font-bold tabular-nums" dir="ltr">
            {formatMoney(item.totalCost)}
          </p>
          <p className="font-mono text-[11px] text-zinc-500 tabular-nums" dir="ltr">
            {formatMoney(item.unitCost)}/{item.unit}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Drawer                                                             */
/* ------------------------------------------------------------------ */

export function EstimateDrawer() {
  const { locale, t } = useTranslation();
  const rtl = isRtlLocale(locale);
  const open = useUiStore((s) => s.estimateDrawerOpen);
  const setOpen = useUiStore((s) => s.setEstimateDrawerOpen);

  const items = useEstimateStore((s) => s.items);
  const markupPercent = useEstimateStore((s) => s.markupPercent);
  const contingencyPercent = useEstimateStore((s) => s.contingencyPercent);
  const taxPercent = useEstimateStore((s) => s.taxPercent);
  const setMarkup = useEstimateStore((s) => s.setMarkup);
  const setContingency = useEstimateStore((s) => s.setContingency);
  const setTax = useEstimateStore((s) => s.setTax);
  const clearEstimate = useEstimateStore((s) => s.clearEstimate);
  const exportEstimate = useEstimateStore((s) => s.exportEstimate);
  const importEstimate = useEstimateStore((s) => s.importEstimate);
  const client = useEstimateStore((s) => s.client);
  const company = useEstimateStore((s) => s.company);
  const updateClientInfo = useEstimateStore((s) => s.updateClientInfo);
  const updateCompanyInfo = useEstimateStore((s) => s.updateCompanyInfo);

  const summary = useBidSummary();
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [confirmClear, setConfirmClear] = React.useState(false);

  React.useEffect(() => {
    if (!confirmClear) return;
    const timer = setTimeout(() => setConfirmClear(false), 3000);
    return () => clearTimeout(timer);
  }, [confirmClear]);

  const handleExport = () => {
    try {
      downloadJsonFile(estimateFilename(), exportEstimate());
      toast.success(t.proposal.exported, {
        description: t.proposal.exportedDesc,
      });
    } catch {
      toast.error(t.proposal.exportFailed, {
        description: t.proposal.exportFailedDesc,
      });
    }
  };

  const handleImportFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const text = await readJsonFile(file);
      const result = importEstimate(text);
      if (result.ok) {
        toast.success(t.proposal.restored);
      } else {
        toast.error(t.proposal.importRejected, { description: result.error });
      }
    } catch (err) {
      toast.error(t.proposal.importFailed, {
        description: err instanceof Error ? err.message : "Unreadable file.",
      });
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side={rtl ? "left" : "right"} className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border p-5 pb-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            {t.proposal.drawerTitle}
            {items.length > 0 && (
              <Badge variant="accent" className="ms-1 font-mono">
                {items.length}
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            {t.proposal.drawerDescription}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 border border-border">
              <HardHat className="h-8 w-8 text-zinc-600" />
            </span>
            <div>
              <p className="font-display text-lg font-bold uppercase tracking-wide">
                {t.proposal.empty}
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                {t.proposal.emptyHint}
              </p>
            </div>
            <Button variant="default" onClick={() => setOpen(false)} asChild>
              <Link href={localePath("/tools", locale)}>{t.common.browseCalculators}</Link>
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1">
              <div className="space-y-3 p-5">
                {items.map((item) => (
                  <LineItemRow key={item.id} item={item} />
                ))}

                <Accordion type="single" collapsible className="rounded-lg border border-border bg-zinc-950/60 px-4">
                  <AccordionItem value="bid-settings" className="border-0">
                    <AccordionTrigger className="py-3 text-xs font-bold uppercase tracking-widest text-zinc-400">
                      {t.proposal.bidSettings}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pb-2">
                        <PercentStepper label={t.proposal.markup} value={markupPercent} onChange={setMarkup} />
                        <PercentStepper label={t.proposal.contingency} value={contingencyPercent} onChange={setContingency} />
                        <PercentStepper label={t.proposal.salesTax} value={taxPercent} onChange={setTax} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="client" className="border-t border-border">
                    <AccordionTrigger className="py-3 text-xs font-bold uppercase tracking-widest text-zinc-400">
                      {t.proposal.clientCompany}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid gap-3 pb-2">
                        <div>
                          <Label htmlFor="drawer-client-name">{t.proposal.clientName}</Label>
                          <Input
                            id="drawer-client-name"
                            className="mt-1.5 h-10"
                            placeholder={t.proposal.clientNamePlaceholder}
                            value={client.name}
                            onChange={(e) => updateClientInfo({ name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="drawer-project">{t.proposal.project}</Label>
                          <Input
                            id="drawer-project"
                            className="mt-1.5 h-10"
                            placeholder={t.proposal.projectPlaceholder}
                            value={client.projectName ?? ""}
                            onChange={(e) => updateClientInfo({ projectName: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="drawer-company">{t.proposal.yourCompany}</Label>
                          <Input
                            id="drawer-company"
                            className="mt-1.5 h-10"
                            placeholder={t.proposal.companyPlaceholder}
                            value={company.name}
                            onChange={(e) => updateCompanyInfo({ name: e.target.value })}
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </ScrollArea>

            {/* Live bid summary */}
            <div className="border-t border-border bg-zinc-950 p-5">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-zinc-400">
                  <span>{t.proposal.directCost} ({t.proposal.lines.replace("{count}", String(summary.lineCount))})</span>
                  <span className="font-mono tabular-nums" dir="ltr">{formatMoney(summary.directCost)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>{t.proposal.markup} ({formatNumber(markupPercent, 1)}%)</span>
                  <span className="font-mono tabular-nums" dir="ltr">{formatMoney(summary.markupAmount)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>{t.proposal.contingency} ({formatNumber(contingencyPercent, 1)}%)</span>
                  <span className="font-mono tabular-nums" dir="ltr">{formatMoney(summary.contingencyAmount)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>{t.proposal.tax} ({formatNumber(taxPercent, 1)}%)</span>
                  <span className="font-mono tabular-nums" dir="ltr">{formatMoney(summary.taxAmount)}</span>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="flex items-baseline justify-between">
                <span className="flex items-center gap-1.5 font-display text-sm font-bold uppercase tracking-widest text-zinc-300">
                  <ReceiptText className="h-4 w-4 text-accent" />
                  {t.proposal.totalBid}
                </span>
                <span className="font-mono text-3xl font-extrabold text-accent tabular-nums" dir="ltr">
                  {formatMoney(summary.totalBid)}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4" />
                  {t.proposal.export}
                </Button>
                <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                  <Upload className="h-4 w-4" />
                  {t.proposal.import}
                </Button>
                <Button
                  variant={confirmClear ? "destructive" : "ghost"}
                  size="sm"
                  onClick={() => {
                    if (confirmClear) {
                      clearEstimate();
                      setConfirmClear(false);
                      toast.info(t.proposal.cleared);
                    } else {
                      setConfirmClear(true);
                    }
                  }}
                  className={cn(!confirmClear && "text-zinc-500 hover:text-red-400")}
                >
                  <Eraser className="h-4 w-4" />
                  {confirmClear ? t.proposal.confirmClearHint : t.proposal.clear}
                </Button>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => handleImportFile(e.target.files?.[0])}
                aria-label="Import estimate JSON file"
              />
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
