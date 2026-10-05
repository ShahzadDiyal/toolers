"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";

const fieldCls =
  "mt-1.5 block w-full rounded-lg border border-border bg-white px-4 py-3 text-base text-[#0B1B33] placeholder:text-[#5A6C85]/60 transition-colors focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30";
const labelCls =
  "text-xs font-bold uppercase tracking-[0.12em] text-[#0B1B33]";
const errorCls = "mt-1 text-sm font-semibold text-red-600";

export function ContactForm() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [sent, setSent] = React.useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Please enter your name.";
    if (!email.trim()) e.email = "Please enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      e.email = "That email address doesn't look right.";
    if (!message.trim()) e.message = "Please write a message.";
    else if (message.trim().length < 10)
      e.message = "Please give us a little more detail (10+ characters).";
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
          Message received
        </h2>
        <p className="mx-auto mt-2 max-w-md leading-relaxed text-[#5A6C85]">
          Thanks, {name.trim().split(" ")[0]} — your message is on its way.
          We read every note and usually reply within a couple of business
          days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-name" className={labelCls}>
            Name
          </label>
          <input
            id="cf-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className={fieldCls}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "cf-name-err" : undefined}
          />
          {errors.name && (
            <p id="cf-name-err" role="alert" className={errorCls}>
              {errors.name}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="cf-email" className={labelCls}>
            Email
          </label>
          <input
            id="cf-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={fieldCls}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "cf-email-err" : undefined}
          />
          {errors.email && (
            <p id="cf-email-err" role="alert" className={errorCls}>
              {errors.email}
            </p>
          )}
        </div>
      </div>
      <div>
        <label htmlFor="cf-subject" className={labelCls}>
          Subject
        </label>
        <input
          id="cf-subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Tool request, bug report, suggestion"
          className={fieldCls}
        />
      </div>
      <div>
        <label htmlFor="cf-message" className={labelCls}>
          Message
        </label>
        <textarea
          id="cf-message"
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us what's on your mind…"
          className={fieldCls}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "cf-message-err" : undefined}
        />
        {errors.message && (
          <p id="cf-message-err" role="alert" className={errorCls}>
            {errors.message}
          </p>
        )}
      </div>
      <p className="text-sm text-[#5A6C85]">
        This form doesn't send data anywhere yet — it's ready for our inbox
        integration. Nothing is stored in your browser either.
      </p>
      <button
        type="submit"
        className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[#ED7D22] px-8 py-3 text-sm font-bold text-white transition-colors duration-150 hover:bg-[#d06f1d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
      >
        Send message
      </button>
    </form>
  );
}
