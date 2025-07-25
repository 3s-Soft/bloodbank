import React from "react";
import { Link, NavLink } from "react-router";
import logo from "../assets/logo.png";
import ThemeToggle from "./ThemeToggle";
import { MdMenu } from "react-icons/md";

const Navbar = () => {
  const links = (
    <>
      <li>
        <NavLink
          to={"/"}
          className={({ isActive }) =>
            `text-base font-bold px-2 py-1 rounded  ${
              isActive && "text-[#D1444A] bg-white"
            }`
          }
        >
          Home
        </NavLink>
      </li>
      <li>
        <NavLink
          to={"/about"}
          className={({ isActive }) =>
            `text-base font-bold px-2 py-1 rounded ${
              isActive && "bg-white text-[#D1444A]"
            }`
          }
        >
          About Us
        </NavLink>
      </li>
      <li>
        <NavLink
          to={"/request-blood"}
          className={({ isActive }) =>
            `text-base font-bold px-2 py-1 rounded ${
              isActive && "bg-white text-[#D1444A]"
            }`
          }
        >
          Request Blood
        </NavLink>
      </li>
      <li>
        <NavLink
          to={"/contact"}
          className={({ isActive }) =>
            `text-base font-bold px-2 py-1 rounded ${
              isActive && "bg-white text-[#D1444A]"
            }`
          }
        >
          Contact Us
        </NavLink>
      </li>
    </>
  );
  return (
    <div className="bg-[#D1444A]">
      <div className="navbar max-w-7xl mx-auto">
        <div className="navbar-start">
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
              <MdMenu size={30} className="text-white"></MdMenu>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content rounded-box z-1 mt-3 w-52 p-2 shadow-lg bg-[#d1444a] text-white border border-white"
            >
              {links}
            </ul>
          </div>
          <Link to={"/"}>
            {" "}
            <img src={logo} alt="" className="h-13" />{" "}
          </Link>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="flex items-center text-white px-1 gap-3">
            {links}
          </ul>
        </div>
        <div className="navbar-end gap-3">
          <div className="">
            <ThemeToggle></ThemeToggle>
          </div>
          {/* <Link className="btn">Dashboard</Link> */}
          <Link
            to={"/login"}
            className="text-[#D1444A] bg-white text-lg font-bold px-8 py-1.5 rounded-lg"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
