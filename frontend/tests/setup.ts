import "@testing-library/jest-dom";
import { beforeEach } from "vitest";

// ModalOverlay/Backdrop render via ReactDOM.createPortal into these two
// elements, which normally live in index.html. jsdom's test document
// doesn't have them, so portals would silently render nothing — add them
// once per test so any component using Modal/ErrorModal/ConfirmModal/etc.
// actually renders in tests.
beforeEach(() => {
  if (!document.getElementById("modal-hook")) {
    const modalHook = document.createElement("div");
    modalHook.id = "modal-hook";
    document.body.appendChild(modalHook);
  }
  if (!document.getElementById("backdrop-hook")) {
    const backdropHook = document.createElement("div");
    backdropHook.id = "backdrop-hook";
    document.body.appendChild(backdropHook);
  }
});
