"use client";

import { useConvexAuth, useMutation } from "convex/react";
import { useEffect } from "react";

import { api } from "@ken/backend/convex/_generated/api";

/**
 * Upserts the Convex user doc as soon as a signed-in Clerk session exists.
 * Runs reactively — fires immediately after sign-up/sign-in, no reload needed.
 * The Clerk webhook (packages/backend/convex/http.ts) covers out-of-band
 * profile updates and deletions.
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
