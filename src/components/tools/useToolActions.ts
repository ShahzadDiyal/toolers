/**
 * BuildCalc Pro — Hook for calculator components to register with the
 * tool-page quick-action bar (Reset Inputs / Save JSON Draft).
 *
 * Usage inside a tool component (built on useToolAutoSave):
 *   const { resetToDefaults, values } = useToolAutoSave("my-slug", DEFAULTS);
 *   useToolActions({
 *     toolTitle: "My Calculator",
 *     resetInputs: resetToDefaults,
 *     saveDraft: () => downloadJsonFile("my-slug.json", JSON.stringify(values)),
 *   });
 */
"use client";

import * as React from "react";
import { useToolPageStore, type ToolActions } from "@/store/useToolPageStore";

export function useToolActions(actions: ToolActions): void {
  const registerActions = useToolPageStore((s) => s.registerActions);
  const clearActions = useToolPageStore((s) => s.clearActions);
  const ref = React.useRef(actions);
  ref.current = actions;

  React.useEffect(() => {
    // Register stable wrappers so tools don't need memoized callbacks.
    registerActions({
      toolTitle: ref.current.toolTitle,
      resetInputs: () => ref.current.resetInputs(),
      saveDraft: () => ref.current.saveDraft(),
    });
    return () => clearActions();
  }, [registerActions, clearActions]);
}
