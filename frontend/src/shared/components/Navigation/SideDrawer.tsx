import { useEffect, useState, useRef, ReactNode, MouseEventHandler } from 'react';
import ReactDOM from 'react-dom';

interface SideDrawerProps {
  show: boolean;
  onClick: MouseEventHandler<HTMLElement>;
  children: ReactNode;
}

function SideDrawer({ show, onClick, children }: SideDrawerProps) {
  const [animClass, setAnimClass] = useState('-translate-x-full');
  const [isLeaving, setIsLeaving] = useState(false);
  const wasShown = useRef(show);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
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

  const portalTarget = document.getElementById('drawer-hook');
  if (!portalTarget) return null;

  return ReactDOM.createPortal(content, portalTarget);
}

export default SideDrawer;