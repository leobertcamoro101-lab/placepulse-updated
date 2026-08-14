import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InfoModal from "./InfoModal";

const TestIcon = ({ className }: { size?: number; className?: string }) => (
  <svg data-testid="test-icon" className={className} />
);

// The header's X button and the footer's action button can share the same
// accessible name ("Close" is both the header's aria-label and the footer's
// default text) — so tests select each one via its actual container
// (<header>/<footer>, from ModalOverlay) instead of by name alone.
const getHeaderCloseButton = () =>
  document.querySelector("header button[aria-label='Close']") as HTMLButtonElement;

const getFooterButton = () =>
  document.querySelector("footer button") as HTMLButtonElement;

describe("InfoModal", () => {
  it("renders nothing when show is false", () => {
    render(
      <InfoModal show={false} onCancel={vi.fn()} title="Location">
        <p>123 Main St</p>
      </InfoModal>
    );

    expect(screen.queryByText("Location")).not.toBeInTheDocument();
    expect(screen.queryByText("123 Main St")).not.toBeInTheDocument();
  });

  it("renders the title, children, and default close button when shown", () => {
    render(
      <InfoModal show={true} onCancel={vi.fn()} title="Location">
        <p>123 Main St</p>
      </InfoModal>
    );

    expect(screen.getByText("Location")).toBeInTheDocument();
    expect(screen.getByText("123 Main St")).toBeInTheDocument();
    expect(getFooterButton()).toHaveTextContent("Close");
  });

  it("renders a custom close button label when provided", () => {
    render(
      <InfoModal show={true} onCancel={vi.fn()} title="Location" closeText="Got it">
        <p>123 Main St</p>
      </InfoModal>
    );

    expect(getFooterButton()).toHaveTextContent("Got it");
    expect(screen.queryByText("Close")).not.toBeInTheDocument();
  });

  it("does not render an icon when none is provided", () => {
    render(
      <InfoModal show={true} onCancel={vi.fn()} title="Location">
        <p>123 Main St</p>
      </InfoModal>
    );

    expect(screen.queryByTestId("test-icon")).not.toBeInTheDocument();
  });

  it("renders the provided icon", () => {
    render(
      <InfoModal show={true} onCancel={vi.fn()} title="Location" icon={TestIcon}>
        <p>123 Main St</p>
      </InfoModal>
    );

    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });

  it("calls onCancel when the footer close button is clicked", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <InfoModal show={true} onCancel={onCancel} title="Location">
        <p>123 Main St</p>
      </InfoModal>
    );

    await user.click(getFooterButton());

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when the header X button is clicked", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <InfoModal show={true} onCancel={onCancel} title="Location">
        <p>123 Main St</p>
      </InfoModal>
    );

    await user.click(getHeaderCloseButton());

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
