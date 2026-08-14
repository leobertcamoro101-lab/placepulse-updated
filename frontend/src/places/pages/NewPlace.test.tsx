import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { QueryClient } from "@tanstack/react-query";
import NewPlace from "./NewPlace";
import { TestProviders } from "../../test-utils";

const sendRequestMock = vi.fn();

// NewPlace.tsx calls the real backend through useHttpClient — mock it so
// tests never make a real network request.
vi.mock("../../shared/hooks/http-hook", () => ({
  useHttpClient: () => ({
    sendRequest: sendRequestMock,
    isLoading: false,
    error: null,
    clearError: vi.fn(),
  }),
}));

const testAuthValue = {
  token: "fake-token",
  userId: "user1",
  name: "Jane Doe",
  image: null,
};

const renderNewPlace = (queryClient: QueryClient) => {
  return render(
    <TestProviders authValue={testAuthValue} queryClient={queryClient}>
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<NewPlace />} />
          <Route path="/user1/places" element={<div>User Places Page</div>} />
        </Routes>
      </MemoryRouter>
    </TestProviders>
  );
};

// Fills title, description, and address. Image upload is handled separately
// per test since not every test needs a valid image.
const fillTextFields = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(
    screen.getByPlaceholderText(/what.s the name of the place/i),
    "Test Place"
  );
  await user.type(
    screen.getByPlaceholderText(/share more about this place/i),
    "A lovely spot to visit."
  );
  await user.type(screen.getByPlaceholderText(/^address$/i), "123 Main St");
};

const uploadImage = async (user: ReturnType<typeof userEvent.setup>) => {
  const file = new File(["dummy content"], "photo.jpg", { type: "image/jpeg" });
  const fileInput = document.getElementById("image") as HTMLInputElement;
  await user.upload(fileInput, file);
};

describe("NewPlace", () => {
  beforeEach(() => {
    sendRequestMock.mockReset();
  });

  it("renders the create post form with the submit button disabled", () => {
    renderNewPlace(new QueryClient());

    expect(screen.getByRole("heading", { name: /create post/i })).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/what.s the name of the place, jane\?/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^post$/i })).toBeDisabled();
  });

  it("enables the submit button once all fields and an image are provided", async () => {
    const user = userEvent.setup();
    renderNewPlace(new QueryClient());

    await fillTextFields(user);
    await uploadImage(user);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^post$/i })).toBeEnabled();
    });
  });

  it("submits the place, invalidates place queries, and navigates to the user's places page", async () => {
    const user = userEvent.setup();
    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    sendRequestMock.mockResolvedValueOnce({
      place: { id: "place1", title: "Test Place" },
    });

    renderNewPlace(queryClient);

    await fillTextFields(user);
    await uploadImage(user);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^post$/i })).toBeEnabled();
    });

    await user.click(screen.getByRole("button", { name: /^post$/i }));

    await waitFor(() => {
      expect(screen.getByText(/user places page/i)).toBeInTheDocument();
    });

    // Verify the request itself
    const [url, method, body, headers] = sendRequestMock.mock.calls[0];
    expect(url).toContain("/places/");
    expect(method).toBe("POST");
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get("title")).toBe("Test Place");
    expect((body as FormData).get("address")).toBe("123 Main St");
    expect(headers).toEqual({ Authorization: "Bearer fake-token" });

    // Verify both place caches were invalidated
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["places"] });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["places", "user", "user1"],
    });
  });

  it("shows an error message when place creation fails", async () => {
    const user = userEvent.setup();
    sendRequestMock.mockRejectedValueOnce(new Error("Creating place failed, please try again."));

    renderNewPlace(new QueryClient());

    await fillTextFields(user);
    await uploadImage(user);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^post$/i })).toBeEnabled();
    });

    await user.click(screen.getByRole("button", { name: /^post$/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/creating place failed, please try again/i)
      ).toBeInTheDocument();
    });
  });
});
