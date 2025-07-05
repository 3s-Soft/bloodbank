import React from "react";
import { Link } from "react-router";
import errorLottie from "../../assets/error-lottie.json";
import Lottie from "lottie-react";
import { FaLeftLong } from "react-icons/fa6";

const Error = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <Lottie animationData={errorLottie} loop={true} className="h-[350px]" />
      <div className="-mt-5 space-y-6">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-[#d1444a]">404</h1>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">
              Page Not Found
            </h2>
            <p className="">
              Sorry, the page you are looking for doesn't exist or has been
              moved.
            </p>
          </div>
        </div>
        <Link
          to="/"
          className="flex items-center gap-2 text-white font-bold px-6 py-2 rounded-lg bg-[#d1444a] hover:bg-red-700 transition-all duration-300 w-fit mx-auto"
        >
        <FaLeftLong></FaLeftLong>
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default Error;
