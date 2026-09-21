import type { PropsWithChildren } from "react";

import { useCallback } from "react";

import { useAccount } from "../account";

export class ConvexReactClient {
  setAuth() {}
  clearAuth() {}
}

export function ConvexProviderWithClerk(props: PropsWithChildren) {
  return props.children;
}

export function useConvexAuth() {
  const account = useAccount();
  return { isLoading: false, isAuthenticated: account !== null };
}

export function AuthLoading() {
  return null;
}

export function Unauthenticated(props: PropsWithChildren) {
  return useAccount() === null ? props.children : null;
}

export function Authenticated(props: PropsWithChildren) {
  return useAccount() === null ? null : props.children;
}

const noop = async () => undefined;

export const useMutation = () => useCallback(noop, []);
export const useAction = () => useCallback(noop, []);
export const useQuery = () => undefined;
