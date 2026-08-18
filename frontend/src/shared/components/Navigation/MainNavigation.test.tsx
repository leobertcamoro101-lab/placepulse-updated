import { describe, it, expect, vi } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import MainNavigation from "./MainNavigation";
import { TestProviders } from "../../../test-utils";

const loggedInAuth = {
  isLoggedIn: true,
  userId: "user1",
  name: "Jane Doe",
  image: null,
  logout: vi.fn(),
};

const renderNav = (authOverrides: Partial<typeof loggedInAuth & { isLoggedIn: boolean }> = {}) => {
  return render(
    <TestProviders authValue={{ ...loggedInAuth, ...authOverrides }}>
      <MemoryRouter>
        <MainNavigation />
      </MemoryRouter>
    </TestProviders>
  );
};

// Backdrop renders no accessible role/text of its own — select it directly
// via its known class, the same approach used for its standalone tests.
const getBackdropElement = () =>
  document.querySelector(".bg-black.bg-opacity-75") as HTMLElement | null;

// The drawer's copy of NavLinks/AccountMenu is only meaningfully
// distinguishable from the desktop header's copy by which portal/container
// it lives in — scope queries to the drawer-hook portal specifically.
const getDrawerScope = () => within(document.getElementById("drawer-hook") as HTMLElement);

describe("MainNavigation", () => {
  it("renders the logo linking to /places", () => {
    renderNav();

    const logo = screen.getByAltText("PlacePulse");
    expect(logo).toBeInTheDocument();
    expect(logo.closest("a")).toHaveAttribute("href", "/places");
  });

  it("renders no nav links or account menu when logged out", () => {
    renderNav({ isLoggedIn: false });

    expect(screen.queryByLabelText(/add place/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/account menu/i)).not.toBeInTheDocument();
  });

  it("does not show the drawer's content until the hamburger button is clicked", () => {
    renderNav();

    // The desktop header's inline nav is always in the DOM (just CSS-hidden),
    // so "Add Place" already exists once before the drawer ever opens.
    expect(screen.getAllByLabelText(/add place/i)).toHaveLength(1);
    // Logout is only ever rendered by the inline AccountMenu variant, which
    // only appears inside the drawer — so it shouldn't exist yet at all.
    expect(screen.queryByLabelText(/^logout$/i)).not.toBeInTheDocument();
  });

  it("opens the drawer when the hamburger button is clicked", async () => {
    const user = userEvent.setup();
    renderNav();

    const [hamburgerButton] = screen.getAllByRole("button").filter(
      (btn) => !btn.getAttribute("aria-label") // the hamburger has no aria-label, unlike AccountMenu's toggle
    );
    await user.click(hamburgerButton);

    // Drawer's own copy of NavLinks now adds a second "Add Place" link
    await waitFor(() => {
      expect(screen.getAllByLabelText(/add place/i)).toHaveLength(2);
    });
    // Inline AccountMenu inside the drawer shows Logout directly
    expect(getDrawerScope().getByLabelText(/^logout$/i)).toBeInTheDocument();
  });

  it("closes the drawer when the backdrop is clicked", async () => {
    const user = userEvent.setup();
    renderNav();

    const [hamburgerButton] = screen.getAllByRole("button").filter(
      (btn) => !btn.getAttribute("aria-label")
    );
    await user.click(hamburgerButton);
    await waitFor(() => {
      expect(screen.getAllByLabelText(/add place/i)).toHaveLength(2);
    });

    const backdrop = getBackdropElement();
    expect(backdrop).toBeInTheDocument();
    await user.click(backdrop!);

    await waitFor(() => {
      expect(screen.getAllByLabelText(/add place/i)).toHaveLength(1);
    });
  });

  it("closes the drawer when a link inside it is clicked", async () => {
    const user = userEvent.setup();
    renderNav();

    const [hamburgerButton] = screen.getAllByRole("button").filter(
      (btn) => !btn.getAttribute("aria-label")
    );
    await user.click(hamburgerButton);
    await waitFor(() => {
      expect(screen.getAllByLabelText(/add place/i)).toHaveLength(2);
    });

    // Click the drawer's own "Add Place" link — the whole drawer <aside>
    // has an onClick that closes it, so any click inside (including a
    // NavLink) should trigger the close.
    await user.click(getDrawerScope().getByLabelText(/add place/i));

    await waitFor(() => {
      expect(screen.getAllByLabelText(/add place/i)).toHaveLength(1);
    });
  });
});
