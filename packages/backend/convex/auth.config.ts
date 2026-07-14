// REQUIRED: set CLERK_FRONTEND_API_URL in the Convex dashboard (dev AND
// prod deployments) before the first push succeeds. It is your Clerk
// Frontend API URL, e.g. https://verb-noun-00.clerk.accounts.dev
// See README "First run" — the push error links you straight to the
// right dashboard page.
export default {
  providers: [
    {
      domain: process.env.CLERK_FRONTEND_API_URL,
      applicationID: "convex",
    },
  ],
};
