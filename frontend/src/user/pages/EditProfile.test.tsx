import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { QueryClient } from "@tanstack/react-query";
import EditProfile from "./EditProfile";
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

const loadedUserData = {
  id: "user1",
  firstName: "Jane",
  lastName: "Doe",
  name: "Jane Doe",
  email: "jane@example.com",
  image: "https://example.com/avatar.jpg",
  birthday: "1995-05-20T00:00:00.000Z",
  gender: "female",
};

const testAuthValue = {
  token: "fake-token",
  userId: "user1",
  name: "Jane Doe",
  image: null,
  updateUserInfo: vi.fn(),
};

const renderEditProfile = (
  queryClient: QueryClient,
  authValue: Partial<typeof testAuthValue> = {}
) => {
  return render(
    <TestProviders authValue={{ ...testAuthValue, ...authValue }} queryClient={queryClient}>
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<EditProfile />} />
          <Route path="/profile" element={<div>Profile Page</div>} />
        </Routes>
      </MemoryRouter>
    </TestProviders>
  );
};

describe("EditProfile", () => {
  beforeEach(() => {
    sendRequestMock.mockReset();
  });

  it("loads the user and pre-fills the form with an enabled Save button", async () => {
    sendRequestMock.mockResolvedValueOnce({ user: loadedUserData });

    renderEditProfile(createTestQueryClient());

    // Nothing to edit yet — heading only appears once the fetch resolves.
    expect(screen.queryByRole("heading", { name: /edit profile/i })).not.toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /edit profile/i })).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/first name/i)).toHaveValue("Jane");
    expect(screen.getByLabelText(/last name/i)).toHaveValue("Doe");
    expect(screen.getByLabelText(/^email$/i)).toHaveValue("jane@example.com");
    expect(screen.getByLabelText(/gender/i)).toHaveValue("female");

    // Fields already carry valid loaded data, so Save should be enabled
    // immediately without the user touching anything.
    expect(screen.getByRole("button", { name: /save changes/i })).toBeEnabled();
  });

  it("submits an edited field and updates auth/cache/navigation on success", async () => {
    const user = userEvent.setup();
    const updateUserInfoMock = vi.fn();
    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    sendRequestMock.mockResolvedValueOnce({ user: loadedUserData }); // initial GET
    sendRequestMock.mockResolvedValueOnce({
      user: { ...loadedUserData, firstName: "Janet", name: "Janet Doe" },
    }); // PATCH response

    renderEditProfile(queryClient, { updateUserInfo: updateUserInfoMock });

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /edit profile/i })).toBeInTheDocument();
    });

    const firstNameField = screen.getByLabelText(/first name/i);
    await user.clear(firstNameField);
    await user.type(firstNameField, "Janet");

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText(/profile page/i)).toBeInTheDocument();
    });

    // Verify the PATCH request itself
    const [url, method, body, headers] = sendRequestMock.mock.calls[1];
    expect(url).toContain("/users/user1");
    expect(method).toBe("PATCH");
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get("firstName")).toBe("Janet");
    expect((body as FormData).get("email")).toBe("jane@example.com");
    expect(headers).toEqual({ Authorization: "Bearer fake-token" });

    expect(updateUserInfoMock).toHaveBeenCalledWith("Janet Doe", loadedUserData.image);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["user", "user1"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["users"] });
  });

  it("shows an error message when loading the profile fails", async () => {
    sendRequestMock.mockRejectedValueOnce(
      new Error("Fetching user failed, please try again later")
    );

    renderEditProfile(createTestQueryClient());

    await waitFor(() => {
      expect(
        screen.getByText(/fetching user failed, please try again later/i)
      ).toBeInTheDocument();
    });
  });

  it("shows an error message when saving changes fails", async () => {
    const user = userEvent.setup();
    sendRequestMock.mockResolvedValueOnce({ user: loadedUserData }); // initial GET
    sendRequestMock.mockRejectedValueOnce(
      new Error("Updating profile failed, please try again.")
    ); // PATCH failure

    renderEditProfile(createTestQueryClient());

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /edit profile/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/updating profile failed, please try again/i)
      ).toBeInTheDocument();
    });
  });
});
