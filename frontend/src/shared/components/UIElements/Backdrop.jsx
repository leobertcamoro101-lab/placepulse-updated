import ReactDOM from 'react-dom';
function Backdrop({ onClick }){
    return ReactDOM.createPortal(
    <div
      className="fixed top-0 left-0 w-full h-screen bg-black bg-opacity-75 z-10"
      onClick={onClick}
    ></div>,
    document.getElementById('backdrop-hook')
  );
}

export default Backdrop;