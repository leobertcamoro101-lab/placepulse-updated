import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ResetPassword from "./ResetPassword";
import { TestProviders } from "../../test-utils";

const sendRequestMock = vi.fn();

vi.mock("../../shared/hooks/http-hook", () => ({
  useHttpClient: () => ({
    sendRequest: sendRequestMock,
    isLoading: false,
    error: null,
    clearError: vi.fn(),
  }),
}));

const renderResetPassword = (token = "sample-reset-token") => {
  return render(
    <TestProviders>
      <MemoryRouter initialEntries={[`/reset-password/${token}`]}>
        <Routes>
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/profile" element={<div>Profile Page</div>} />
        </Routes>
      </MemoryRouter>
    </TestProviders>
  );
};

describe("ResetPassword", () => {
  beforeEach(() => {
    sendRequestMock.mockReset();
  });

  it("renders the form with the submit button disabled", () => {
    renderResetPassword();

    expect(screen.getByRole("heading", { name: /set a new password/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/new password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset password/i })).toBeDisabled();
  });

  it("enables the submit button once a valid password is entered", async () => {
    const user = userEvent.setup();
    renderResetPassword();

    await user.type(screen.getByPlaceholderText(/new password/i), "newpassword123");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /reset password/i })).toBeEnabled();
    });
  });

  it("submits the token from the URL along with the new password", async () => {
    const user = userEvent.setup();
    sendRequestMock.mockResolvedValueOnce({
      message: "Password has been reset successfully.",
    });

    renderResetPassword("token-from-url-abc123");

    await user.type(screen.getByPlaceholderText(/new password/i), "newpassword123");
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /reset password/i })).toBeEnabled();
    });
    await user.click(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /password reset!/i })).toBeInTheDocument();
    });

    expect(sendRequestMock).toHaveBeenCalledWith(
      expect.stringContaining("/users/reset-password"),
      "POST",
      JSON.stringify({ token: "token-from-url-abc123", password: "newpassword123" }),
      { "Content-Type": "application/json" }
    );
  });

  it("navigates to /profile a couple seconds after a successful reset", async () => {
    const user = userEvent.setup();
    sendRequestMock.mockResolvedValueOnce({
      message: "Password has been reset successfully.",
    });

    renderResetPassword();

    await user.type(screen.getByPlaceholderText(/new password/i), "newpassword123");
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /reset password/i })).toBeEnabled();
    });
    await user.click(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /password reset!/i })).toBeInTheDocument();
    });

    // The component waits ~2s before navigating — give waitFor enough room.
    await waitFor(
      () => {
        expect(screen.getByText(/profile page/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("shows an error message when the reset fails", async () => {
    const user = userEvent.setup();
    sendRequestMock.mockRejectedValueOnce(
      new Error("Reset link is invalid or has expired.")
    );

    renderResetPassword();

    await user.type(screen.getByPlaceholderText(/new password/i), "newpassword123");
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /reset password/i })).toBeEnabled();
    });
    await user.click(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/reset link is invalid or has expired/i)
      ).toBeInTheDocument();
    });
  });
});
