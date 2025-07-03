import React from 'react';
import { Link } from 'react-router';

const Error = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 text-center">
            <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
            <p className="text-gray-600 mb-6">
                Sorry, the page you are looking for doesn't exist or has been moved.
            </p>
            <Link
                to="/"
                className="inline-block bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
            >
                Back to Home
            </Link>
        </div>
    );
};

export default Error;
