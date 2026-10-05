/**
 * BuildCalc Pro — Master Bid Proposal & PDF Export Engine (Batch 4G).
 *
 * Aggregates every line dispatched by the 30 calculators, adds branding,
 * client info, financial controls, and exports a client-ready PDF locally.
 */
"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Building2,
  UserRound,
  ListChecks,
  Calculator,
  FileDown,
  Printer,
  Save,
  Upload,
  Trash2,
  Plus,
  X,
  ImagePlus,
} from "lucide-react";
import { useToolAutoSave } from "@/hooks/useToolAutoSave";
import {
  useEstimateStore,
  useBidSummary,
} from "@/store/useEstimateStore";
import { CATEGORIES } from "@/data/toolsRegistry";
import { formatNumber, formatMoney } from "@/lib/utils";
import { downloadJsonFile } from "@/lib/export";
import { PresetStepper } from "@/components/calculator/inputs/PresetStepper";
import { TradeFilterTabs } from "@/components/category/TradeFilterTabs";
import { useToolActions } from "@/components/tools/useToolActions";
import {
  generateProposalPdf,
  DEFAULT_TERMS,
  type ProposalDoc,
} from "@/lib/proposalPdf";
import type { EstimateLineItem } from "@/types/estimator";

const SLUG = "master-proposal-builder";
const SETTINGS_KEY = "master-proposal-settings";

interface ProposalSettings extends Record<string, unknown> {
  priceMode: "markup" | "margin";
  proposalDate: string;
  validUntil: string;
  scopeSummary: string;
  depositPct: number;
  roughInPct: number;
  termsText: string;
}

const SETTINGS_DEFAULTS: ProposalSettings = {
  priceMode: "markup",
  proposalDate: "",
  validUntil: "",
  scopeSummary: "",
  depositPct: 30,
  roughInPct: 40,
  termsText: DEFAULT_TERMS.join("\n"),
};

const CAT_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.label]),
);

const marginFromMarkup = (mk: number) =>
  Math.round(((mk / (100 + mk)) * 100) * 100) / 100;
const markupFromMargin = (mg: number) =>
  mg >= 100 ? 999 : Math.round(((mg / (100 - mg)) * 100) * 100) / 100;

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-zinc-500">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "min-h-[48px] w-full rounded-xl border border-border bg-zinc-900 px-3 text-sm font-semibold text-zinc-100 placeholder:text-zinc-600 focus:border-primary focus:outline-none";

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-zinc-950/60 p-4 sm:p-5">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-zinc-300">
        <span className="text-primary">{icon}</span> {title}
      </h2>
      {children}
    </section>
  );
}

export function MasterProposalBuilderTool() {
  const { values: ps, set: setPs, resetToDefaults } =
    useToolAutoSave<ProposalSettings>(SETTINGS_KEY, SETTINGS_DEFAULTS);

  const items = useEstimateStore((s) => s.items);
  const company = useEstimateStore((s) => s.company);
  const client = useEstimateStore((s) => s.client);
  const markupPercent = useEstimateStore((s) => s.markupPercent);
  const contingencyPercent = useEstimateStore((s) => s.contingencyPercent);
  const taxPercent = useEstimateStore((s) => s.taxPercent);
  const summary = useBidSummary();

  const [confirmClear, setConfirmClear] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const logoRef = React.useRef<HTMLInputElement>(null);

  /* Default dates on first mount only (avoids SSR hydration drift). */
  React.useEffect(() => {
    if (!ps.proposalDate) {
      const today = new Date().toISOString().slice(0, 10);
      const valid = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
      setPs("proposalDate", today);
      setPs("validUntil", valid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useToolActions({
    toolTitle: "Master Bid Proposal & PDF Export",
    resetInputs: resetToDefaults,
    saveDraft: () =>
      downloadJsonFile(
        `master-estimate-backup-${new Date().toISOString().slice(0, 10)}.json`,
        useEstimateStore.getState().exportEstimate(),
      ),
  });

  /* ---------------- financials ---------------- */
  const priceInputValue =
    ps.priceMode === "markup" ? markupPercent : marginFromMarkup(markupPercent);
  const onPriceInput = (n: number) => {
    if (ps.priceMode === "markup") {
      useEstimateStore.getState().setMarkup(n);
    } else {
      useEstimateStore.getState().setMarkup(markupFromMargin(n));
    }
  };
  const completionPct = Math.max(
    0,
    Math.round((100 - ps.depositPct - ps.roughInPct) * 100) / 100,
  );
  const fin = {
    directCost: summary.directCost,
    markupLabel:
      ps.priceMode === "markup"
        ? `Markup (${formatNumber(markupPercent)}%)`
        : `Margin (${formatNumber(priceInputValue)}%)`,
    markupAmount: summary.markupAmount,
    subtotal: summary.subtotal,
    contingencyPct: contingencyPercent,
    contingencyAmount: summary.contingencyAmount,
    taxPct: taxPercent,
    taxAmount: summary.taxAmount,
    total: summary.totalBid,
    depositPct: ps.depositPct,
    depositAmount: (summary.totalBid * ps.depositPct) / 100,
    roughInPct: ps.roughInPct,
    roughInAmount: (summary.totalBid * ps.roughInPct) / 100,
    completionPct,
    completionAmount: (summary.totalBid * completionPct) / 100,
  };

  /* ---------------- actions ---------------- */
  const handleLogo = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 1024 * 1024) {
      toast.error("Logo too large", {
        description: "Keep it under 1 MB so it stays fast on the jobsite.",
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      useEstimateStore
        .getState()
        .updateCompanyInfo({ logoBase64: String(reader.result) });
      toast.success("Logo saved", {
        description: "It will print on every proposal PDF.",
      });
    };
    reader.readAsDataURL(file);
  };

  const handlePdf = async () => {
    if (items.length === 0) {
      toast.error("No line items yet", {
        description: "Dispatch lines from any calculator first.",
      });
      return;
    }
    setGenerating(true);
    try {
      const st = useEstimateStore.getState();
      const doc: ProposalDoc = {
        company: st.company,
        client: st.client,
        proposalDate: ps.proposalDate || new Date().toISOString().slice(0, 10),
        validUntil: ps.validUntil,
        scopeSummary: ps.scopeSummary,
        items: st.items,
        categoryLabels: CAT_LABELS,
        financials: fin,
        terms: ps.termsText.split("\n").map((t) => t.trim()).filter(Boolean),
      };
      await generateProposalPdf(doc);
      toast.success("Proposal PDF downloaded");
    } catch (err) {
      toast.error("PDF generation failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleImport = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const res = useEstimateStore
        .getState()
        .importEstimate(String(reader.result));
      if (res.ok) toast.success("Bid restored from backup");
      else toast.error("Import failed", { description: res.error });
    };
    reader.readAsText(file);
  };

  const addCustomLine = () => {
    useEstimateStore.getState().addItem({
      toolSlug: SLUG,
      title: "Custom line item",
      category: "financial-business",
      quantity: 1,
      unit: "lots",
      unitCost: 0,
      wastePercent: 0,
    });
  };

  /* ---------------- line item editor ---------------- */
  const grouped = React.useMemo(() => {
    const m = new Map<string, EstimateLineItem[]>();
    for (const it of items) {
      const g = m.get(it.category) ?? [];
      g.push(it);
      m.set(it.category, g);
    }
    return [...m.entries()];
  }, [items]);

  const editor = (
    <Section icon={<ListChecks className="h-4 w-4" />} title={`Bill of materials — ${items.length} lines`}>
      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-zinc-500">
          No lines yet. Run any calculator and press “Add to Master Estimate” —
          lines land here ready to edit.
        </p>
      ) : (
        <div className="space-y-5">
          {grouped.map(([cat, lines]) => (
            <div key={cat}>
              <p className="mb-2 text-[11px] font-black uppercase tracking-widest text-primary">
                {CAT_LABELS[cat] ?? cat}
              </p>
              <div className="space-y-2">
                {lines.map((it) => (
                  <LineRow key={it.id} item={it} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={addCustomLine}
        className="mt-4 flex min-h-[44px] items-center gap-2 rounded-xl border border-dashed border-border px-4 text-sm font-bold text-zinc-300 transition hover:border-primary hover:text-primary"
      >
        <Plus className="h-4 w-4" /> Add custom line item
      </button>
    </Section>
  );

  /* ---------------- render ---------------- */
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Lines", value: String(items.length) },
          { label: "Direct cost", value: formatMoney(summary.directCost) },
          { label: "Contract value", value: formatMoney(summary.totalBid) },
        ].map((k) => (
          <div
            key={k.label}
            className="rounded-2xl border border-border bg-zinc-950/60 p-4 text-center"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              {k.label}
            </p>
            <p className="mt-1 truncate font-mono text-xl font-black text-primary">
              {k.value}
            </p>
          </div>
        ))}
      </div>

      {/* Company branding */}
      <Section icon={<Building2 className="h-4 w-4" />} title="Company branding (saved on this device)">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company name">
            <input
              className={inputCls}
              value={company.name}
              onChange={(e) =>
                useEstimateStore.getState().updateCompanyInfo({ name: e.target.value })
              }
              placeholder="Acme Construction LLC"
            />
          </Field>
          <Field label="License #">
            <input
              className={inputCls}
              value={company.license ?? ""}
              onChange={(e) =>
                useEstimateStore.getState().updateCompanyInfo({ license: e.target.value })
              }
              placeholder="CGC-123456"
            />
          </Field>
          <Field label="Phone">
            <input
              className={inputCls}
              value={company.phone ?? ""}
              onChange={(e) =>
                useEstimateStore.getState().updateCompanyInfo({ phone: e.target.value })
              }
              placeholder="(555) 123-4567"
            />
          </Field>
          <Field label="Email">
            <input
              className={inputCls}
              value={company.email ?? ""}
              onChange={(e) =>
                useEstimateStore.getState().updateCompanyInfo({ email: e.target.value })
              }
              placeholder="bids@acme.com"
            />
          </Field>
          <Field label="Address">
            <input
              className={inputCls}
              value={company.address ?? ""}
              onChange={(e) =>
                useEstimateStore.getState().updateCompanyInfo({ address: e.target.value })
              }
              placeholder="123 Jobsite Ave, Town ST"
            />
          </Field>
          <div>
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-zinc-500">
              Logo
            </span>
            <div className="flex items-center gap-3">
              {company.logoBase64 ? (
                <img
                  src={company.logoBase64}
                  alt="Company logo"
                  className="h-12 w-auto rounded-lg border border-border bg-white object-contain px-2"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-border text-zinc-600">
                  <ImagePlus className="h-5 w-5" />
                </div>
              )}
              <button
                type="button"
                onClick={() => logoRef.current?.click()}
                className="min-h-[44px] rounded-xl border border-border px-4 text-xs font-bold text-zinc-200"
              >
                Upload logo
              </button>
              {company.logoBase64 && (
                <button
                  type="button"
                  onClick={() =>
                    useEstimateStore.getState().updateCompanyInfo({ logoBase64: undefined })
                  }
                  className="min-h-[44px] rounded-xl border border-border px-3 text-xs font-bold text-zinc-500"
                >
                  Remove
                </button>
              )}
              <input
                ref={logoRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleLogo(e.target.files?.[0])}
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Client & project */}
      <Section icon={<UserRound className="h-4 w-4" />} title="Client & project">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Client name">
            <input
              className={inputCls}
              value={client.name}
              onChange={(e) =>
                useEstimateStore.getState().updateClientInfo({ name: e.target.value })
              }
              placeholder="Jane Homeowner"
            />
          </Field>
          <Field label="Project name">
            <input
              className={inputCls}
              value={client.projectName ?? ""}
              onChange={(e) =>
                useEstimateStore.getState().updateClientInfo({ projectName: e.target.value })
              }
              placeholder="Kitchen remodel"
            />
          </Field>
          <Field label="Client phone">
            <input
              className={inputCls}
              value={client.phone ?? ""}
              onChange={(e) =>
                useEstimateStore.getState().updateClientInfo({ phone: e.target.value })
              }
            />
          </Field>
          <Field label="Client email">
            <input
              className={inputCls}
              value={client.email ?? ""}
              onChange={(e) =>
                useEstimateStore.getState().updateClientInfo({ email: e.target.value })
              }
            />
          </Field>
          <Field label="Job address">
            <input
              className={inputCls}
              value={client.projectAddress ?? ""}
              onChange={(e) =>
                useEstimateStore.getState().updateClientInfo({ projectAddress: e.target.value })
              }
              placeholder="456 Client St, Town ST"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Proposal date">
              <input
                type="date"
                className={inputCls}
                value={ps.proposalDate}
                onChange={(e) => setPs("proposalDate", e.target.value)}
              />
            </Field>
            <Field label="Valid until">
              <input
                type="date"
                className={inputCls}
                value={ps.validUntil}
                onChange={(e) => setPs("validUntil", e.target.value)}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Project scope summary">
              <textarea
                className={`${inputCls} min-h-[90px] py-3`}
                value={ps.scopeSummary}
                onChange={(e) => setPs("scopeSummary", e.target.value)}
                placeholder="Briefly describe the work covered by this proposal…"
              />
            </Field>
          </div>
        </div>
      </Section>

      {editor}

      {/* Financial controls */}
      <Section icon={<Calculator className="h-4 w-4" />} title="Financial controls">
        <div className="mb-4">
          <TradeFilterTabs
            subtrades={["Markup %", "Gross margin %"]}
            active={ps.priceMode === "markup" ? "Markup %" : "Gross margin %"}
            onChange={(l) => setPs("priceMode", l.startsWith("Markup") ? "markup" : "margin")}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <PresetStepper
            id="pb-price"
            label={ps.priceMode === "markup" ? "Contractor markup" : "Gross margin"}
            value={Math.round(priceInputValue * 100) / 100}
            onChange={onPriceInput}
            unit="%"
            step={1}
            min={0}
            max={ps.priceMode === "markup" ? 200 : 90}
          />
          <PresetStepper
            id="pb-cont"
            label="Contingency / waste buffer"
            value={contingencyPercent}
            onChange={(n) => useEstimateStore.getState().setContingency(n)}
            unit="%"
            step={1}
            min={0}
            max={50}
          />
          <PresetStepper
            id="pb-tax"
            label="State / local tax rate"
            value={taxPercent}
            onChange={(n) => useEstimateStore.getState().setTax(n)}
            unit="%"
            step={0.25}
            min={0}
            max={30}
          />
        </div>

        <dl className="mt-4 space-y-1.5 rounded-xl bg-panel p-4 font-mono text-sm">
          <div className="flex justify-between text-zinc-400">
            <dt>Subtotal direct costs</dt>
            <dd>{formatMoney(summary.directCost)}</dd>
          </div>
          <div className="flex justify-between text-zinc-400">
            <dt>{fin.markupLabel}</dt>
            <dd>{formatMoney(summary.markupAmount)}</dd>
          </div>
          <div className="flex justify-between text-zinc-400">
            <dt>Contingency ({formatNumber(contingencyPercent)}%)</dt>
            <dd>{formatMoney(summary.contingencyAmount)}</dd>
          </div>
          <div className="flex justify-between text-zinc-400">
            <dt>Tax ({formatNumber(taxPercent)}%)</dt>
            <dd>{formatMoney(summary.taxAmount)}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-2 text-base font-black text-primary">
            <dt>Total contract value</dt>
            <dd>{formatMoney(summary.totalBid)}</dd>
          </div>
        </dl>

        <div className="mt-4">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
            Payment schedule
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <PresetStepper
              id="pb-dep"
              label="Deposit on acceptance"
              value={ps.depositPct}
              onChange={(n) => setPs("depositPct", n)}
              unit="%"
              step={5}
              min={0}
              max={100}
            />
            <PresetStepper
              id="pb-rough"
              label="Rough-in milestone"
              value={ps.roughInPct}
              onChange={(n) => setPs("roughInPct", n)}
              unit="%"
              step={5}
              min={0}
              max={100}
            />
            <div className="rounded-xl border border-border bg-zinc-900 p-3">
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                Completion ({formatNumber(completionPct)}%)
              </p>
              <p className="mt-1 font-mono text-lg font-black text-zinc-100">
                {formatMoney(fin.completionAmount)}
              </p>
              <p className="font-mono text-xs text-zinc-500">
                {formatMoney(fin.depositAmount)} + {formatMoney(fin.roughInAmount)} due earlier
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Terms */}
      <Section icon={<FileDown className="h-4 w-4" />} title="Terms & conditions">
        <Field label="One term per line — prints numbered on the PDF">
          <textarea
            className={`${inputCls} min-h-[160px] py-3 font-mono text-xs leading-relaxed`}
            value={ps.termsText}
            onChange={(e) => setPs("termsText", e.target.value)}
          />
        </Field>
      </Section>

      {/* Export actions */}
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={handlePdf}
          disabled={generating}
          className="flex min-h-[56px] items-center justify-center gap-2 rounded-2xl bg-primary text-base font-black text-primary-foreground transition active:scale-[0.98] disabled:opacity-50"
        >
          <FileDown className="h-5 w-5" />
          {generating ? "Building PDF…" : "Download proposal PDF"}
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex min-h-[56px] items-center justify-center gap-2 rounded-2xl border border-border bg-zinc-900 text-base font-bold text-zinc-100"
        >
          <Printer className="h-5 w-5" /> Print view
        </button>
        <button
          type="button"
          onClick={() =>
            downloadJsonFile(
              `master-estimate-backup-${new Date().toISOString().slice(0, 10)}.json`,
              useEstimateStore.getState().exportEstimate(),
            )
          }
          className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-border bg-zinc-900 text-sm font-bold text-zinc-100"
        >
          <Save className="h-4 w-4" /> Download JSON backup
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-border bg-zinc-900 text-sm font-bold text-zinc-100"
        >
          <Upload className="h-4 w-4" /> Restore from backup
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            handleImport(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => setConfirmClear(true)}
          className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-red-900/60 bg-red-950/30 text-sm font-bold text-red-300 sm:col-span-2"
        >
          <Trash2 className="h-4 w-4" /> Clear / new estimate
        </button>
      </div>

      {/* Clear confirmation modal */}
      {confirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-zinc-950 p-6">
            <h3 className="text-lg font-black text-zinc-100">Start a new estimate?</h3>
            <p className="mt-2 text-sm text-zinc-400">
              This clears all {items.length} line items{items.length === 1 ? "" : "s"}. Your
              company branding is kept. Download a JSON backup first if you need this bid later.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="min-h-[48px] rounded-xl border border-border text-sm font-bold text-zinc-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  useEstimateStore.getState().clearEstimate({ keepBranding: true });
                  setConfirmClear(false);
                  toast.success("Estimate cleared — ready for the next bid");
                }}
                className="min-h-[48px] rounded-xl bg-red-600 text-sm font-black text-white"
              >
                Clear all
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Editable line row                                                   */
/* ------------------------------------------------------------------ */

function LineRow({ item }: { item: EstimateLineItem }) {
  const updateItem = useEstimateStore((s) => s.updateItem);
  const removeItem = useEstimateStore((s) => s.removeItem);
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-xl border border-border bg-zinc-900/60 p-2.5 sm:grid-cols-[1fr_90px_70px_110px_90px_36px]">
      <input
        aria-label="Line item description"
        className="min-h-[44px] rounded-lg bg-transparent px-2 text-sm font-semibold text-zinc-100 focus:bg-zinc-900 focus:outline-none"
        value={item.title}
        onChange={(e) => updateItem(item.id, { title: e.target.value })}
      />
      <div className="hidden items-center gap-1 sm:flex">
        <input
          aria-label="Quantity"
          type="number"
          min={0}
          step="any"
          className="min-h-[44px] w-full rounded-lg border border-border bg-zinc-900 px-2 font-mono text-sm text-zinc-100"
          value={item.quantity}
          onChange={(e) => updateItem(item.id, { quantity: Math.max(0, Number(e.target.value) || 0) })}
        />
        <span className="shrink-0 text-[10px] uppercase text-zinc-500">{item.unit}</span>
      </div>
      <span className="hidden font-mono text-xs text-zinc-500 sm:block">
        {item.unit}
      </span>
      <input
        aria-label="Unit cost"
        type="number"
        min={0}
        step="any"
        className="hidden min-h-[44px] w-full rounded-lg border border-border bg-zinc-900 px-2 font-mono text-sm text-zinc-100 sm:block"
        value={item.unitCost}
        onChange={(e) => updateItem(item.id, { unitCost: Math.max(0, Number(e.target.value) || 0) })}
      />
      <span className="hidden text-right font-mono text-sm font-bold text-zinc-100 sm:block">
        {formatMoney(item.totalCost)}
      </span>
      <button
        type="button"
        aria-label={`Remove ${item.title}`}
        onClick={() => removeItem(item.id)}
        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-zinc-500 transition hover:bg-red-950/50 hover:text-red-300"
      >
        <X className="h-4 w-4" />
      </button>
      {/* mobile second row */}
      <div className="col-span-2 flex items-center gap-2 sm:hidden">
        <input
          aria-label="Quantity"
          type="number"
          min={0}
          step="any"
          className="min-h-[44px] w-20 rounded-lg border border-border bg-zinc-900 px-2 font-mono text-sm text-zinc-100"
          value={item.quantity}
          onChange={(e) => updateItem(item.id, { quantity: Math.max(0, Number(e.target.value) || 0) })}
        />
        <input
          aria-label="Unit cost"
          type="number"
          min={0}
          step="any"
          className="min-h-[44px] w-24 rounded-lg border border-border bg-zinc-900 px-2 font-mono text-sm text-zinc-100"
          value={item.unitCost}
          onChange={(e) => updateItem(item.id, { unitCost: Math.max(0, Number(e.target.value) || 0) })}
        />
        <span className="ml-auto font-mono text-sm font-bold text-zinc-100">
          {formatMoney(item.totalCost)}
        </span>
      </div>
    </div>
  );
}
