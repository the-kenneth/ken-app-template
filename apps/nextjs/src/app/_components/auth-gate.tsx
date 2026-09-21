"use client";

import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { useTranslations } from "next-intl";

import { Button } from "@ken/ui-web/button";
import { Skeleton } from "@ken/ui-web/skeleton";

import { Todos } from "./todos";

/**
 * Gates the signed-in UI on Convex's auth state, not Clerk's. This is what
 * Clerk's own Convex integration guide prescribes — do not "simplify" it back
 * to <Show when="signed-in">:
 * https://clerk.com/docs/guides/development/integrations/databases/convex
 */
export function AuthGate() {
  const t = useTranslations("web.auth");
  return (
    <>
      <AuthLoading>
        <div className="flex gap-4" role="status" aria-busy="true">
          <span className="sr-only">{t("checking-status")}</span>
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </AuthLoading>

      <Unauthenticated>
        <div className="flex gap-4">
          <SignInButton mode="modal">
            <Button>{t("sign-in")}</Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button variant="outline">{t("sign-up")}</Button>
          </SignUpButton>
        </div>
      </Unauthenticated>

      <Authenticated>
        <UserButton />
        <Todos />
      </Authenticated>
    </>
  );
}
