import { createBrowserRouter } from "react-router";
import MainLayout from "../Layout/MainLayout";
import Home from "../pages/Home/Home";
import About from "../pages/AboutUs/About";
import Error from "../pages/Error/Error";
import Contact from "../pages/ContactUs/Contact";
import RequestBlood from "../pages/RequestBlood/RequestBlood";
import Login from "../pages/Authentication/Login/Login";
import Register from "../pages/Authentication/Register/Register";

let router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,

    errorElement: <Error />,

    children: [
      {
        index: true,
        Component: Home
      },
      {
        path: "/request-blood",
        Component: RequestBlood
      },
      {
        path: "/about",
        Component: About
      },
      {
        path: "/contact",
        Component: Contact
      },
      {
        path: "/login",
        Component: Login
      },
      {
        path: "/register",
        Component: Register
      }
    ]
  },
]);

export default router;