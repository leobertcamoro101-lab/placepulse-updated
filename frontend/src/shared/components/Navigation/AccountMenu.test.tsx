import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import AccountMenu from "./AccountMenu";
import { TestProviders } from "../../../test-utils";

const loggedInAuth = {
  isLoggedIn: true,
  name: "Jane Doe",
  image: null,
  logout: vi.fn(),
};

const renderAccountMenu = (
  variant?: "dropdown" | "inline",
  authOverrides: Partial<typeof loggedInAuth & { isLoggedIn: boolean }> = {}
) => {
  return render(
    <TestProviders authValue={{ ...loggedInAuth, ...authOverrides }}>
      <MemoryRouter>
        <AccountMenu variant={variant} />
      </MemoryRouter>
    </TestProviders>
  );
};

describe("AccountMenu", () => {
  it("renders nothing when the user is not logged in", () => {
    const { container } = renderAccountMenu(undefined, { isLoggedIn: false });
    expect(container).toBeEmptyDOMElement();
  });

  describe("dropdown variant", () => {
    it("hides the menu items until the account button is clicked", () => {
      renderAccountMenu("dropdown");

      expect(screen.queryByText(/^profile$/i)).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: /account menu/i })).toBeInTheDocument();
    });

    it("opens the menu showing Profile, Users, and Logout links", async () => {
      const user = userEvent.setup();
      renderAccountMenu("dropdown");

      await user.click(screen.getByRole("button", { name: /account menu/i }));

      expect(screen.getByText(/^profile$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/all users/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^logout$/i)).toBeInTheDocument();
    });

    it("closes the menu when clicking outside of it", async () => {
      const user = userEvent.setup();
      renderAccountMenu("dropdown");

      await user.click(screen.getByRole("button", { name: /account menu/i }));
      expect(screen.getByText(/^profile$/i)).toBeInTheDocument();

      await user.click(document.body);

      expect(screen.queryByText(/^profile$/i)).not.toBeInTheDocument();
    });

    it("calls logout when the Logout link is clicked", async () => {
      const user = userEvent.setup();
      const logoutMock = vi.fn();
      renderAccountMenu("dropdown", { logout: logoutMock });

      await user.click(screen.getByRole("button", { name: /account menu/i }));
      await user.click(screen.getByLabelText(/^logout$/i));

      expect(logoutMock).toHaveBeenCalledTimes(1);
      // Menu should also close after logout
      expect(screen.queryByText(/^profile$/i)).not.toBeInTheDocument();
    });
  });

  describe("inline variant", () => {
    it("always shows the name, Profile, Users, and Logout links without a toggle", () => {
      renderAccountMenu("inline");

      expect(screen.getByText("Jane Doe")).toBeInTheDocument();
      expect(screen.getByText(/^profile$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/all users/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^logout$/i)).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /account menu/i })).not.toBeInTheDocument();
    });

    it("calls logout when the Logout link is clicked", async () => {
      const user = userEvent.setup();
      const logoutMock = vi.fn();
      renderAccountMenu("inline", { logout: logoutMock });

      await user.click(screen.getByLabelText(/^logout$/i));

      expect(logoutMock).toHaveBeenCalledTimes(1);
    });
  });
});
