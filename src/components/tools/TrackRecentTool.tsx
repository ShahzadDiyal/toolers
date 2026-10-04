/**
 * BuildCalc Pro — Records a tool visit in the "recently used" MRU list.
 * Mounted by tool pages; no UI.
 */
"use client";

import * as React from "react";
import { pushRecentTool } from "@/lib/recent-tools";

export function TrackRecentTool({ slug }: { slug: string }) {
  React.useEffect(() => {
    pushRecentTool(slug);
  }, [slug]);
  return null;
}
