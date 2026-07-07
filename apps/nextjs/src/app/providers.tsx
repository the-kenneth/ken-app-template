"use client";

import { useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";

import { env } from "~/env";
import { EnsureUser } from "./_components/ensure-user";

const convex = new ConvexReactClient(env.NEXT_PUBLIC_CONVEX_URL);

/**
 * Convex client authenticated with Clerk. Must be rendered inside
 * <ClerkProvider> (Convex reads the Clerk context via useAuth).
 */
export function ConvexClientProvider(props: { children: React.ReactNode }) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <EnsureUser />
      {props.children}
    </ConvexProviderWithClerk>
  );
}
