// REQUIRED: set CLERK_JWT_ISSUER_DOMAIN in the Convex dashboard (dev AND
// prod deployments) before the first push succeeds. It is your Clerk
// Frontend API URL, e.g. https://verb-noun-00.clerk.accounts.dev
// See README "First run" — the push error links you straight to the
// right dashboard page.
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
