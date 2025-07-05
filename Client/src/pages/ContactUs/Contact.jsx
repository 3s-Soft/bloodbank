import React, { useState } from "react";
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    alert("Message sent!");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-[70vh] py-12 flex items-center justify-center">
      <div className="w-full max-w-6xl rounded-xl shadow p-5 md:p-12 flex flex-col-reverse lg:flex-row gap-10">
        {/* Contact Form */}
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-[#d1444a] mb-6">Send Us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-1 text-sm">Name</label>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#d1444a]"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#d1444a]"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">Message</label>
              <textarea
                name="message"
                placeholder="Type Your Message Here..."
                value={formData.message}
                onChange={handleChange}
                required
                rows="5"
                className="w-full px-4 py-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#d1444a]"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-[#d1444a] hover:bg-red-700 transition-all duration-300 font-semibold py-2 rounded cursor-pointer text-white"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col justify-center flex-1">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#d1444a] mb-4 sm:mb-6">Contact Information</h2>
          <ul className="space-y-4 text-md">
            <li className="flex items-start gap-3">
              <FaMapMarkerAlt className="text-[#d1444a] mt-1" />
              <span>Chattogram City, Bangladesh</span>
            </li>
            <li className="flex items-start gap-3">
              <FaPhone className="text-[#d1444a] mt-1" />
              <span>+880 1627323206</span>
            </li>
            <li className="flex items-start gap-3">
              <FaEnvelope className="text-[#d1444a] mt-1" />
              <span>contact@bloodbankbd.com</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Contact;
