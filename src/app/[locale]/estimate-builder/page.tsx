import { redirect } from "next/navigation";
import { toolHref } from "@/data/toolsRegistry";

/** Alias: /[locale]/estimate-builder → the Master Proposal Builder tool page. */
export default async function EstimateBuilderAlias({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(toolHref({ slug: "master-proposal-builder" }, locale));
}
