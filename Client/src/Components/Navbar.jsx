import React from "react";
import { Link, NavLink } from "react-router";
import logo from "../assets/logo.png";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const links = (
    <>
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
    </>
  );
  return (
    <div className="bg-[#D1444A]">
      <div className="navbar shadow-sm max-w-7xl mx-auto">
        <div className="navbar-start">
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {" "}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h8m-8 6h16"
                />{" "}
              </svg>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content rounded-box z-1 mt-3 w-52 p-2 shadow"
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
          <ul className="menu menu-horizontal text-white px-1 gap-3">{links}</ul>
        </div>
        <div className="navbar-end gap-3">
          <div className="">
            <ThemeToggle></ThemeToggle>
          </div>
          {/* <Link className="btn">Dashboard</Link> */}
          <Link
            to={"/login"}
            className="text-[#D1444A] bg-white text-lg font-bold px-6 py-2 rounded-lg"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
