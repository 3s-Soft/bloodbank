import React from "react";

const Footer = () => {
  return (
    <footer className="bg-[#222222] text-white py-8 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <h2 className="text-xl font-semibold text-[#d1444a]">
            Blood Bank BD
          </h2>
          <p className="text-sm mt-2 text-gray-300">
            Saving lives through blood donations across Bangladesh.
          </p>
        </div>

        <div className="text-center md:text-right">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Blood Bank BD. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
