/**
 * BuildCalc Pro Client-side proposal PDF generator (Batch 4G).
 *
 * Everything runs in the browser via jspdf + jspdf-autotable. This module
 * is dynamically imported from a click handler so it never touches SSR.
 */
import type { CompanyInfo, ClientInfo, EstimateLineItem } from "@/types/estimator";

export interface ProposalFinancials {
  directCost: number;
  markupLabel: string;
  markupAmount: number;
  subtotal: number;
  contingencyPct: number;
  contingencyAmount: number;
  taxPct: number;
  taxAmount: number;
  total: number;
  depositPct: number;
  depositAmount: number;
  roughInPct: number;
  roughInAmount: number;
  completionPct: number;
  completionAmount: number;
}

export interface ProposalDoc {
  company: CompanyInfo;
  client: ClientInfo;
  proposalDate: string;
  validUntil: string;
  scopeSummary: string;
  items: EstimateLineItem[];
  categoryLabels: Record<string, string>;
  financials: ProposalFinancials;
  terms: string[];
}

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export async function generateProposalPdf(doc: ProposalDoc): Promise<void> {
  const { default: JsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const pdf = new JsPDF({ unit: "pt", format: "letter" });
  const W = 612;
  const M = 48; // margin
  let y = M;

  const need = (h: number) => {
    if (y + h > 792 - M) {
      pdf.addPage();
      y = M;
    }
  };

  /* ---------------- Header ---------------- */
  const c = doc.company;
  let headerBottom = y;
  if (c.logoBase64) {
    try {
      // Detect JPEG from magic bytes; everything else goes through as PNG.
      const isJpeg =
        c.logoBase64.startsWith("/9j/") ||
        c.logoBase64.startsWith("data:image/jpeg");
      pdf.addImage(
        c.logoBase64,
        isJpeg ? "JPEG" : "PNG",
        M,
        y,
        90,
        45,
        undefined,
        "FAST",
      );
    } catch {
      /* logo format unsupported text header only */
    }
  }
  const textX = c.logoBase64 ? M + 102 : M;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.setTextColor(20, 20, 25);
  pdf.text(c.name || "Contractor Proposal", textX, y + 16);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 110);
  const contact = [
    [c.phone, c.email].filter(Boolean).join("  ·  "),
    c.license ? `License #${c.license}` : "",
    c.address ?? "",
  ].filter(Boolean);
  contact.forEach((line, i) => pdf.text(line, textX, y + 32 + i * 12));
  headerBottom = Math.max(y + 45, y + 24 + contact.length * 12);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(24);
  pdf.setTextColor(20, 20, 25);
  pdf.text("PROPOSAL", W - M, y + 20, { align: "right" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 110);
  const propNo = `P-${doc.proposalDate.replaceAll("-", "").slice(2)}`;
  pdf.text(`No. ${propNo}`, W - M, y + 36, { align: "right" });
  pdf.text(`Date: ${doc.proposalDate}`, W - M, y + 50, { align: "right" });
  if (doc.validUntil) {
    pdf.text(`Valid until: ${doc.validUntil}`, W - M, y + 64, { align: "right" });
  }

  y = headerBottom + 18;
  pdf.setDrawColor(200, 200, 205);
  pdf.line(M, y, W - M, y);
  y += 18;

  /* ---------------- Client / project ---------------- */
  need(70);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(20, 20, 25);
  pdf.text("PREPARED FOR", M, y);
  pdf.text("PROJECT", W / 2, y);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  const cl = doc.client;
  const clientLines = [
    cl.name || "—",
    cl.company ?? "",
    cl.address ?? "",
    [cl.phone, cl.email].filter(Boolean).join("  ·  "),
  ].filter(Boolean);
  const projectLines = [
    cl.projectName || "—",
    cl.projectAddress ?? "",
  ].filter(Boolean);
  clientLines.forEach((l, i) => pdf.text(l, M, y + 16 + i * 14));
  projectLines.forEach((l, i) => pdf.text(l, W / 2, y + 16 + i * 14));
  y += 16 + Math.max(clientLines.length, projectLines.length) * 14 + 10;

  if (doc.scopeSummary.trim()) {
    need(60);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text("SCOPE SUMMARY", M, y);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9.5);
    pdf.setTextColor(50, 50, 55);
    const wrapped = pdf.splitTextToSize(doc.scopeSummary, W - 2 * M);
    need(wrapped.length * 13 + 10);
    pdf.text(wrapped, M, y + 16);
    y += 16 + wrapped.length * 13 + 12;
    pdf.setTextColor(20, 20, 25);
  }

  /* ---------------- Line items table ---------------- */
  const grouped = new Map<string, EstimateLineItem[]>();
  for (const item of doc.items) {
    const g = grouped.get(item.category) ?? [];
    g.push(item);
    grouped.set(item.category, g);
  }

  const body: (string | number)[][] = [];
  let n = 0;
  for (const [cat, items] of grouped) {
    body.push([
      { content: (doc.categoryLabels[cat] ?? cat).toUpperCase(), colSpan: 6, styles: { fontStyle: "bold", fillColor: [242, 242, 245], textColor: [60, 60, 70], fontSize: 8 } } as unknown as string,
      "", "", "", "", "",
    ]);
    for (const it of items) {
      n += 1;
      body.push([
        n,
        it.title + (it.notes ? `\n${it.notes}` : ""),
        it.quantity.toLocaleString("en-US", { maximumFractionDigits: 2 }),
        it.unit,
        money(it.unitCost),
        money(it.totalCost),
      ]);
    }
  }

  autoTable(pdf, {
    startY: y,
    margin: { left: M, right: M },
    head: [["#", "Description", "Qty", "Unit", "Unit price", "Amount"]],
    body,
    theme: "grid",
    styles: { font: "helvetica", fontSize: 9, cellPadding: 6, textColor: [30, 30, 35] },
    headStyles: { fillColor: [24, 24, 28], textColor: 255, fontStyle: "bold", fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 28, halign: "center" },
      2: { cellWidth: 52, halign: "right" },
      3: { cellWidth: 52 },
      4: { cellWidth: 70, halign: "right" },
      5: { cellWidth: 78, halign: "right", fontStyle: "bold" },
    },
  });
  y = (pdf as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20;

  /* ---------------- Financials ---------------- */
  const f = doc.financials;
  const rows: [string, string][] = [
    ["Direct costs", money(f.directCost)],
    [f.markupLabel, money(f.markupAmount)],
    ["Subtotal", money(f.subtotal)],
    [`Contingency (${f.contingencyPct}%)`, money(f.contingencyAmount)],
    [`Tax (${f.taxPct}%)`, money(f.taxAmount)],
  ];
  need(rows.length * 20 + 90);
  autoTable(pdf, {
    startY: y,
    margin: { left: W / 2 - 20, right: M },
    body: rows.map(([a, b]) => [a, b]),
    theme: "plain",
    styles: { font: "helvetica", fontSize: 10, cellPadding: 4 },
    columnStyles: { 0: { halign: "left" }, 1: { halign: "right" } },
  });
  y = (pdf as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.text("TOTAL CONTRACT VALUE", W / 2 - 20, y + 10);
  pdf.text(money(f.total), W - M, y + 10, { align: "right" });
  y += 30;

  /* ---------------- Payment schedule ---------------- */
  need(70);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text("PAYMENT SCHEDULE", M, y);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9.5);
  const sched: [string, string][] = [
    [`Deposit (${f.depositPct}%) due on acceptance`, money(f.depositAmount)],
    [`Rough-in (${f.roughInPct}%)`, money(f.roughInAmount)],
    [`Completion (${f.completionPct}%)`, money(f.completionAmount)],
  ];
  sched.forEach(([label, amt], i) => {
    pdf.text(`• ${label}`, M + 8, y + 18 + i * 15);
    pdf.text(amt, W - M, y + 18 + i * 15, { align: "right" });
  });
  y += 18 + sched.length * 15 + 16;

  /* ---------------- Terms ---------------- */
  need(60);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text("TERMS & CONDITIONS", M, y);
  y += 16;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(60, 60, 65);
  doc.terms.forEach((term, i) => {
    const wrapped = pdf.splitTextToSize(`${i + 1}. ${term}`, W - 2 * M - 12);
    need(wrapped.length * 11.5 + 6);
    pdf.text(wrapped, M + 8, y);
    y += wrapped.length * 11.5 + 6;
  });
  pdf.setTextColor(20, 20, 25);

  /* ---------------- Signatures ---------------- */
  need(90);
  y += 14;
  const sigY = y + 40;
  pdf.line(M, sigY, M + 220, sigY);
  pdf.line(W - M - 220, sigY, W - M, sigY);
  pdf.setFontSize(9);
  pdf.text("Contractor (signature & date)", M, sigY + 14);
  pdf.text("Client (signature & date)", W - M - 220, sigY + 14);

  /* ---------------- Footer on every page ---------------- */
  const pages = pdf.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    pdf.setPage(p);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(140, 140, 150);
    pdf.text(
      `${c.name || "Contractor"}  ·  Proposal ${propNo}  ·  Page ${p} of ${pages}`,
      W / 2,
      792 - 28,
      { align: "center" },
    );
  }

  const fname = `proposal-${doc.proposalDate}.pdf`;
  pdf.save(fname);
}

export const DEFAULT_TERMS: string[] = [
  "Scope is limited to the work described above. Any additional work requires a written change order signed by both parties.",
  "Payments are due per the schedule above. Late payments accrue 1.5% interest per month.",
  "This proposal is valid until the date shown. Pricing is subject to change after expiration.",
  "Owner provides site access, water, and power. Permits and inspection fees are the owner's responsibility unless noted above.",
  "Contractor warrants workmanship for one (1) year from substantial completion.",
  "Hidden or unforeseen conditions (rock, water, hazardous materials, structural deficiencies) are excluded and billed as extra work.",
  "Owner may cancel within three (3) business days of signing per applicable state law; work performed is billed at cost plus markup.",
];
