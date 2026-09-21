import { useSyncExternalStore } from "react";

/** The account state the Clerk and Convex test adapters both read. */
export interface FakeAccount {
  firstName: string;
  email: string;
}

const DEFAULT: FakeAccount = {
  firstName: "Ada",
  email: "ada@example.com",
};

let account: FakeAccount | null = null;
const listeners = new Set<() => void>();

const emit = () => {
  for (const listener of listeners) listener();
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

// Wrap in act() when changing account state after the app renders.
export function signIn(next: Partial<FakeAccount> = {}) {
  account = { ...DEFAULT, ...next };
  emit();
}

export function signOut() {
  account = null;
  emit();
}

export const getAccount = () => account;

export const useAccount = () => useSyncExternalStore(subscribe, getAccount);
