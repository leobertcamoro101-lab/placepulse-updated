import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import RequireAuth from "./RequireAuth";
import { TestProviders } from "../../../test-utils";

const renderGuard = (token: string | null) => {
  return render(
    <TestProviders authValue={{ token }}>
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route path="/" element={<div>Login Page</div>} />
          <Route
            path="/protected"
            element={
              <RequireAuth>
                <div>Protected Content</div>
              </RequireAuth>
            }
          />
        </Routes>
      </MemoryRouter>
    </TestProviders>
  );
};

describe("RequireAuth", () => {
  it("renders the protected children when a token is present", () => {
    renderGuard("fake-token");
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("redirects to / when there is no token", () => {
    renderGuard(null);
    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });
});
