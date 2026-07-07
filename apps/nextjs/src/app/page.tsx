import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

import { Button } from "@acme/ui/button";

import { Todos } from "./_components/todos";

export default function HomePage() {
  return (
    <main className="container mx-auto max-w-2xl py-16">
      <div className="flex flex-col items-center gap-8">
        <h1 className="text-5xl font-extrabold tracking-tight">
          Acme <span className="text-primary">Template</span>
        </h1>
        <p className="text-center text-muted-foreground">
          Next.js + Expo + Convex + Clerk
        </p>

        <Show
          when="signed-in"
          fallback={
            <div className="flex gap-4">
              <SignInButton mode="modal">
                <Button>Sign in</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button variant="outline">Sign up</Button>
              </SignUpButton>
            </div>
          }
        >
          <UserButton />
          <Todos />
        </Show>
      </div>
    </main>
  );
}
