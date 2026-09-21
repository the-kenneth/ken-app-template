---
paths:
  - "packages/ui-web/**"
  - "packages/ui-mobile/**"
  - "packages/tokens/**"
  - "tooling/tailwind/**"
---

# Design system

Web and mobile have separate implementations and a shared interface vocabulary.
There is no react-native-web runtime.

- Hand-edit `packages/tokens/src/`; `pnpm tokens:build` owns the generated CSS
  and native token files.
- Mobile components type their variants from `@ken/tokens/contracts`.
  `packages/ui-web/src/parity.ts` proves the web public prop unions match.
- Shared names do not imply shared pixels. Mobile controls use the dimensions
  in `packages/ui-mobile/src/metrics.ts`: 44pt minimum targets and 48pt default
  controls.
- Mobile styles read `useTokens()` and memoise a `buildStyles(tokens)` result.
  Web resolves the same values through generated CSS variables.
- Theme choice is synchronous on both platforms: localStorage on web and MMKV
  on mobile, so the saved appearance is known before first paint.
- `Sheet` and `Touchable` are mobile-only because their interaction belongs to
  the device. Field is web-only. Typography is also platform-specific.

Icons have their own rule in `docs/rules/icons.md`.
