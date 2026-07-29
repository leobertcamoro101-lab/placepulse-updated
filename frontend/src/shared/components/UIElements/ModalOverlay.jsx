import { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import Backdrop from "./Backdrop";
import ModalTransitionContext from "../../context/modal-transition-context"; // adjust path to match your tree

const ModalOverlay = ({
  className,
  style,
  headerClass,
  header,
  onSubmit,
  contentClass,
  children,
  footerClass,
  footer,
  show,
}) => {
  const [animClass, setAnimClass] = useState("translate-y-[-10rem] opacity-0");
  const [transitionReady, setTransitionReady] = useState(false);

  useEffect(() => {
    let timer;
    if (show) {
       // reset — opening animation is about to run
      timer = setTimeout(() => {
        setTransitionReady(false);
        setAnimClass("translate-y-0 opacity-100");
      }, 10);
    } else {
      timer = setTimeout(() => {
        setAnimClass("translate-y-[-10rem] opacity-0");
      }, 0);
    }
    return () => clearTimeout(timer);
  }, [show]);

  const handleTransitionEnd = (e) => {
    // only react to the outer content div's own transition, not a bubbled child one
    if (e.target === e.currentTarget) {
        console.log("transition ended, marking modal ready");
      setTransitionReady(true);
    }
  };

  const content = (
    <div
      className={`z-50 fixed top-[10vh] sm:top-[15vh] md:top-[22vh]
        left-2 w-[calc(100%-1rem)]
        sm:left-[5%] sm:w-[90%]
        md:left-[calc(50%-20rem)] md:w-[40rem]
        bg-white shadow-md rounded-lg
        transition-all duration-200 ease-in-out
        max-h-[80vh] overflow-y-auto
        ${animClass}
        ${className || ""}`}
      style={style}
      onTransitionEnd={handleTransitionEnd}
    >
      <header
        className={`w-full px-3 py-3 sm:px-4 sm:py-4 bg-[#2a006e] text-white rounded-t-lg ${headerClass || ""}`}
      >
        <h2 className="mx-1 my-1 text-base sm:text-lg md:text-xl font-semibold">{header}</h2>
      </header>
      <form onSubmit={onSubmit ? onSubmit : (event) => event.preventDefault()}>
        <div className={`p-3 sm:p-4 ${contentClass || ""}`}>
          <ModalTransitionContext.Provider value={transitionReady}>
            {children}
          </ModalTransitionContext.Provider>
        </div>
        <footer className={`px-3 py-3 sm:px-4 sm:py-4 flex justify-end ${footerClass || ""}`}>
          {footer}
        </footer>
      </form>
    </div>
  );

  const portalTarget = document.getElementById("modal-hook");
  if (!portalTarget) {
    return null;
  }

  return ReactDOM.createPortal(content, portalTarget);
};

function Modal({ show, onCancel, ...rest }){
  // `isLeaving` tracks whether the modal is playing its exit animation.
  const [isLeaving, setIsLeaving] = useState(false);
  const wasShown = useRef(show);

  useEffect(() => {
    // when show transitions from true -> false, start exit animation
    if (wasShown.current && !show) {
      setIsLeaving(true);
      const timer = setTimeout(() => {
        setIsLeaving(false);
      }, 200); // match `duration-200` in CSS
      return () => clearTimeout(timer);
    }
    wasShown.current = show;
  }, [show]);

  const shouldRender = show || isLeaving;

  return (
    <>
      {shouldRender && <Backdrop onClick={onCancel} />}
      {shouldRender && (
        <ModalOverlay show={show} onCancel={onCancel} {...rest} />
      )}
    </>
  );
};

export default Modal;