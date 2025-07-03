import React from "react";
import Marquee from "react-fast-marquee";

const SubNavbar = () => {
  return (
    <div className="py-2 bg-[#222222]">
      <Marquee pauseOnHover>
        <div className="flex gap-8">
          <p className="bg-[#D1444A] text-white text-sm px-4 py-2 rounded">This website is not affiliated with any government or medical authority.</p>
        </div>
      </Marquee>
    </div>
  );
};

export default SubNavbar;
