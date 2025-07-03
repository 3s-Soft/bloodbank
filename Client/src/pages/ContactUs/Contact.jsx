import React, { useState } from "react";

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
    // You can add form submission logic here (e.g., API call)
    console.log(formData);
    alert("Message sent!");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-[#222222] text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl bg-[#2c2c2c] rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-[#d1444a] mb-6 text-center">
          Contact Us
        </h2>
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
            className="w-full bg-[#d1444a] hover:bg-red-600 transition-all text-white font-semibold py-2 rounded"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
