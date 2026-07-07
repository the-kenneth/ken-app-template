"use client";

import { useConvexAuth, useMutation } from "convex/react";
import { useEffect } from "react";

import { api } from "@acme/backend/convex/_generated/api";

/**
 * Upserts the Convex user doc as soon as a signed-in Clerk session exists.
 * Runs reactively — fires immediately after sign-up/sign-in, no reload needed.
 * The Clerk webhook (packages/backend/convex/http.ts) covers out-of-band
 * profile updates and deletions.
 */
export function EnsureUser() {
  const { isAuthenticated } = useConvexAuth();
  const ensureUser = useMutation(api.users.ensureUser);

  useEffect(() => {
    if (isAuthenticated) {
      void ensureUser({});
    }
  }, [isAuthenticated, ensureUser]);

  return null;
}
