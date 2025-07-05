import React from "react";
import { FcGoogle } from "react-icons/fc";

const SocialLogin = () => {
  return (
    <>
      <div className="divider">OR</div>
      <button className="btn bg-white text-black border-[#e5e5e5] w-full">
        <FcGoogle size={25}></FcGoogle>
        Login with Google
      </button>
    </>
  );
};

export default SocialLogin;
