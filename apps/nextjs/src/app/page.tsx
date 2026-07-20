import { AuthGate } from "./_components/auth-gate";

export default function HomePage() {
  return (
    <main className="container mx-auto max-w-2xl py-16">
      <div className="flex flex-col items-center gap-8">
        <h1 className="text-5xl font-extrabold tracking-tight">
          Ken <span className="text-primary">Template</span>
        </h1>
        <p className="text-center text-muted-foreground">
          Next.js + Expo + Convex + Clerk
        </p>

        <AuthGate />
      </div>
    </main>
  );
}
