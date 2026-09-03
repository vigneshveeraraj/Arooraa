import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("@/components/layout/SiteHeader", () => ({ SiteHeader: () => <header /> }));
vi.mock("@/components/layout/SiteFooter", () => ({ SiteFooter: () => <footer /> }));

/**
 * The frontend half of A8's kill switch.
 *
 * <p>The backend switches are the ones that matter for safety — with the API returning 404 Aura can
 * say nothing whatever the browser does. This is about the other failure: a launcher still sitting
 * on the page when the service behind it is off, which a visitor opens, types into, and is
 * apologised to by. Turning Aura off should mean it is not there.
 *
 * <p>These tests are about mounting, which is exactly what the switch controls. They deliberately
 * do not claim anything about the bundle: building with the variable unset and with it set to
 * "false" both leave the widget's chunk in `out/`, unreferenced. See the note on the switch itself.
 */
describe("whether Aura is on the public site at all", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  async function renderLayout() {
    vi.resetModules();
    const { default: PublicLayout } = await import("./layout");
    render(<PublicLayout><main /></PublicLayout>);
  }

  it("is there in development without anybody configuring anything", async () => {
    // Local review has to work out of the box, or nobody reviews it.
    vi.stubEnv("NODE_ENV", "development");
    await renderLayout();

    expect(await screen.findByRole("button", { name: "Ask Aura" })).toBeInTheDocument();
  });

  it("is gone when a production build is not told to include it", async () => {
    // The right way round for something the owner has not approved for the public: a production
    // build has to be told to ship Aura, rather than told not to.
    vi.stubEnv("NODE_ENV", "production");
    await renderLayout();

    expect(screen.queryByRole("button", { name: "Ask Aura" })).not.toBeInTheDocument();
  });

  it("is there in a production build that asks for it", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_AURA_ENABLED", "true");
    await renderLayout();

    expect(await screen.findByRole("button", { name: "Ask Aura" })).toBeInTheDocument();
  });

  it("can be taken off a development build too, which is how the switch gets tested", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_AURA_ENABLED", "false");
    await renderLayout();

    expect(screen.queryByRole("button", { name: "Ask Aura" })).not.toBeInTheDocument();
  });
});
