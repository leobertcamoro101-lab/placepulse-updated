import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useForm } from "./form-hooks";

describe("useForm", () => {
  it("initializes with the given inputs and form validity", () => {
    const { result } = renderHook(() =>
      useForm({ email: { value: "", isValid: false } }, false)
    );

    const [formState] = result.current;
    expect(formState.inputs.email).toEqual({ value: "", isValid: false });
    expect(formState.isValid).toBe(false);
  });

  it("updates a single input's value and isValid on INPUT_CHANGE", () => {
    const { result } = renderHook(() =>
      useForm({ email: { value: "", isValid: false } }, false)
    );

    act(() => {
      result.current[1]("email", "test@example.com", true);
    });

    const [formState] = result.current;
    expect(formState.inputs.email).toEqual({ value: "test@example.com", isValid: true });
  });

  it("marks the form valid once every input is valid", () => {
    const { result } = renderHook(() =>
      useForm(
        {
          email: { value: "", isValid: false },
          password: { value: "", isValid: false },
        },
        false
      )
    );

    act(() => {
      result.current[1]("email", "test@example.com", true);
    });
    expect(result.current[0].isValid).toBe(false); // password still invalid

    act(() => {
      result.current[1]("password", "password123", true);
    });
    expect(result.current[0].isValid).toBe(true); // both now valid
  });

  it("marks the form invalid if the changed field becomes invalid, even if others are valid", () => {
    const { result } = renderHook(() =>
      useForm(
        {
          email: { value: "test@example.com", isValid: true },
          password: { value: "password123", isValid: true },
        },
        true
      )
    );

    act(() => {
      result.current[1]("email", "not-an-email", false);
    });

    expect(result.current[0].isValid).toBe(false);
    expect(result.current[0].inputs.password).toEqual({
      value: "password123",
      isValid: true,
    });
  });

  it("keeps the form invalid if an untouched field is still invalid", () => {
    const { result } = renderHook(() =>
      useForm(
        {
          firstName: { value: "", isValid: false },
          lastName: { value: "", isValid: false },
        },
        false
      )
    );

    act(() => {
      // Only fill firstName — lastName remains untouched and invalid
      result.current[1]("firstName", "Jane", true);
    });

    expect(result.current[0].isValid).toBe(false);
  });

  it("supports File values for image inputs", () => {
    const { result } = renderHook(() =>
      useForm({ image: { value: undefined, isValid: false } }, false)
    );

    const file = new File(["dummy"], "photo.jpg", { type: "image/jpeg" });

    act(() => {
      result.current[1]("image", file, true);
    });

    expect(result.current[0].inputs.image.value).toBe(file);
    expect(result.current[0].inputs.image.isValid).toBe(true);
  });

  it("replaces all inputs and sets form validity directly via setFormData", () => {
    const { result } = renderHook(() =>
      useForm({ email: { value: "", isValid: false } }, false)
    );

    act(() => {
      result.current[2](
        {
          firstName: { value: "Jane", isValid: true },
          lastName: { value: "Doe", isValid: true },
        },
        true
      );
    });

    const [formState] = result.current;
    expect(formState.inputs).toEqual({
      firstName: { value: "Jane", isValid: true },
      lastName: { value: "Doe", isValid: true },
    });
    expect(formState.isValid).toBe(true);
    // The old "email" input should be gone entirely — SET_DATA replaces,
    // not merges.
    expect(formState.inputs).not.toHaveProperty("email");
  });

  it("setFormData does not recompute validity from the individual inputs", () => {
    const { result } = renderHook(() =>
      useForm({ email: { value: "", isValid: false } }, false)
    );

    act(() => {
      // Every input is invalid, but formValidity is explicitly set to true —
      // SET_DATA trusts the caller rather than recalculating (this is how
      // EditProfile marks the form valid immediately after loading data).
      result.current[2](
        { firstName: { value: "", isValid: false } },
        true
      );
    });

    expect(result.current[0].isValid).toBe(true);
  });

  it("keeps inputHandler and setFormData referentially stable across re-renders", () => {
    const { result, rerender } = renderHook(() =>
      useForm({ email: { value: "", isValid: false } }, false)
    );

    const firstInputHandler = result.current[1];
    const firstSetFormData = result.current[2];

    rerender();

    expect(result.current[1]).toBe(firstInputHandler);
    expect(result.current[2]).toBe(firstSetFormData);
  });
});
