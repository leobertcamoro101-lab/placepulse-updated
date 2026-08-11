import { useEffect, useState, useRef, ReactNode } from "react";
import ModalOverlay from "./ModalOverlay";
import Backdrop from "./Backdrop";

interface ModalProps {
  show: boolean;
  onCancel: () => void;
  children: ReactNode;
  [key: string]: unknown;
}

function Modal({ show, onCancel, ...rest }: ModalProps) {
  const [isLeaving, setIsLeaving] = useState(false);
  const wasShown = useRef(show);

  useEffect(() => {
    if (wasShown.current && !show) {
      setIsLeaving(true);
      const timer = setTimeout(() => {
        setIsLeaving(false);
      }, 200);
      return () => clearTimeout(timer);
    }
    wasShown.current = show;
  }, [show]);

  const shouldRender = show || isLeaving;

  return (
    <>
      {shouldRender && <Backdrop onClick={onCancel} />}
      {shouldRender && <ModalOverlay show={show} onCancel={onCancel} {...rest} />}
    </>
  );
}

export default Modal;