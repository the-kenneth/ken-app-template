"use client";

import { useConvexAuth, useMutation } from "convex/react";
import { useEffect } from "react";

import { api } from "@ken/backend/convex/_generated/api";

/**
 * Creates the Convex user doc as soon as a signed-in Clerk session exists.
 * Runs reactively — fires immediately after sign-up/sign-in, no reload needed.
 *
 * Safe to run on every mount: the mutation is insert-only, so it will not
 * overwrite the stored profile with stale JWT claims. The Clerk webhook
 * (packages/backend/convex/http.ts) keeps email/imageUrl fresh and handles
 * deletions.
 */
export function StoreUser() {
  const { isAuthenticated } = useConvexAuth();
  const storeUser = useMutation(api.users.storeUser);

  useEffect(() => {
    if (isAuthenticated) {
      void storeUser({});
    }
  }, [isAuthenticated, storeUser]);

  return null;
}
