/**
 * BuildCalc Pro — Resolves a ToolMetadata.iconName string to a Lucide icon.
 * Unknown names fall back to Calculator so Phase 2 tools can't break the UI.
 */
import {
  BrickWall,
  Calculator,
  Cylinder,
  Fence,
  House,
  Layers,
  LayoutGrid,
  Paintbrush,
  Percent,
  Ruler,
  Shovel,
  Sigma,
  Square,
  Thermometer,
  Triangle,
  Zap,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Layers,
  Cylinder,
  BrickWall,
  Ruler,
  House,
  Triangle,
  Square,
  Paintbrush,
  LayoutGrid,
  Shovel,
  Fence,
  Zap,
  Thermometer,
  Percent,
  Sigma,
  Calculator,
};

export function toolIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] ?? Calculator;
}
