/** Absolute URL for a file under `public/` (root-relative, respects Vite `BASE_URL`). */
export function publicUrl(relativePath: string): string {
  const base = import.meta.env.BASE_URL;
  const clean = relativePath.replace(/^\.\//, "").replace(/^\//, "");
  return `${base}${clean}`;
}
