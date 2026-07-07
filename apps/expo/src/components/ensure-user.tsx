import { useConvexAuth, useMutation } from "convex/react";
import { useEffect } from "react";

import { api } from "@ken/backend/convex/_generated/api";

/**
 * Upserts the Convex user doc as soon as a signed-in Clerk session exists.
 * Runs reactively — fires immediately after sign-up/sign-in, no reload needed.
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
