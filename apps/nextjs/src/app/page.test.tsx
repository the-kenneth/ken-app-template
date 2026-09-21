import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";

import { getWebMessages } from "@ken/locales";

import HomePage from "./page";

vi.mock("./_components/auth-gate", () => ({
  AuthGate: () => null,
}));

describe("the localized home page", () => {
  it("renders English product copy", () => {
    render(
      <NextIntlClientProvider locale="en-US" messages={getWebMessages("en-US")}>
        <HomePage />
      </NextIntlClientProvider>,
    );

    expect(screen.getByRole("heading", { name: "Ken Template" })).toBeTruthy();
    screen.getByText("Next.js + Expo + Convex + Clerk");
  });
});
