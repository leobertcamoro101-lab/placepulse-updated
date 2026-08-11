import ReactDOM from 'react-dom';

interface BackdropProps {
  onClick: () => void;
}

function Backdrop({ onClick }: BackdropProps) {
  const portalTarget = document.getElementById('backdrop-hook');
  if (!portalTarget) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed top-0 left-0 w-full h-screen bg-black bg-opacity-75 z-10"
      onClick={onClick}
    ></div>,
    portalTarget
  );
}

export default Backdrop;