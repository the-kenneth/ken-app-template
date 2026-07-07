import Link from "next/link";

import { Button } from "@ken/ui/button";

export default function NotFound() {
  return (
    <main className="container mx-auto flex max-w-2xl flex-col items-center gap-4 py-16">
      <h1 className="text-5xl font-extrabold tracking-tight">404</h1>
      <p className="text-center text-muted-foreground">
        This page could not be found.
      </p>
      <Button asChild variant="outline">
        <Link href="/">Back home</Link>
      </Button>
    </main>
  );
}
