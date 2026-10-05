"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import {
  BLOG_POSTS,
  blogCategories,
  formatBlogDate,
  type BlogPost,
} from "@/data/blog";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

/** Blueprint-style geometric thumbnail per category — pure SVG, no photos. */
export function PostThumb({ category, className }: { category: string; className?: string }) {
  const art: Record<string, React.ReactNode> = {
    Concrete: (
      <g stroke="#ED7D22" strokeWidth="2.5" fill="none">
        <path d="M20 62 L64 40 L108 62 L64 84 Z" />
        <path d="M20 62 L20 84 L64 106 L64 84" />
        <path d="M108 62 L108 84 L64 106" />
        <path d="M42 51 L86 73 M42 73 L86 51" strokeWidth="1.5" opacity="0.6" />
      </g>
    ),
    Masonry: (
      <g stroke="#ED7D22" strokeWidth="2.5" fill="none">
        <rect x="18" y="34" width="92" height="56" />
        <path d="M18 52 H110 M18 70 H110 M48 34 V52 M78 34 V52 M33 52 V70 M63 52 V70 M93 52 V70 M48 70 V90 M78 70 V90" strokeWidth="1.5" />
      </g>
    ),
    Roofing: (
      <g stroke="#ED7D22" strokeWidth="2.5" fill="none">
        <path d="M14 78 L64 34 L114 78" />
        <path d="M30 78 V92 H98 V78" strokeWidth="1.5" />
        <path d="M64 34 V20 M48 52 L80 52" strokeWidth="1.5" opacity="0.7" />
        <path d="M40 78 L64 56 L88 78" strokeWidth="1.5" opacity="0.5" />
      </g>
    ),
    Framing: (
      <g stroke="#ED7D22" strokeWidth="2.5" fill="none">
        <path d="M20 92 H36 V76 H52 V60 H68 V44 H84 V28 H100" />
        <path d="M20 92 H108" strokeWidth="1.5" opacity="0.5" />
        <path d="M36 76 L36 92 M52 60 L52 92 M68 44 L68 92 M84 28 L84 92" strokeWidth="1.5" opacity="0.5" />
      </g>
    ),
    Estimating: (
      <g stroke="#ED7D22" strokeWidth="2.5" fill="none">
        <rect x="42" y="22" width="44" height="76" rx="4" />
        <rect x="50" y="32" width="28" height="12" strokeWidth="1.5" />
        <circle cx="56" cy="60" r="3" strokeWidth="1.5" />
        <circle cx="72" cy="60" r="3" strokeWidth="1.5" />
        <circle cx="56" cy="76" r="3" strokeWidth="1.5" />
        <path d="M66 70 L78 82 M78 70 L66 82" strokeWidth="1.5" />
      </g>
    ),
  };
  return (
    <svg
      viewBox="0 0 128 128"
      className={className}
      role="img"
      aria-label={`${category} illustration`}
    >
      <rect width="128" height="128" fill="#14284A" />
      <g stroke="#2563EB" strokeWidth="1" opacity="0.35">
        {Array.from({ length: 7 }).map((_, i) => (
          <React.Fragment key={i}>
            <line x1={(i + 1) * 16} y1="0" x2={(i + 1) * 16} y2="128" />
            <line x1="0" y1={(i + 1) * 16} x2="128" y2={(i + 1) * 16} />
          </React.Fragment>
        ))}
      </g>
      {art[category] ?? art["Estimating"]}
    </svg>
  );
}

function PostCard({ post, index }: { post: BlogPost; index: number }) {
  return (
    <article
      className="reveal group flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
      style={{ ["--reveal-delay" as string]: `${Math.min(index, 5) * 60}ms` }}
    >
      <Link
        href={`/blog/${post.slug}`}
        className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
        aria-label={post.title}
      >
        <PostThumb category={post.category} className="aspect-[16/10] w-full" />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-full bg-[#ED7D22]/10 px-2.5 py-1 font-bold uppercase tracking-wide text-[#ED7D22]">
            {post.category}
          </span>
          <span className="flex items-center gap-1 text-[#5A6C85]">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            {post.readMinutes} min read
          </span>
        </div>
        <h2 className="mt-3 text-lg font-extrabold leading-snug text-[#0B1B33]">
          <Link
            href={`/blog/${post.slug}`}
            className="transition-colors group-hover:text-[#2563EB] focus-visible:outline-2 focus-visible:outline-[#2563EB]"
          >
            {post.title}
          </Link>
        </h2>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-[#5A6C85]">
          {post.excerpt}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <span className="text-xs font-semibold text-[#5A6C85]">
            {formatBlogDate(post.date)}
          </span>
          <Link
            href={`/blog/${post.slug}`}
            className="inline-flex min-h-[44px] items-center gap-1 text-sm font-bold text-[#2563EB] hover:underline focus-visible:outline-2 focus-visible:outline-[#2563EB]"
          >
            Read more <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function BlogIndex() {
  const [active, setActive] = React.useState<string>("All");
  const cats = ["All", ...blogCategories()];
  const posts =
    active === "All"
      ? BLOG_POSTS
      : BLOG_POSTS.filter((p) => p.category === active);

  return (
    <Reveal>
      <div
        className="reveal flex flex-wrap gap-2"
        role="group"
        aria-label="Filter posts by category"
      >
        {cats.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setActive(c)}
            aria-pressed={active === c}
            className={cn(
              "min-h-[44px] rounded-full border px-4 py-2 text-sm font-bold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]",
              active === c
                ? "border-[#14284A] bg-[#14284A] text-white"
                : "border-border bg-card text-[#0B1B33] hover:border-[#2563EB] hover:text-[#2563EB]",
            )}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p, i) => (
          <PostCard key={p.slug} post={p} index={i} />
        ))}
      </div>
    </Reveal>
  );
}
