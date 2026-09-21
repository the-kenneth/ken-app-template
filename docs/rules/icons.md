---
paths:
  - "apps/**/*.tsx"
  - "packages/ui-web/**"
  - "packages/ui-mobile/**"
---

# Icons

Both platforms use Phosphor and pass glyphs into the shared-shape `Icon`
primitive. `Icon` owns size and weight; call sites own the glyph choice.

- Server Components import web glyphs from `@phosphor-icons/react/dist/ssr`.
- Mobile value imports deep-import a glyph, for example
  `phosphor-react-native/src/icons/House`. Metro does not tree-shake the barrel;
  one measured export fell from 8.6 MiB of Phosphor Hermes bytecode to 0.19 MiB
  for six deep-imported glyphs. Type-only barrel imports are erased and are fine.
- `pnpm ui-add` output uses a different icon library and must be converted to
  Phosphor by hand.
