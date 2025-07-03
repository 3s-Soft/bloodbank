import React from "react";
import SubNavbar from "../Components/SubNavbar";
import Navbar from "../Components/Navbar";
import { Outlet } from "react-router";
import Footer from "../Components/Footer";

const MainLayout = () => {
  return (
    <>
      <SubNavbar></SubNavbar>
      <Navbar></Navbar>
      <div className="max-w-7xl min-h-[85vh] mx-auto px-5 xl:px-0">
        <Outlet></Outlet>
      </div>
      <Footer></Footer>
    </>
  );
};

export default MainLayout;
