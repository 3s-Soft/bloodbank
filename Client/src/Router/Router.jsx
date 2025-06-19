import {
    createBrowserRouter,

} from "react-router";
import Root from "../Layout/Root";


export const router = createBrowserRouter([
    {
        path: "/",
        Component: Root,

        errorElement: <div>Error loading page</div>,
        children: [
            {
                index: true,
                path: "/",
                element: <div>Home Page</div>
            },
            {

            }]
    },
])