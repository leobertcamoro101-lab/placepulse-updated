import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import PlaceItem from "./PlaceItem";
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

// Real Map likely wraps a mapping library that doesn't run cleanly under
// jsdom — stub it so InfoModal's content is still testable.
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

const baseProps = {
  id: "place1",
  image: "https://example.com/place.jpg",
  title: "Central Park",
  description: "A big park in NYC.",
  address: "59th to 110th St, New York, NY",
  coordinates: { lat: 40.785091, lng: -73.968285 },
  onDelete: vi.fn(),
  creatorName: "Jane Doe",
  creatorImage: "https://example.com/avatar.jpg",
  createdAt: "2024-01-15T00:00:00.000Z",
};

const renderPlaceItem = (props: Partial<typeof baseProps & { creatorId: string }> = {}) => {
  return render(
    <TestProviders authValue={testAuthValue}>
      <MemoryRouter>
        <ul>
          <PlaceItem {...baseProps} {...props} />
        </ul>
      </MemoryRouter>
    </TestProviders>
  );
};

describe("PlaceItem", () => {
  beforeEach(() => {
    sendRequestMock.mockReset();
    baseProps.onDelete = vi.fn();
  });

  it("renders the place details", () => {
    renderPlaceItem({ creatorId: "user1" });

    expect(screen.getByText("Central Park")).toBeInTheDocument();
    expect(screen.getByText("A big park in NYC.")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Central Park" })).toBeInTheDocument();
  });

  it("shows Edit and Delete options for the owner", async () => {
    const user = userEvent.setup();
    renderPlaceItem({ creatorId: "user1" }); // matches auth.userId

    await user.click(screen.getByRole("button", { name: /post options/i }));

    expect(screen.getByText(/view on map/i)).toBeInTheDocument();
    expect(screen.getByText(/^edit$/i)).toBeInTheDocument();
    expect(screen.getByText(/^delete$/i)).toBeInTheDocument();
  });

  it("hides Edit and Delete options for a non-owner", async () => {
    const user = userEvent.setup();
    renderPlaceItem({ creatorId: "someone-else" });

    await user.click(screen.getByRole("button", { name: /post options/i }));

    expect(screen.getByText(/view on map/i)).toBeInTheDocument();
    expect(screen.queryByText(/^edit$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^delete$/i)).not.toBeInTheDocument();
  });

  it("closes the menu when clicking outside of it", async () => {
    const user = userEvent.setup();
    renderPlaceItem({ creatorId: "user1" });

    await user.click(screen.getByRole("button", { name: /post options/i }));
    expect(screen.getByText(/view on map/i)).toBeInTheDocument();

    await user.click(document.body);

    expect(screen.queryByText(/view on map/i)).not.toBeInTheDocument();
  });

  it("opens the map modal showing the address", async () => {
    const user = userEvent.setup();
    renderPlaceItem({ creatorId: "user1" });

    await user.click(screen.getByRole("button", { name: /post options/i }));
    await user.click(screen.getByText(/view on map/i));

    expect(screen.getByTestId("mock-map")).toBeInTheDocument();
    expect(screen.getByTestId("mock-map")).toHaveTextContent("40.785091,-73.968285");
    // The address is used as the InfoModal title, so it now appears twice
    // (once in the post body, once in the modal header) — just confirm the modal opened.
    expect(screen.getAllByText(baseProps.address).length).toBeGreaterThan(1);
  });

  it("shows a confirmation modal before deleting and cancels without deleting", async () => {
    const user = userEvent.setup();
    renderPlaceItem({ creatorId: "user1" });

    await user.click(screen.getByRole("button", { name: /post options/i }));
    await user.click(screen.getByText(/^delete$/i));

    expect(
      screen.getByRole("heading", { name: /delete this place\?/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/all of its data will be permanently removed/i)
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^cancel$/i }));

    expect(sendRequestMock).not.toHaveBeenCalled();
    expect(baseProps.onDelete).not.toHaveBeenCalled();
  });

  it("deletes the place when the delete is confirmed", async () => {
    const user = userEvent.setup();
    sendRequestMock.mockResolvedValueOnce({ message: "Deleted place" });

    renderPlaceItem({ creatorId: "user1" });

    await user.click(screen.getByRole("button", { name: /post options/i }));
    await user.click(screen.getByText(/^delete$/i));
    await user.click(screen.getByRole("button", { name: /^delete$/i }));

    await waitFor(() => {
      expect(baseProps.onDelete).toHaveBeenCalledWith("place1");
    });

    expect(sendRequestMock).toHaveBeenCalledWith(
      expect.stringContaining("/places/place1"),
      "DELETE",
      null,
      { Authorization: "Bearer fake-token" }
    );
  });

  it("does not call onDelete if the delete request fails", async () => {
    const user = userEvent.setup();
    sendRequestMock.mockRejectedValueOnce(new Error("Delete failed"));

    renderPlaceItem({ creatorId: "user1" });

    await user.click(screen.getByRole("button", { name: /post options/i }));
    await user.click(screen.getByText(/^delete$/i));
    await user.click(screen.getByRole("button", { name: /^delete$/i }));

    await waitFor(() => {
      expect(sendRequestMock).toHaveBeenCalled();
    });

    expect(baseProps.onDelete).not.toHaveBeenCalled();
  });
});
