---
paths:
  - "pnpm-workspace.yaml"
  - "apps/expo/package.json"
  - "packages/ui-mobile/package.json"
---

# Native dependency versions

Native packages shared by `apps/expo` and `packages/ui-mobile` live in the
`native` catalog in `pnpm-workspace.yaml`. Both packages reference
`catalog:native`, so a version moves in one place.

`expo install --fix` cannot interpret catalog specs. When it flags a shared
native package, update the catalog and restore any catalog reference it rewrote.
Other Expo-managed packages stay concrete in `apps/expo/package.json`.

Keep ui-mobile's peer ranges broad enough for compatible app-side patch and
minor updates.
