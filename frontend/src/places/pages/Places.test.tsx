import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Places from "./Places";
import { TestProviders, createTestQueryClient } from "../../test-utils";

const sendRequestMock = vi.fn();

vi.mock("../../shared/hooks/http-hook", () => ({
  useHttpClient: () => ({
    sendRequest: sendRequestMock,
    isLoading: false,
    error: null,
    clearError: vi.fn(),
  }),
}));

vi.mock("../../shared/components/UIElements/Map", () => ({
  default: ({ center }: { center: { lat: number; lng: number } }) => (
    <div data-testid="mock-map">{`Map at ${center.lat},${center.lng}`}</div>
  ),
}));

const testAuthValue = {
  userId: "user1",
  token: "fake-token",
  name: "Jane Doe",
  image: null,
};

const placeA = {
  id: "place1",
  image: "https://example.com/parkA.jpg",
  title: "Central Park",
  description: "A big park in NYC.",
  address: "New York, NY",
  location: { lat: 40.785091, lng: -73.968285 },
  creator: "user1",
  creatorName: "Jane Doe",
  creatorImage: "https://example.com/avatar.jpg",
  createdAt: "2024-01-15T00:00:00.000Z",
};

const placeB = {
  id: "place2",
  image: "https://example.com/parkB.jpg",
  title: "Golden Gate Park",
  description: "A big park in SF.",
  address: "San Francisco, CA",
  location: { lat: 37.769421, lng: -122.486214 },
  creator: "user2",
  creatorName: "Alex Smith",
  creatorImage: "https://example.com/avatar2.jpg",
  createdAt: "2024-02-20T00:00:00.000Z",
};

const renderPlaces = () => {
  return render(
    <TestProviders authValue={testAuthValue} queryClient={createTestQueryClient()}>
      <MemoryRouter>
        <Places />
      </MemoryRouter>
    </TestProviders>
  );
};

describe("Places", () => {
  beforeEach(() => {
    sendRequestMock.mockReset();
  });

  it("renders the list of places once loaded", async () => {
    sendRequestMock.mockResolvedValueOnce({ places: [placeA, placeB] });

    renderPlaces();

    await waitFor(() => {
      expect(screen.getByText("Central Park")).toBeInTheDocument();
    });
    expect(screen.getByText("Golden Gate Park")).toBeInTheDocument();
  });

  it("shows an empty state when there are no places", async () => {
    sendRequestMock.mockResolvedValueOnce({ places: [] });

    renderPlaces();

    await waitFor(() => {
      expect(screen.getByText(/no places found/i)).toBeInTheDocument();
    });
    expect(screen.getByRole("link", { name: /share place/i })).toBeInTheDocument();
  });

  it("shows an error message when fetching places fails", async () => {
    sendRequestMock.mockRejectedValueOnce(new Error("Fetching places failed."));

    renderPlaces();

    await waitFor(() => {
      expect(screen.getByText(/fetching places failed/i)).toBeInTheDocument();
    });
  });

  it("removes a place from the list after it's deleted", async () => {
    const user = userEvent.setup();
    sendRequestMock.mockResolvedValueOnce({ places: [placeA, placeB] }); // initial GET
    sendRequestMock.mockResolvedValueOnce({ message: "Deleted place" }); // DELETE
    sendRequestMock.mockResolvedValueOnce({ places: [placeB] }); // refetch after delete

    renderPlaces();

    await waitFor(() => {
      expect(screen.getByText("Central Park")).toBeInTheDocument();
    });

    // placeA belongs to auth.userId, so it has a Delete option
    const postOptionButtons = screen.getAllByRole("button", { name: /post options/i });
    await user.click(postOptionButtons[0]);
    await user.click(screen.getByText(/^delete$/i));
    await user.click(screen.getByRole("button", { name: /^delete$/i }));

    await waitFor(() => {
      expect(screen.queryByText("Central Park")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Golden Gate Park")).toBeInTheDocument();
  });

  it("shows numbered pagination controls when there is more than one page", async () => {
    sendRequestMock.mockResolvedValueOnce({
      places: [placeA],
      pagination: { currentPage: 1, totalPages: 2, totalCount: 11, hasMore: true },
    });

    renderPlaces();

    await waitFor(() => {
      expect(screen.getByText("Central Park")).toBeInTheDocument();
    });

    expect(screen.getByRole("navigation", { name: /places pagination/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "1" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^prev$/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /^next$/i })).toBeEnabled();
  });

  it("does not show pagination controls when everything fits on one page", async () => {
    sendRequestMock.mockResolvedValueOnce({
      places: [placeA, placeB],
      pagination: { currentPage: 1, totalPages: 1, totalCount: 2, hasMore: false },
    });

    renderPlaces();

    await waitFor(() => {
      expect(screen.getByText("Central Park")).toBeInTheDocument();
    });

    expect(screen.queryByRole("navigation", { name: /places pagination/i })).not.toBeInTheDocument();
  });

  it("fetches the next page when Next is clicked", async () => {
    const user = userEvent.setup();
    sendRequestMock.mockResolvedValueOnce({
      places: [placeA],
      pagination: { currentPage: 1, totalPages: 2, totalCount: 11, hasMore: true },
    });
    sendRequestMock.mockResolvedValueOnce({
      places: [placeB],
      pagination: { currentPage: 2, totalPages: 2, totalCount: 11, hasMore: false },
    });

    renderPlaces();

    await waitFor(() => {
      expect(screen.getByText("Central Park")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /^next$/i }));

    await waitFor(() => {
      expect(screen.getByText("Golden Gate Park")).toBeInTheDocument();
    });
    expect(sendRequestMock).toHaveBeenLastCalledWith(
      expect.stringContaining("page=2")
    );
  });
});
