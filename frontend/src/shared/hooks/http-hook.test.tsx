import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { useHttpClient } from "./http-hook";
import { LoadingContext } from "../context/loading-context";

const startLoadingMock = vi.fn();
const stopLoadingMock = vi.fn();

const wrapper = ({ children }: { children: ReactNode }) => (
  <LoadingContext.Provider value={{ startLoading: startLoadingMock, stopLoading: stopLoadingMock }}>
    {children}
  </LoadingContext.Provider>
);

describe("useHttpClient", () => {
  beforeEach(() => {
    startLoadingMock.mockClear();
    stopLoadingMock.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sets isLoading true and calls startLoading while a request is in flight", async () => {
    let resolveFetch!: (value: unknown) => void;
    const pendingFetch = new Promise((resolve) => {
      resolveFetch = resolve;
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockReturnValue(pendingFetch)
    );

    const { result } = renderHook(() => useHttpClient(), { wrapper });

    let sendPromise!: Promise<unknown>;
    act(() => {
      sendPromise = result.current.sendRequest("http://api.test/thing");
    });

    expect(result.current.isLoading).toBe(true);
    expect(startLoadingMock).toHaveBeenCalledTimes(1);

    resolveFetch({ ok: true, json: async () => ({ data: "done" }) });
    await act(async () => {
      await sendPromise;
    });

    expect(result.current.isLoading).toBe(false);
    expect(stopLoadingMock).toHaveBeenCalledTimes(1);
  });

  it("returns the parsed response data on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ userId: "abc123" }) })
    );

    const { result } = renderHook(() => useHttpClient(), { wrapper });

    let response: unknown;
    await act(async () => {
      response = await result.current.sendRequest("http://api.test/login");
    });

    expect(response).toEqual({ userId: "abc123" });
    expect(result.current.error).toBeUndefined();
  });

  it("sets the error state and rethrows when the response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: "Invalid credentials" }),
      })
    );

    const { result } = renderHook(() => useHttpClient(), { wrapper });

    await act(async () => {
      await expect(result.current.sendRequest("http://api.test/login")).rejects.toThrow(
        "Invalid credentials"
      );
    });

    expect(result.current.error).toBe("Invalid credentials");
    expect(result.current.isLoading).toBe(false);
    expect(stopLoadingMock).toHaveBeenCalledTimes(1);
  });

  it("falls back to a generic message when a non-Error value is thrown", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue("network exploded"));

    const { result } = renderHook(() => useHttpClient(), { wrapper });

    await act(async () => {
      await expect(result.current.sendRequest("http://api.test/x")).rejects.toBe(
        "network exploded"
      );
    });

    expect(result.current.error).toBe("Something went wrong.");
  });

  it("clearError resets the error to undefined", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, json: async () => ({ message: "Nope" }) })
    );

    const { result } = renderHook(() => useHttpClient(), { wrapper });

    await act(async () => {
      await expect(result.current.sendRequest("http://api.test/x")).rejects.toThrow();
    });
    expect(result.current.error).toBe("Nope");

    act(() => {
      result.current.clearError();
    });
    expect(result.current.error).toBeUndefined();
  });

  it("returns undefined without setting an error when the request is aborted", async () => {
    const abortError = new Error("The user aborted a request.");
    abortError.name = "AbortError";
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(abortError));

    const { result } = renderHook(() => useHttpClient(), { wrapper });

    let response: unknown;
    await act(async () => {
      response = await result.current.sendRequest("http://api.test/x");
    });

    expect(response).toBeUndefined();
    expect(result.current.error).toBeUndefined();
    expect(stopLoadingMock).toHaveBeenCalledTimes(1); // context loading state still resets
    // Documented current behavior: the catch block returns immediately on
    // AbortError, before reaching setIsLoading(false) — so local isLoading
    // stays true after an abort even though stopLoading() (the external
    // context) fired correctly above. Harmless in practice since aborts
    // happen on unmount, but this is the hook's real, current behavior.
    expect(result.current.isLoading).toBe(true);
  });

  it("aborts any in-flight request when the component unmounts", async () => {
    let capturedSignal: AbortSignal | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((_url: string, options: RequestInit) => {
        capturedSignal = options.signal as AbortSignal;
        return new Promise(() => {}); // never resolves — simulates an in-flight request
      })
    );

    const { result, unmount } = renderHook(() => useHttpClient(), { wrapper });

    act(() => {
      result.current.sendRequest("http://api.test/slow");
    });

    await waitFor(() => expect(capturedSignal).toBeDefined());
    expect(capturedSignal!.aborted).toBe(false);

    unmount();

    expect(capturedSignal!.aborted).toBe(true);
  });
});
