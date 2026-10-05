/**
 * BuildCalc Pro root layout.
 *
 * Deliberately minimal: the <html>/<body> shell (with dynamic lang + dir)
 * lives in app/[locale]/layout.tsx, following the standard Next.js
 * sub-path i18n pattern. This root segment only forwards its children.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
