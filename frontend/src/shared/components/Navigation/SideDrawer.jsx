import { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';

function SideDrawer({ show, onClick, children }) {
  const [animClass, setAnimClass] = useState('-translate-x-full');
  const [isLeaving, setIsLeaving] = useState(false);
  const wasShown = useRef(show);

  useEffect(() => {
    let timer;
    if (show) {
      timer = setTimeout(() => {
        setAnimClass('translate-x-0');
      }, 10);
    } else if (wasShown.current) {
      setIsLeaving(true);
      setAnimClass('-translate-x-full');
      timer = setTimeout(() => {
        setIsLeaving(false);
      }, 200);
    }
    wasShown.current = show;
    return () => clearTimeout(timer);
  }, [show]);

  const shouldRender = show || isLeaving;
  if (!shouldRender) return null;

  const content = (
    <aside
      className={`fixed left-0 top-0 z-[100] h-screen w-[70%] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.26)] transition-transform duration-200 ease-in-out ${animClass}`}
      onClick={onClick}
    >
      {children}
    </aside>
  );

  return ReactDOM.createPortal(content, document.getElementById('drawer-hook'));
}

export default SideDrawer;

// import ReactDOM from 'react-dom';
// import { CSSTransition } from 'react-transition-group';

// function SideDrawer  ({ show, onClick, children }) {
//   const content = (
//     <CSSTransition
//       in={show}
//       timeout={200}
//       classNames="slide-in-left"
//       mountOnEnter
//       unmountOnExit
//     >
//       <aside 
//         className="fixed left-0 top-0 z-[100] h-screen w-[70%] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.26)]" 
//         onClick={onClick}
//       >
//         {children}
//       </aside>
//     </CSSTransition>
//   );

//   return ReactDOM.createPortal(content, document.getElementById('drawer-hook'));
// };

// export default SideDrawer;
