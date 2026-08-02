import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import ModalTransitionContext from "../../context/modal-transition-context";

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
    if (e.target === e.currentTarget) {
      setTransitionReady(true);
    }
  };

  const content = (
    <div
      className={`z-50 fixed top-[10vh] sm:top-[15vh] md:top-[22vh]
        left-2 w-[calc(100%-1rem)]
        sm:left-[5%] sm:w-[90%]
        md:left-[calc(50%-20rem)] md:w-[40rem]
        bg-white shadow-md rounded-lg overflow-hidden
        transition-all duration-200 ease-in-out
        max-h-[80vh] flex flex-col
        ${animClass}
        ${className || ""}`}
      style={style}
      onTransitionEnd={handleTransitionEnd}
    >
      <header
        className={`shrink-0 w-full px-3 py-3 sm:px-4 sm:py-4 bg-[#2a006e] text-white rounded-t-lg ${headerClass || ""}`}
      >
        {typeof header === "string" ? (
          <h2 className="mx-1 my-1 text-base sm:text-lg md:text-xl font-semibold">{header}</h2>
        ) : (
          header
        )}
      </header>
      <form
        onSubmit={onSubmit ? onSubmit : (event) => event.preventDefault()}
        className="flex flex-col flex-1 min-h-0"
      >
        <div className={`flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 ${contentClass || ""}`}>
          <ModalTransitionContext.Provider value={transitionReady}>
            {children}
          </ModalTransitionContext.Provider>
        </div>
        <footer className={`shrink-0 px-3 py-3 sm:px-4 sm:py-4 flex justify-end ${footerClass || ""}`}>
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

export default ModalOverlay;