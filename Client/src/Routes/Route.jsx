import { createBrowserRouter } from "react-router";
import MainLayout from "../Layout/MainLayout";
import Home from "../pages/Home/Home";
import About from "../pages/AboutUs/About";
import Error from "../pages/Error/Error";

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
        path: "/about",
        Component: About
      }
    ]
  },
]);

export default router;