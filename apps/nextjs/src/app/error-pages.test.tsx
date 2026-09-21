import * as Sentry from "@sentry/nextjs";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getWebMessages } from "@ken/locales";

import ErrorPage from "./error";
import GlobalError from "./global-error";
import NotFound from "./not-found";

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));
const captureException = vi.mocked(Sentry.captureException);

const renderLocalized = (ui: React.ReactNode) =>
  render(
    <NextIntlClientProvider locale="en-US" messages={getWebMessages("en-US")}>
      {ui}
    </NextIntlClientProvider>,
  );

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("error.tsx", () => {
  it("renders the fallback, reports to Sentry, and can reset", () => {
    const error = new Error("boom");
    const reset = vi.fn();
    renderLocalized(<ErrorPage error={error} reset={reset} />);

    screen.getByText("Something went wrong");
    expect(captureException).toHaveBeenCalledWith(error);

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(reset).toHaveBeenCalled();
  });
});

describe("global-error.tsx", () => {
  it("renders the fallback and reports to Sentry", () => {
    const error = new Error("layout boom");
    render(<GlobalError error={error} reset={vi.fn()} />);

    screen.getByText("Something went wrong");
    screen.getByRole("button", { name: "Try again" });
    expect(captureException).toHaveBeenCalledWith(error);
  });
});

describe("not-found.tsx", () => {
  it("renders a 404 with a link home", () => {
    renderLocalized(<NotFound />);

    screen.getByText("404");
    expect(screen.getByRole("link", { name: "Back home" })).toHaveProperty(
      "pathname",
      "/",
    );
  });
});
