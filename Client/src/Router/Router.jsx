import {
    createBrowserRouter,
} from "react-router";
import Root from "../Layout/Root";
import Home from "../pages/Home";
import BloodRequest from "../pages/BloodRequest";
import Login from "../pages/Login";
import Register from "../pages/Register";
import FindDonors from "../pages/FindDonors";
import BloodDrives from "../pages/BloodDrives";
import About from "../pages/About";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";
import AdminDashboard from "../pages/AdminDashboard";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminRoute from "../components/AdminRoute";

export const router = createBrowserRouter([
    {
        path: "/",
        Component: Root,
        errorElement: <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-error mb-4">Oops! Something went wrong</h1>
                <p className="text-lg mb-4">The page you're looking for doesn't exist.</p>
                <a href="/" className="btn btn-primary">Go Home</a>
            </div>
        </div>,
        children: [
            {
                index: true,
                path: "/",
                element: <Home />
            },
            {
                path: "/donors",
                element: <FindDonors />
            },
            {
                path: "/request",
                element: (
                    <ProtectedRoute requireAuth={true}>
                        <BloodRequest />
                    </ProtectedRoute>
                )
            },
            {
                path: "/events",
                element: <BloodDrives />
            },
            {
                path: "/about",
                element: <About />
            },
            {
                path: "/dashboard",
                element: (
                    <ProtectedRoute requireAuth={true}>
                        <Dashboard />
                    </ProtectedRoute>
                )
            },
            {
                path: "/profile",
                element: (
                    <ProtectedRoute requireAuth={true}>
                        <Profile />
                    </ProtectedRoute>
                )
            },
            {
                path: "/settings",
                element: (
                    <ProtectedRoute requireAuth={true}>
                        <Settings />
                    </ProtectedRoute>
                )
            },
            {
                path: "/admin",
                element: (
                    <AdminRoute>
                        <AdminDashboard />
                    </AdminRoute>
                )
            },
            {
                path: "/login",
                element: (
                    <ProtectedRoute requireAuth={false}>
                        <Login />
                    </ProtectedRoute>
                )
            },
            {
                path: "/register",
                element: (
                    <ProtectedRoute requireAuth={false}>
                        <Register />
                    </ProtectedRoute>
                )
            }
        ]
    },
])
