import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LogoImg from '../../../assets/Placepulse-logo.png'

import MainHeader from './MainHeader';
import NavLinks from './NavLinks';
import SideDrawer from './SideDrawer';
import Backdrop from '../UIElements/Backdrop';

function MainNavigation () {
  const [drawerIsOpen, setDrawerIsOpen] = useState(false);

  const openDrawerHandler = () => {
    setDrawerIsOpen(true);
  };

  const closeDrawerHandler = () => {
    setDrawerIsOpen(false);
  };

  return (
    <React.Fragment>
      {drawerIsOpen && <Backdrop onClick={closeDrawerHandler} />}
      <SideDrawer show={drawerIsOpen} onClick={closeDrawerHandler}>
        <nav className="h-full">
          <NavLinks />
        </nav>
      </SideDrawer>

      <MainHeader>
        <button
          className="w-12 h-12 bg-transparent border-none flex flex-col justify-around mr-8 cursor-pointer md:hidden"
          onClick={openDrawerHandler}
        >
          <span className="block w-12 h-[2.5px] bg-[#606366] rounded" />
          <span className="block w-12 h-[2.5px] bg-[#606366] rounded" />
          <span className="block w-12 h-[2.5px] bg-[#606366] rounded" />
        </button>
        <h1 className="text-white">
          <Link to="/" className="no-underline">
            <img src={LogoImg} alt="PlacePulse" className="h-10" />
          </Link>
        </h1>
        <nav className="hidden md:flex md:absolute md:left-1/2 md:-translate-x-1/2">
          <NavLinks />
        </nav>
      </MainHeader>
    </React.Fragment>
  );
};

export default MainNavigation;
