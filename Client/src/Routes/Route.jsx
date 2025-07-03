import { createBrowserRouter } from "react-router";
import MainLayout from "../Layout/MainLayout";
import Home from "../pages/Home/Home";
import About from "../pages/AboutUs/About";

let router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,

    errorElement: <div>Page Not Found</div>,

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