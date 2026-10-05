/**
 * BuildCalc Pro — Tool quick-action bar.
 *
 * Rendered by the /tools/[slug] layout above every calculator:
 * Reset Inputs · Save JSON Draft · Open Master Cart.
 * The first two enable only when the active tool registers handlers.
 */
"use client";

import { RotateCcw, Save, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useToolPageStore } from "@/store/useToolPageStore";
import { useUiStore } from "@/store/useUiStore";

export function ToolActionBar() {
  const actions = useToolPageStore((s) => s.actions);
  const setDrawerOpen = useUiStore((s) => s.setEstimateDrawerOpen);

  const handleReset = () => {
    actions?.resetInputs();
    toast.info("Inputs reset", {
      description: actions ? `${actions.toolTitle} restored to defaults.` : undefined,
    });
  };

  const handleSaveDraft = () => {
    try {
      actions?.saveDraft();
      toast.success("Draft saved", {
        description: "Your inputs are stored on this device as a JSON draft.",
      });
    } catch (err) {
      toast.error("Couldn't save draft", {
        description: err instanceof Error ? err.message : "Storage unavailable.",
      });
    }
  };

  return (
    <div
      className="no-print mb-5 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-2.5"
      role="toolbar"
      aria-label="Calculator quick actions"
    >
      <Button
        variant="outline"
        size="sm"
        onClick={handleReset}
        disabled={!actions}
        className="min-h-[44px]"
      >
        <RotateCcw className="h-4 w-4" />
        Reset inputs
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleSaveDraft}
        disabled={!actions}
        className="min-h-[44px]"
      >
        <Save className="h-4 w-4" />
        Save JSON draft
      </Button>
      <div className="flex-1" />
      <Button
        variant="default"
        size="sm"
        onClick={() => setDrawerOpen(true)}
        className="min-h-[44px]"
      >
        <ShoppingCart className="h-4 w-4" />
        Open Master Cart
      </Button>
    </div>
  );
}
