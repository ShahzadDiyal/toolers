import { redirect } from "next/navigation";

/** Alias: /estimate-builder → the Master Proposal Builder tool page. */
export default function EstimateBuilderAlias() {
  redirect("/tools/master-proposal-builder");
}
