import { ReactNode } from 'react';

interface MainHeaderProps {
  children: ReactNode;
}

function MainHeader({ children }: MainHeaderProps) {
  return (
    <header className="w-full h-16 flex items-center fixed top-0 left-0 bg-[#FFFFFF] shadow-[0_2px_6px_rgba(0,0,0,0.26)] px-4 z-[5]">
      {children}
    </header>
  );
}

export default MainHeader;