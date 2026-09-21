import type { PropsWithChildren } from "react";

import { signOut as clearAccount, useAccount } from "../account";

export function ClerkProvider(props: PropsWithChildren) {
  return props.children;
}

export function useAuth() {
  const account = useAccount();
  return {
    isLoaded: true,
    isSignedIn: account !== null,
    getToken: async () => (account ? "test-token" : null),
  };
}

export function useUser() {
  const account = useAccount();
  return {
    isLoaded: true,
    user: account && {
      firstName: account.firstName,
      emailAddresses: [{ emailAddress: account.email }],
    },
  };
}

export function useClerk() {
  return { signOut: async () => clearAccount() };
}

const notCalled = () => {
  throw new Error(
    "Drive account state through test/account.ts instead of a Clerk credential flow.",
  );
};

export const useSignIn = () => ({
  signIn: { status: null, password: notCalled, finalize: notCalled },
});

export const useSignUp = () => ({
  signUp: {
    status: null,
    password: notCalled,
    finalize: notCalled,
    verifications: {
      sendEmailCode: notCalled,
      verifyEmailCode: notCalled,
    },
  },
});

export const useSSO = () => ({ startSSOFlow: notCalled });
