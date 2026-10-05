/**
 * BuildCalc Pro Zod validation contracts.
 *
 * Every calculator input AND every persisted estimate document is validated
 * through these schemas. Imports are rejected loudly instead of silently
 * corrupting the master estimate.
 */
import { z } from "zod";
import { ESTIMATE_UNITS } from "@/types/estimator";

/* ------------------------------------------------------------------ */
/*  Shared primitives                                                  */
/* ------------------------------------------------------------------ */

export const nonNegativeNumber = z
  .number({ error: "Must be a number" })
  .finite("Must be finite")
  .nonnegative("Cannot be negative");

export const percentField = z
  .number()
  .finite()
  .min(0, "Minimum 0%")
  .max(100, "Maximum 100%");

export const optionalText = z.string().trim().max(500).optional().or(z.literal(""));

/* ------------------------------------------------------------------ */
/*  Estimate documents                                                 */
/* ------------------------------------------------------------------ */

export const estimateLineItemSchema = z.object({
  id: z.string().min(1),
  toolSlug: z.string().min(1),
  title: z.string().min(1).max(200),
  category: z.enum([
    "concrete",
    "framing-roofing",
    "finishes",
    "site-exterior",
    "mep",
    "financial-business",
    "utilities",
  ]),
  quantity: nonNegativeNumber,
  unit: z.union([z.enum(ESTIMATE_UNITS as [string, ...string[]]), z.string().min(1).max(20)]),
  unitCost: nonNegativeNumber,
  totalCost: nonNegativeNumber,
  wastePercent: percentField,
  notes: optionalText,
  timestamp: z.string().datetime({ offset: true }).or(z.string().min(1)),
});

export const clientInfoSchema = z.object({
  name: z.string().trim().max(200),
  company: optionalText,
  email: z.string().trim().max(200).optional().or(z.literal("")),
  phone: optionalText,
  address: optionalText,
  projectName: optionalText,
  projectAddress: optionalText,
});

export const companyInfoSchema = z.object({
  name: z.string().trim().max(200),
  logoBase64: z.string().max(2_000_000).optional(), // ~1.5MB cap, local only
  license: optionalText,
  email: z.string().trim().max(200).optional().or(z.literal("")),
  phone: optionalText,
  address: optionalText,
});

export const masterEstimateSchema = z.object({
  version: z.number().int().min(1).max(1),
  items: z.array(estimateLineItemSchema).max(5000),
  company: companyInfoSchema,
  client: clientInfoSchema,
  markupPercent: percentField,
  contingencyPercent: percentField,
  taxPercent: percentField,
  updatedAt: z.string().min(1),
});

export type MasterEstimateDoc = z.infer<typeof masterEstimateSchema>;

/* ------------------------------------------------------------------ */
/*  Generic calculator input helpers                                   */
/* ------------------------------------------------------------------ */

/** Coerce a form value to a validated number. */
export const coercedNumber = z.coerce
  .number({ error: "Enter a number" })
  .finite("Enter a finite number");

/** Required positive dimension (length, width, depth...). */
export const positiveDimension = (label = "Dimension") =>
  coercedNumber
    .positive(`${label} must be greater than 0`)
    .max(1_000_000, `${label} is unrealistically large`);

/** Waste percent as typed on calculator cards (0–50). */
export const wasteInput = z.coerce
  .number()
  .finite()
  .min(0, "Waste cannot be negative")
  .max(50, "Waste above 50% is not allowed");

/** Unit cost in dollars. */
export const unitCostInput = z.coerce
  .number()
  .finite()
  .min(0, "Cost cannot be negative")
  .max(1_000_000_000, "Cost is unrealistically large");
