import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Users from "./Users";
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

const userA = {
  id: "user1",
  image: "https://example.com/avatar1.jpg",
  name: "Jane Doe",
  places: [],
  createdAt: "2024-01-15T00:00:00.000Z",
};

const userB = {
  id: "user2",
  image: "https://example.com/avatar2.jpg",
  name: "Alex Smith",
  places: [],
  createdAt: "2024-02-20T00:00:00.000Z",
};

const renderUsers = () => {
  return render(
    <TestProviders>
      <MemoryRouter>
        <Users />
      </MemoryRouter>
    </TestProviders>
  );
};

describe("Users", () => {
  beforeEach(() => {
    sendRequestMock.mockReset();
  });

  it("renders the list of users once loaded", async () => {
    sendRequestMock.mockResolvedValueOnce({
      users: [userA, userB],
      pagination: { currentPage: 1, totalPages: 1, totalCount: 2, hasMore: false },
    });

    renderUsers();

    await waitFor(() => {
      expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    });
    expect(screen.getByText("Alex Smith")).toBeInTheDocument();
  });

  it("shows an error message when fetching users fails", async () => {
    sendRequestMock.mockRejectedValueOnce(new Error("Fetching users failed."));

    renderUsers();

    await waitFor(() => {
      expect(screen.getByText(/fetching users failed/i)).toBeInTheDocument();
    });
  });

  it("shows numbered pagination controls when there is more than one page", async () => {
    sendRequestMock.mockResolvedValueOnce({
      users: [userA],
      pagination: { currentPage: 1, totalPages: 2, totalCount: 11, hasMore: true },
    });

    renderUsers();

    await waitFor(() => {
      expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    });

    expect(screen.getByRole("navigation", { name: /users pagination/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "1" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^prev$/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /^next$/i })).toBeEnabled();
  });

  it("does not show pagination controls when everything fits on one page", async () => {
    sendRequestMock.mockResolvedValueOnce({
      users: [userA, userB],
      pagination: { currentPage: 1, totalPages: 1, totalCount: 2, hasMore: false },
    });

    renderUsers();

    await waitFor(() => {
      expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    });

    expect(screen.queryByRole("navigation", { name: /users pagination/i })).not.toBeInTheDocument();
  });

  it("fetches the next page when Next is clicked", async () => {
    const user = userEvent.setup();
    sendRequestMock.mockResolvedValueOnce({
      users: [userA],
      pagination: { currentPage: 1, totalPages: 2, totalCount: 11, hasMore: true },
    });
    sendRequestMock.mockResolvedValueOnce({
      users: [userB],
      pagination: { currentPage: 2, totalPages: 2, totalCount: 11, hasMore: false },
    });

    renderUsers();

    await waitFor(() => {
      expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /^next$/i }));

    await waitFor(() => {
      expect(screen.getByText("Alex Smith")).toBeInTheDocument();
    });
    expect(sendRequestMock).toHaveBeenLastCalledWith(expect.stringContaining("page=2"));
  });
});
