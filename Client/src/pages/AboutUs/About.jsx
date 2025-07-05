import React from "react";

const About = () => {
  return (
    <div className=" flex flex-col items-center justify-center py-12 min-h-[70vh]">
      <div className="mb-10">
        <img src="https://img.3s-soft.com/uploads/bloodbank_about_image.jpg" alt="" className="rounded-xl border-4 border-red-900" />
      </div>
      <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[#d1444a]">About Blood Bank BD</h1>
      <p className="text-lg md:text-xl text-center max-w-3xl leading-relaxed">
        Blood Bank BD is a community-driven platform dedicated to saving lives by connecting blood donors with recipients across Bangladesh.
        Our mission is to ensure that no one has to struggle to find blood during emergencies.
      </p>
      <div className="mt-10 bg-[#d1444a] text-white px-6 py-3 rounded shadow-lg text-center max-w-md">
        <p className="text-md font-medium">
          Disclaimer: This website is not affiliated with any government or medical authority.
        </p>
      </div>
    </div>
  );
};

export default About;
