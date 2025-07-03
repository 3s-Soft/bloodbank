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
    <div className="min-h-[70vh] text-white py-12 flex items-center justify-center">
      <div className="w-full max-w-6xl bg-[#2c2c2c] rounded-xl shadow-lg p-6 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Form */}
        <div>
          <h2 className="text-3xl font-bold text-[#d1444a] mb-6">Send Us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-1 text-sm">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded bg-[#222222] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#d1444a]"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded bg-[#222222] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#d1444a]"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="5"
                className="w-full px-4 py-2 rounded bg-[#222222] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#d1444a]"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-[#d1444a] transition-all text-white font-semibold py-2 rounded cursor-pointer"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-[#d1444a] mb-6">Contact Information</h2>
          <ul className="space-y-4 text-gray-300 text-md">
            <li className="flex items-start gap-3">
              <FaMapMarkerAlt className="text-[#d1444a] mt-1" />
              <span>123, Dhaka City, Bangladesh</span>
            </li>
            <li className="flex items-start gap-3">
              <FaPhone className="text-[#d1444a] mt-1" />
              <span>+880 1234 567890</span>
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
