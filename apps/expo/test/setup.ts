import { signOut } from "./account";

process.env.EXPO_PUBLIC_CONVEX_URL = "https://test.convex.cloud";
process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_harness";

beforeEach(signOut);
