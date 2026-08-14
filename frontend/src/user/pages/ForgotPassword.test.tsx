import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ForgotPassword from "./ForgotPassword";
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

const renderForgotPassword = () => {
  return render(
    <TestProviders>
      <MemoryRouter initialEntries={["/forgot-password"]}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    </TestProviders>
  );
};

describe("ForgotPassword", () => {
  beforeEach(() => {
    sendRequestMock.mockReset();
  });

  it("renders the form with the submit button disabled", () => {
    renderForgotPassword();

    expect(screen.getByRole("heading", { name: /forgot password\?/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send reset link/i })).toBeDisabled();
  });

  it("enables the submit button once a valid email is entered", async () => {
    const user = userEvent.setup();
    renderForgotPassword();

    await user.type(screen.getByPlaceholderText(/^email$/i), "test@example.com");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /send reset link/i })).toBeEnabled();
    });
  });

  it("shows the confirmation screen after a successful submission", async () => {
    const user = userEvent.setup();
    sendRequestMock.mockResolvedValueOnce({
      message: "If that email exists, a reset link has been sent.",
    });

    renderForgotPassword();

    await user.type(screen.getByPlaceholderText(/^email$/i), "test@example.com");
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /send reset link/i })).toBeEnabled();
    });
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /check your email/i })).toBeInTheDocument();
    });
    // The form should be gone, replaced by the confirmation message
    expect(screen.queryByPlaceholderText(/^email$/i)).not.toBeInTheDocument();

    expect(sendRequestMock).toHaveBeenCalledWith(
      expect.stringContaining("/users/forgot-password"),
      "POST",
      JSON.stringify({ email: "test@example.com" }),
      { "Content-Type": "application/json" }
    );
  });

  it("shows an error message when the request fails", async () => {
    const user = userEvent.setup();
    sendRequestMock.mockRejectedValueOnce(
      new Error("Something went wrong, please try again later.")
    );

    renderForgotPassword();

    await user.type(screen.getByPlaceholderText(/^email$/i), "test@example.com");
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /send reset link/i })).toBeEnabled();
    });
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/something went wrong, please try again later/i)
      ).toBeInTheDocument();
    });
  });
});
