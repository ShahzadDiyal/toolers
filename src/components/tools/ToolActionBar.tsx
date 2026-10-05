/**
 * BuildCalc Pro Tool quick-action bar.
 *
 * Localized UI shell: button labels and toast copy come from the locale
 * dictionary. Rendered by the /[locale]/tools/[slug] layout above every
 * calculator: Reset Inputs · Save JSON Draft · Open Master Cart.
 * The first two enable only when the active tool registers handlers.
 */
"use client";

import { RotateCcw, Save, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useToolPageStore } from "@/store/useToolPageStore";
import { useUiStore } from "@/store/useUiStore";
import { useTranslation } from "@/i18n/I18nProvider";

export function ToolActionBar() {
  const { t } = useTranslation();
  const actions = useToolPageStore((s) => s.actions);
  const setDrawerOpen = useUiStore((s) => s.setEstimateDrawerOpen);

  const handleReset = () => {
    actions?.resetInputs();
    toast.info(t.common.inputsReset, {
      description: actions
        ? t.common.restoredDefaults.replace("{title}", actions.toolTitle)
        : undefined,
    });
  };

  const handleSaveDraft = () => {
    try {
      actions?.saveDraft();
      toast.success(t.common.draftSaved, {
        description: t.common.draftSavedDesc,
      });
    } catch (err) {
      toast.error(t.common.draftSaveFailed, {
        description: err instanceof Error ? err.message : "Storage unavailable.",
      });
    }
  };

  return (
    <div
      className="no-print mb-5 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-2.5"
      role="toolbar"
      aria-label={t.common.toolbarAria}
    >
      <Button
        variant="outline"
        size="sm"
        onClick={handleReset}
        disabled={!actions}
        className="min-h-[44px]"
      >
        <RotateCcw className="h-4 w-4" />
        {t.common.resetInputs}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleSaveDraft}
        disabled={!actions}
        className="min-h-[44px]"
      >
        <Save className="h-4 w-4" />
        {t.common.saveDraft}
      </Button>
      <div className="flex-1" />
      <Button
        variant="default"
        size="sm"
        onClick={() => setDrawerOpen(true)}
        className="min-h-[44px]"
      >
        <ShoppingCart className="h-4 w-4" />
        {t.common.openMasterCart}
      </Button>
    </div>
  );
}
