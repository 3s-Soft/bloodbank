import React, { useState } from "react";

const RequestBlood = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    bloodGroup: "",
    district: "",
    hospital: "",
    location: "",
    date: "",
    message: "",
    isEmergency: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle submission (API call or storage)
    console.log(formData);
    alert("Blood request submitted successfully!");
    setFormData({
      name: "",
      phone: "",
      bloodGroup: "",
      district: "",
      hospital: "",
      location: "",
      date: "",
      message: "",
      isEmergency: false,
    });
  };

  return (
    <div className="min-h-[70vh] px-4 py-12 flex justify-center items-center">
      <div className="w-full max-w-3xl p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-[#d1444a] mb-6 text-center">
          Request for Blood
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-8">
            <div>
              <label className="block mb-1 text-sm">Your Name</label>
              <input
                type="text"
                name="name"
                placeholder="EX: Jashedul Islam"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded border border-gray-600 focus:outline-none focus:ring"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">Phone Number</label>
              <input
                type="text"
                name="phone"
                placeholder="+8801#########"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded border border-gray-600 focus:outline-none focus:ring"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">Blood Group</label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 rounded border border-gray-600 focus:outline-none focus:ring`}
              >
                <option value="" className="bg-gray-800 text-white">
                  Blood Group
                </option>
                <option value="A+" className="bg-gray-800 text-white">
                  A+
                </option>
                <option value="A-" className="bg-gray-800 text-white">
                  A-
                </option>
                <option value="B+" className="bg-gray-800 text-white">
                  B+
                </option>
                <option value="B-" className="bg-gray-800 text-white">
                  B-
                </option>
                <option value="AB+" className="bg-gray-800 text-white">
                  AB+
                </option>
                <option value="AB-" className="bg-gray-800 text-white">
                  AB-
                </option>
                <option value="O+" className="bg-gray-800 text-white">
                  O+
                </option>
                <option value="O-" className="bg-gray-800 text-white">
                  O-
                </option>
              </select>
            </div>
            <div>
              <label className="block mb-1 text-sm">District</label>
              <input
                type="text"
                name="district"
                placeholder="EX: Dhaka"
                value={formData.district}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded border border-gray-600 focus:outline-none focus:ring"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">Hospital/Clinic Name</label>
              <input
                type="text"
                name="hospital"
                placeholder="EX: Dhaka Medical"
                value={formData.hospital}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded border border-gray-600 focus:outline-none focus:ring"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">Details Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="EX: Room 201, 2nd Floor, Emergency Ward"
                className="w-full px-4 py-2 rounded border border-gray-600 focus:outline-none focus:ring"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">Required Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded border border-gray-600 focus:outline-none focus:ring"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isEmergency"
                checked={formData.isEmergency}
                onChange={handleChange}
                className="mr-2 w-4 h-4 accent-[#d1444a]"
              />
              <label htmlFor="isEmergency" className="text-sm">
                This is an{" "}
                <span className="font-semibold uppercase text-red-400">
                  emergency
                </span>{" "}
                request
              </label>
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm">
              Additional Message (Optional)
            </label>
            <textarea
              name="message"
              placeholder="Type Your Message Here...."
              value={formData.message}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 rounded border border-gray-600 focus:outline-none focus:ring"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-[#d1444a] hover:bg-red-700 transition-all duration-300 text-white font-semibold py-2 rounded cursor-pointer"
          >
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestBlood;
