import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SideDrawer from "./SideDrawer";

describe("SideDrawer", () => {
  it("renders nothing when show is false from the start", () => {
    render(
      <SideDrawer show={false} onClick={vi.fn()}>
        <p>Drawer content</p>
      </SideDrawer>
    );

    expect(screen.queryByText("Drawer content")).not.toBeInTheDocument();
  });

  it("renders its children into the drawer-hook portal when shown", () => {
    render(
      <SideDrawer show={true} onClick={vi.fn()}>
        <p>Drawer content</p>
      </SideDrawer>
    );

    const drawerHook = document.getElementById("drawer-hook");
    expect(drawerHook).toContainElement(screen.getByText("Drawer content"));
  });

  it("calls onClick when the drawer is clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <SideDrawer show={true} onClick={onClick}>
        <p>Drawer content</p>
      </SideDrawer>
    );

    await user.click(screen.getByText("Drawer content"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("keeps rendering briefly while leaving, then unmounts", async () => {
    const { rerender } = render(
      <SideDrawer show={true} onClick={vi.fn()}>
        <p>Drawer content</p>
      </SideDrawer>
    );

    expect(screen.getByText("Drawer content")).toBeInTheDocument();

    rerender(
      <SideDrawer show={false} onClick={vi.fn()}>
        <p>Drawer content</p>
      </SideDrawer>
    );

    // Still present immediately after show flips to false — mid leave-transition
    expect(screen.getByText("Drawer content")).toBeInTheDocument();

    // Gone once the 200ms leave transition finishes
    await waitFor(
      () => {
        expect(screen.queryByText("Drawer content")).not.toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });
});
