// Vitest (via Vite) provides import.meta.glob at test time; TypeScript needs
// the declaration since this package doesn't depend on vite directly.
interface ImportMeta {
  glob: (pattern: string | string[]) => Record<string, () => Promise<unknown>>;
}
