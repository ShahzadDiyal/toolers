"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";

const fieldCls =
  "mt-1.5 block w-full rounded-lg border border-border bg-white px-4 py-3 text-base text-[#0B1B33] placeholder:text-[#5A6C85]/60 transition-colors focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30";
const labelCls =
  "text-xs font-bold uppercase tracking-[0.12em] text-[#0B1B33]";
const hintCls = "mt-1 text-sm text-[#5A6C85]";
const errorCls = "mt-1 text-sm font-semibold text-red-600";

export function RequestForm() {
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    toolName: "",
    calculates: "",
    description: "",
    inputs: "",
    output: "",
    notes: "",
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [sent, setSent] = React.useState(false);

  function set(key: keyof typeof form) {
    return (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Please enter your name.";
    if (!form.email.trim()) e.email = "Please enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      e.email = "That email address doesn't look right.";
    if (!form.toolName.trim()) e.toolName = "Give the tool a name.";
    if (!form.calculates.trim())
      e.calculates = "Tell us what the tool should calculate.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    // No backend: the form confirms locally and stores nothing.
    setSent(true);
  }

  if (sent) {
    return (
      <div
        role="status"
        className="rounded-xl border border-green-600/30 bg-green-50 p-8 text-center"
      >
        <CheckCircle2
          className="mx-auto h-12 w-12 text-green-600"
          aria-hidden
        />
        <h2 className="mt-4 font-display text-2xl font-extrabold text-[#0B1B33]">
          Request received
        </h2>
        <p className="mx-auto mt-2 max-w-md leading-relaxed text-[#5A6C85]">
          Thanks, {form.name.trim().split(" ")[0]} your idea for{" "}
          <strong className="text-[#0B1B33]">“{form.toolName.trim()}”</strong>{" "}
          is in the queue. We review every request and build the tools that
          help the most contractors.
        </p>
      </div>
    );
  }

  const err = (k: string) =>
    errors[k] ? (
      <p id={`rf-${k}-err`} role="alert" className={errorCls}>
        {errors[k]}
      </p>
    ) : null;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="rf-name" className={labelCls}>
            Name
          </label>
          <input
            id="rf-name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={set("name")}
            placeholder="Your name"
            className={fieldCls}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "rf-name-err" : undefined}
          />
          {err("name")}
        </div>
        <div>
          <label htmlFor="rf-email" className={labelCls}>
            Email
          </label>
          <input
            id="rf-email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={set("email")}
            placeholder="you@example.com"
            className={fieldCls}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "rf-email-err" : undefined}
          />
          {err("email")}
        </div>
      </div>

      <div>
        <label htmlFor="rf-toolname" className={labelCls}>
          Tool / calculator name
        </label>
        <input
          id="rf-toolname"
          type="text"
          value={form.toolName}
          onChange={set("toolName")}
          placeholder="e.g. Helical Pier Calculator"
          className={fieldCls}
          aria-invalid={!!errors.toolName}
          aria-describedby={errors.toolName ? "rf-toolName-err" : undefined}
        />
        {err("toolName")}
      </div>

      <div>
        <label htmlFor="rf-calculates" className={labelCls}>
          What should the tool calculate?
        </label>
        <input
          id="rf-calculates"
          type="text"
          value={form.calculates}
          onChange={set("calculates")}
          placeholder="e.g. Number and depth of helical piers for a deck foundation"
          className={fieldCls}
          aria-invalid={!!errors.calculates}
          aria-describedby={errors.calculates ? "rf-calculates-err" : undefined}
        />
        {err("calculates")}
      </div>

      <div>
        <label htmlFor="rf-description" className={labelCls}>
          Description
        </label>
        <textarea
          id="rf-description"
          rows={4}
          value={form.description}
          onChange={set("description")}
          placeholder="What problem does this tool solve on the jobsite?"
          className={fieldCls}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="rf-inputs" className={labelCls}>
            Required inputs
          </label>
          <textarea
            id="rf-inputs"
            rows={4}
            value={form.inputs}
            onChange={set("inputs")}
            placeholder="e.g. Deck size, soil type, frost depth"
            className={fieldCls}
          />
          <p className={hintCls}>What the user would type in.</p>
        </div>
        <div>
          <label htmlFor="rf-output" className={labelCls}>
            Expected output
          </label>
          <textarea
            id="rf-output"
            rows={4}
            value={form.output}
            onChange={set("output")}
            placeholder="e.g. Pier count, depth, and material list"
            className={fieldCls}
          />
          <p className={hintCls}>What the tool should tell them.</p>
        </div>
      </div>

      <div>
        <label htmlFor="rf-notes" className={labelCls}>
          Additional notes
        </label>
        <textarea
          id="rf-notes"
          rows={3}
          value={form.notes}
          onChange={set("notes")}
          placeholder="Anything else formulas, references, examples…"
          className={fieldCls}
        />
      </div>

      <p className="text-sm text-[#5A6C85]">
        This form doesn't send data anywhere yet it's ready for our inbox
        integration. Nothing is stored in your browser either.
      </p>
      <button
        type="submit"
        className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[#ED7D22] px-8 py-3 text-sm font-bold text-white transition-colors duration-150 hover:bg-[#d06f1d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
      >
        Submit tool request
      </button>
    </form>
  );
}
