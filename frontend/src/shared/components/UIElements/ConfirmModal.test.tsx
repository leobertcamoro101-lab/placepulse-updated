import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConfirmModal from "./ConfirmModal";

const baseProps = {
  title: "Delete this place?",
  message: "This action cannot be undone.",
};

describe("ConfirmModal", () => {
  it("renders nothing when show is false", () => {
    render(
      <ConfirmModal
        {...baseProps}
        show={false}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.queryByText(baseProps.title)).not.toBeInTheDocument();
    expect(screen.queryByText(baseProps.message)).not.toBeInTheDocument();
  });

  it("renders the title, message, and default button labels when shown", () => {
    render(
      <ConfirmModal
        {...baseProps}
        show={true}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText(baseProps.title)).toBeInTheDocument();
    expect(screen.getByText(baseProps.message)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^confirm$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^cancel$/i })).toBeInTheDocument();
  });

  it("renders custom confirm/cancel labels instead of the defaults", () => {
    render(
      <ConfirmModal
        {...baseProps}
        show={true}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
        confirmText="Delete"
        cancelText="Keep it"
      />
    );

    expect(screen.getByRole("button", { name: /^delete$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^keep it$/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^confirm$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^cancel$/i })).not.toBeInTheDocument();
  });

  it("calls onConfirm when the confirm button is clicked", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <ConfirmModal {...baseProps} show={true} onCancel={onCancel} onConfirm={onConfirm} />
    );

    await user.click(screen.getByRole("button", { name: /^confirm$/i }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("calls onCancel when the cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <ConfirmModal {...baseProps} show={true} onCancel={onCancel} onConfirm={onConfirm} />
    );

    await user.click(screen.getByRole("button", { name: /^cancel$/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("calls onCancel when the close (X) button is clicked", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <ConfirmModal {...baseProps} show={true} onCancel={onCancel} onConfirm={onConfirm} />
    );

    await user.click(screen.getByRole("button", { name: /close/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
