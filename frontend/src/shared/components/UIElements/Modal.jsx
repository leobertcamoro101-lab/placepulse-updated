import { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import Backdrop from "./Backdrop";
import ModalTransitionContext from "../../context/modal-transition-context.js";

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

  // useEffect(() => {
  //   let timer;
  //   if (show) {
  //       setTransitionReady(false);
  //     timer = setTimeout(() => {
  //       setAnimClass("translate-y-0 opacity-100");
  //     }, 10);
  //   } else {
  //     timer = setTimeout(() => {
  //       setAnimClass("translate-y-[-10rem] opacity-0");
  //     }, 0);
  //   }
  //   return () => clearTimeout(timer);
  // }, [show]);
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
        bg-white shadow-md rounded-lg
        transition-all duration-200 ease-in-out
        max-h-[80vh] flex flex-col
        ${animClass}
        ${className || ""}`}
      style={style}
      onTransitionEnd={handleTransitionEnd}
    >
      <header
        className={`shrink-0 w-full px-3 py-3 sm:px-4 sm:py-4 bg-blue-900 text-white rounded-t-lg ${headerClass || ""}`}
      >
        <h2 className="mx-1 my-1 text-base sm:text-lg md:text-xl font-semibold">{header}</h2>
      </header>
      <form onSubmit={onSubmit ? onSubmit : (event) => event.preventDefault()}
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

function Modal({ show, onCancel, ...rest }) {
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

// import ReactDOM from "react-dom";
// import { CSSTransition } from "react-transition-group";

// import Backdrop from "./Backdrop";

// const ModalOverlay = ({
//   className = "",
//   style,
//   headerClass = "",
//   header,
//   onSubmit,
//   contentClass = "",
//   children,
//   footerClass = "",
//   footer,
// }) => {
//   const content = (
//     <div
//       className={`fixed top-[22vh] left-[10%] z-[100] w-[80%] rounded-lg bg-white shadow-[0_2px_8px_rgba(0,0,0,0.26)] md:left-[calc(50%-20rem)] md:w-[40rem] ${className}`}
//       style={style}
//     >
//       <header className={`w-full bg-[#2a006e] p-4 px-2 color-white ${headerClass}`}>
//         <h2 className="m-2 text-xl font-bold">{header}</h2>
//       </header>
      
//       <form onSubmit={onSubmit || ((event) => event.preventDefault())}>
//         <div className={`p-4 px-2 ${contentClass}`}>
//           {children}
//         </div>
//         <footer className={`p-4 px-2 ${footerClass}`}>
//           {footer}
//         </footer>
//       </form>
//     </div>
//   );

//   return ReactDOM.createPortal(content, document.getElementById("modal-hook"));
// };

// const Modal = ({ show, onCancel, ...props }) => {
//   return (
//     <>
//       {show && <Backdrop onClick={onCancel} />}
//       <CSSTransition
//         in={show}
//         mountOnEnter
//         unmountOnExit
//         timeout={200}
//         classNames={{
//           enter: "translate-y-[-10rem] opacity-0",
//           enterActive: "translate-y-0 opacity-100 transition-all duration-200",
//           exit: "translate-y-0 opacity-100",
//           exitActive: "translate-y-[-10rem] opacity-0 transition-all duration-200",
//         }}
//       >
//         <ModalOverlay {...props} />
//       </CSSTransition>
//     </>
//   );
// };

// export default Modal;
// import React, { useEffect, useState, useRef } from "react";
// import ReactDOM from "react-dom";
// import Backdrop from "./Backdrop";
// import ModalTransitionContext from '../../context/modal-transition-context.js';

// const ModalOverlay = ({
//   className,
//   style,
//   headerClass,
//   header,
//   onSubmit,
//   contentClass,
//   children,
//   footerClass,
//   footer,
//   show,
// }) => {
//   const [animClass, setAnimClass] = useState("translate-y-[-10rem] opacity-0");
//   const [transitionReady, setTransitionReady] = useState(false);

//   useEffect(() => {
//     let timer;
//     if (show) {
//       // setTransitionReady(false); // reset — opening animation is about to run
//       timer = setTimeout(() => {
//         setAnimClass("translate-y-0 opacity-100");
//       }, 10);
//     } else {
//       timer = setTimeout(() => {
//         setAnimClass("translate-y-[-10rem] opacity-0");
//       }, 0);
//     }
//     return () => clearTimeout(timer);
//   }, [show]);

//   const handleTransitionEnd = (e) => {
//     // only react to the outer content div's own transition, not a bubbled child one
//     if (e.target === e.currentTarget) {
//       setTransitionReady(true);
//     }
//   };

//   const content = (
//     <div
//       className={`z-50 fixed top-[10vh] sm:top-[15vh] md:top-[22vh]
//         left-2 w-[calc(100%-1rem)]
//         sm:left-[5%] sm:w-[90%]
//         md:left-[calc(50%-20rem)] md:w-[40rem]
//         bg-white shadow-md rounded-lg
//         transition-all duration-200 ease-in-out
//         max-h-[80vh] overflow-y-auto
//         ${animClass}
//         ${className || ""}`}
//       style={style}
//       onTransitionEnd={handleTransitionEnd}
//     >
//       <header
//         className={`w-full px-3 py-3 sm:px-4 sm:py-4 bg-[#2a006e] text-white rounded-t-lg ${headerClass || ""}`}
//       >
//         <h2 className="mx-1 my-1 text-base sm:text-lg md:text-xl font-semibold">{header}</h2>
//       </header>
//       <form onSubmit={onSubmit ? onSubmit : (event) => event.preventDefault()}>
//         <div className={`p-3 sm:p-4 ${contentClass || ""}`}>
//           <ModalTransitionContext.Provider value={transitionReady}>
//             {children}
//           </ModalTransitionContext.Provider>
//         </div>
//         <footer className={`px-3 py-3 sm:px-4 sm:py-4 flex justify-end ${footerClass || ""}`}>
//           {footer}
//         </footer>
//       </form>
//     </div>
//   );

//   const portalTarget = document.getElementById("modal-hook");
//   if (!portalTarget) {
//     return null;
//   }

//   return ReactDOM.createPortal(content, portalTarget);
// };

// function Modal({ show, onCancel, ...rest }){
//   // `isLeaving` tracks whether the modal is playing its exit animation.
//   const [isLeaving, setIsLeaving] = useState(false);
//   const wasShown = useRef(show);

//   useEffect(() => {
//     // when show transitions from true -> false, start exit animation
//     if (wasShown.current && !show) {
//       setIsLeaving(true);
//       const timer = setTimeout(() => {
//         setIsLeaving(false);
//       }, 200); // match `duration-200` in CSS
//       return () => clearTimeout(timer);
//     }
//     wasShown.current = show;
//   }, [show]);

//   const shouldRender = show || isLeaving;

//   return (
//     <React.Fragment>
//       {shouldRender && <Backdrop onClick={onCancel} />}
//       {shouldRender && (
//         <ModalOverlay show={show} onCancel={onCancel} {...rest} />
//       )}
//     </React.Fragment>
//   );
// };

// export default Modal;
