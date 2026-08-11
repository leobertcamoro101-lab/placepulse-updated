import { createContext } from "react";

// Default `true` so Map (and anything else) behaves normally
// when it's NOT inside a Modal.
const ModalTransitionContext = createContext<boolean>(true);

export default ModalTransitionContext;