import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Auth from "./Auth";
import { TestProviders } from "../../test-utils";

const sendRequestMock = vi.fn();

// Auth.tsx calls the real backend through useHttpClient — mock it so tests
// never make a real network request.
vi.mock("../../shared/hooks/http-hook", () => ({
  useHttpClient: () => ({
    sendRequest: sendRequestMock,
    isLoading: false,
    error: null,
    clearError: vi.fn(),
  }),
}));

const renderAuth = (authValue = {}) => {
  return render(
    <TestProviders authValue={authValue}>
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/places" element={<div>Places Page</div>} />
        </Routes>
      </MemoryRouter>
    </TestProviders>
  );
};

describe("Auth", () => {
  beforeEach(() => {
    sendRequestMock.mockReset();
  });

  it("renders the login form by default", () => {
    renderAuth();

    expect(
      screen.getByRole("heading", { name: /log into placepulse/i })
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/mobile number or email/i)
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/^password$/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/first name/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeDisabled();
  });

  it("enables the submit button once a valid email and password are entered", async () => {
    const user = userEvent.setup();
    renderAuth();

    await user.type(
      screen.getByPlaceholderText(/mobile number or email/i),
      "test@example.com"
    );
    await user.type(screen.getByPlaceholderText(/^password$/i), "password123");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /log in/i })).toBeEnabled();
    });
  });

  it("switches to signup mode and shows the extra fields", async () => {
    const user = userEvent.setup();
    renderAuth();

    await user.click(screen.getByRole("button", { name: /create new account/i }));

    expect(
      screen.getByRole("heading", { name: /get started on placepulse/i })
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/first name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/last name/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^sign up$/i })).toBeInTheDocument();
  });

  it("logs in successfully and navigates to /places", async () => {
    const user = userEvent.setup();
    const loginMock = vi.fn();
    sendRequestMock.mockResolvedValueOnce({
      userId: "user1",
      token: "fake-token",
      name: "Test User",
      image: "https://example.com/avatar.jpg",
    });

    renderAuth({ login: loginMock });

    await user.type(
      screen.getByPlaceholderText(/mobile number or email/i),
      "test@example.com"
    );
    await user.type(screen.getByPlaceholderText(/^password$/i), "password123");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /log in/i })).toBeEnabled();
    });

    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText(/places page/i)).toBeInTheDocument();
    });

    expect(sendRequestMock).toHaveBeenCalledWith(
      expect.stringContaining("/users/login"),
      "POST",
      JSON.stringify({ email: "test@example.com", password: "password123" }),
      { "Content-Type": "application/json" }
    );
    expect(loginMock).toHaveBeenCalledWith(
      "user1",
      "fake-token",
      undefined,
      "Test User",
      "https://example.com/avatar.jpg"
    );
  });

  it("shows an error message when login fails", async () => {
    const user = userEvent.setup();
    sendRequestMock.mockRejectedValueOnce(
      new Error("Invalid credentials, could not log you in")
    );

    renderAuth();

    await user.type(
      screen.getByPlaceholderText(/mobile number or email/i),
      "test@example.com"
    );
    await user.type(screen.getByPlaceholderText(/^password$/i), "wrongpass");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /log in/i })).toBeEnabled();
    });

    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/invalid credentials, could not log you in/i)
      ).toBeInTheDocument();
    });
  });
});
