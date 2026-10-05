import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BuildCalc Pro — Contractor Estimating Calculators",
    short_name: "BuildCalc Pro",
    description:
      "Free construction calculators: concrete, framing, roofing, stairs, rebar, tile, paint, flooring, electrical & bid math. Works offline, no account.",
    start_url: "/",
    display: "standalone",
    background_color: "#e8eef7",
    theme_color: "#14284A",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
    categories: ["business", "productivity", "utilities"],
  };
}
