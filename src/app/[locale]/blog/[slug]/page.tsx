import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowLeft, Calculator, Clock, User } from "lucide-react";
import { CrumbNav } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import {
  BLOG_POSTS,
  getPost,
  relatedPosts,
  formatBlogDate,
} from "@/data/blog";
import { toolHref } from "@/data/toolsRegistry";
import { SITE_URL } from "@/lib/site";
import { PostThumb } from "../BlogIndex";
import { localePath } from "@/i18n/config";

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} Blog`,
    description: post.excerpt,
    alternates: { canonical: `${SITE_URL}${localePath(`/blog/${post.slug}`, locale)}` },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const related = relatedPosts(post.slug);

  return (
    <article className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <div className="reveal">
            <CrumbNav
              items={[
                { label: "Home", href: "/" },
                { label: "Blog", href: "/blog" },
                { label: post.title },
              ]}
            />
          </div>
          <p className="reveal mt-6 inline-block rounded-full bg-[#ED7D22]/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#ED7D22]">
            {post.category}
          </p>
          <h1 className="reveal mt-3 font-display text-3xl font-extrabold tracking-tight text-[#0B1B33] sm:text-4xl">
            {post.title}
          </h1>
          <div className="reveal mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#5A6C85]">
            <span className="inline-flex items-center gap-1.5">
              <User className="h-4 w-4" aria-hidden /> {post.author}
            </span>
            <time dateTime={post.date}>{formatBlogDate(post.date)}</time>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" aria-hidden /> {post.readMinutes} min
              read
            </span>
          </div>
        </Reveal>
      </div>

      <Reveal className="mx-auto mt-8 max-w-3xl">
        <div className="reveal overflow-hidden rounded-xl border border-border">
          <PostThumb category={post.category} className="aspect-[21/9] w-full" />
        </div>

        <div className="reveal mt-8 space-y-8">
          {post.content.map((block, i) => (
            <section key={i}>
              {block.h2 && (
                <h2 className="font-display text-2xl font-extrabold tracking-tight text-[#0B1B33]">
                  {block.h2}
                </h2>
              )}
              {block.paragraphs?.map((p, j) => (
                <p
                  key={j}
                  className="mt-3 leading-relaxed text-[#0B1B33]/85"
                >
                  {p}
                </p>
              ))}
              {block.list && (
                <ul className="mt-3 list-disc space-y-2 pl-6 text-[#0B1B33]/85">
                  {block.list.map((li, k) => (
                    <li key={k} className="leading-relaxed">
                      {li}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {post.toolSlug && (
          <aside className="reveal mt-10 rounded-xl border-2 border-[#14284A] bg-[#14284A]/5 p-6">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#14284A]">
                <Calculator className="h-5 w-5 text-[#ED7D22]" aria-hidden />
              </span>
              <div>
                <h2 className="font-display text-xl font-extrabold text-[#0B1B33]">
                  Try the calculator
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-[#5A6C85]">
                  Run these numbers yourself with the free{" "}
                  {post.toolCta ?? "calculator"} no account needed.
                </p>
                <Link
                  href={toolHref({ slug: post.toolSlug })}
                  className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#ED7D22] px-5 py-2.5 text-sm font-bold text-white transition-colors duration-150 hover:bg-[#d06f1d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
                >
                  Open {post.toolCta ?? "calculator"}{" "}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </div>
          </aside>
        )}

        <div className="reveal mt-10">
          <Link
            href={localePath("/blog", locale)}
            className="inline-flex min-h-[44px] items-center gap-2 text-sm font-bold text-[#2563EB] hover:underline focus-visible:outline-2 focus-visible:outline-[#2563EB]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden /> All guides
          </Link>
        </div>
      </Reveal>

      {related.length > 0 && (
        <section className="mx-auto mt-14 max-w-7xl" aria-labelledby="related-posts">
          <Reveal>
            <h2
              id="related-posts"
              className="reveal font-display text-2xl font-extrabold tracking-tight text-[#0B1B33]"
            >
              Related guides
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r, i) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="reveal group rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-[#2563EB]"
                  style={{ ["--reveal-delay" as string]: `${i * 60}ms` }}
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-[#ED7D22]">
                    {r.category}
                  </p>
                  <h3 className="mt-2 font-extrabold leading-snug text-[#0B1B33] group-hover:text-[#2563EB]">
                    {r.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#5A6C85]">{r.excerpt}</p>
                  <p className="mt-3 text-xs font-semibold text-[#5A6C85]">
                    {formatBlogDate(r.date)} · {r.readMinutes} min read
                  </p>
                </Link>
              ))}
            </div>
          </Reveal>
        </section>
      )}
    </article>
  );
}
