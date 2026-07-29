function MainHeader ({ children }) {
  return (
    <header className="w-full h-16 flex items-center fixed top-0 left-0 bg-[#ff0055] shadow-[0_2px_6px_rgba(0,0,0,0.26)] px-4 z-[5] md:justify-between">
      {children}
    </header>
  );
};

export default MainHeader;
