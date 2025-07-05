import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Droplets,
  Heart,
  Shield,
  Eye,
  EyeOff,
  Calendar,
  UserCheck,
} from "lucide-react";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    // Personal Information
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    nidNumber: "",

    // Address Information
    divisionId: "",
    districtId: "",
    upazilaId: "",
    unionId: "",
    address: "",

    // Blood Information
    bloodType: "",
    weight: "",
    lastDonation: "",
    medicalConditions: "",
    medications: "",
    isEligible: true,

    // Account Information
    password: "",
    confirmPassword: "",
    agreeTerms: false,
    emergencyContact: "",
    emergencyPhone: "",
  });

  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);
  const [unions, setUnions] = useState([]);

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const genders = ["Male", "Female", "Other"];

  console.log(form.divisionId);

  // Load Divisions
  useEffect(() => {
    fetch("https://bdapi.vercel.app/api/v.1/division")
      .then((res) => res.json())
      .then((data) => setDivisions(data.data || []))
      .catch((error) => console.error("Error fetching divisions:", error));
  }, []);

  // Load Districts when division changes
  useEffect(() => {
    if (form.divisionId) {
      fetch(`https://bdapi.vercel.app/api/v.1/district/${form.divisionId}`)
        .then((res) => res.json())
        .then((data) => setDistricts(data.data || []))
        .catch((error) => console.error("Error fetching districts:", error));
    } else {
      setDistricts([]);
      setUpazilas([]);
      setUnions([]);
    }
  }, [form.divisionId]);

  // Load Upazilas when district changes
  useEffect(() => {
    if (form.districtId) {
      fetch(`https://bdapi.vercel.app/api/v.1/upazilla/${form.districtId}`)
        .then((res) => res.json())
        .then((data) => setUpazilas(data.data || []))
        .catch((error) => console.error("Error fetching upazilas:", error));
    } else {
      setUpazilas([]);
      setUnions([]);
    }
  }, [form.districtId]);

  // Load Unions when upazila changes
  useEffect(() => {
    if (form.upazilaId) {
      fetch(`https://bdapi.vercel.app/api/v.1/union/${form.upazilaId}`)
        .then((res) => res.json())
        .then((data) => setUnions(data.data || []))
        .catch((error) => console.error("Error fetching unions:", error));
    } else {
      setUnions([]);
    }
  }, [form.upazilaId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
        ...(name === "divisionId" && {
          districtId: "",
          upazilaId: "",
          unionId: "",
        }),
        ...(name === "districtId" && {
          upazilaId: "",
          unionId: "",
        }),
        ...(name === "upazilaId" && {
          unionId: "",
        }),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      return alert("Passwords do not match!");
    }

    if (!form.agreeTerms) {
      return alert("Please accept the terms and conditions!");
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Registration Data:", form);
      alert("Registration successful! Welcome to the Blood Bank community.");

      // Reset form
      setForm({
        name: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        gender: "",
        nidNumber: "",
        divisionId: "",
        districtId: "",
        upazilaId: "",
        unionId: "",
        address: "",
        bloodType: "",
        weight: "",
        lastDonation: "",
        medicalConditions: "",
        medications: "",
        isEligible: true,
        password: "",
        confirmPassword: "",
        agreeTerms: false,
        emergencyContact: "",
        emergencyPhone: "",
      });
      setCurrentStep(1);
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              currentStep >= 1
                ? "bg-red-600 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            <User className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium">Personal Info</span>
        </div>
        <div className="flex items-center space-x-2">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              currentStep >= 2
                ? "bg-red-600 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            <MapPin className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium">Address</span>
        </div>
        <div className="flex items-center space-x-2">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              currentStep >= 3
                ? "bg-red-600 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            <Droplets className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium">Blood Info</span>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-red-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / 3) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Personal Information
        </h3>
        <p className="text-gray-600">Tell us about yourself</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Phone Number *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
              placeholder="01XXXXXXXXX"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Date of Birth *
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="date"
              name="dateOfBirth"
              value={form.dateOfBirth}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Gender *
          </label>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
          >
            <option value="">Select Gender</option>
            {genders.map((gender) => (
              <option key={gender} value={gender}>
                {gender}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            NID Number *
          </label>
          <input
            type="text"
            name="nidNumber"
            value={form.nidNumber}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
            placeholder="Enter your NID number"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Emergency Contact Name *
          </label>
          <input
            type="text"
            name="emergencyContact"
            value={form.emergencyContact}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
            placeholder="Emergency contact name"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Emergency Contact Phone *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="tel"
              name="emergencyPhone"
              value={form.emergencyPhone}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
              placeholder="01XXXXXXXXX"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Address Information
        </h3>
        <p className="text-gray-600">Where are you located?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Division *
          </label>
          <select
            name="divisionId"
            value={form.divisionId}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
          >
            <option value="">Select Division</option>
            {divisions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            District *
          </label>
          <select
            name="districtId"
            value={form.districtId}
            onChange={handleChange}
            required
            disabled={!districts.length}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all disabled:bg-gray-100"
          >
            <option value="">Select District</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Upazila *
          </label>
          <select
            name="upazilaId"
            value={form.upazilaId}
            onChange={handleChange}
            required
            disabled={!upazilas.length}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all disabled:bg-gray-100"
          >
            <option value="">Select Upazila</option>
            {upazilas.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Union *
          </label>
          <select
            name="unionId"
            value={form.unionId}
            onChange={handleChange}
            required
            disabled={!unions.length}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all disabled:bg-gray-100"
          >
            <option value="">Select Union</option>
            {unions.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Detailed Address *
        </label>
        <textarea
          name="address"
          value={form.address}
          onChange={handleChange}
          required
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
          placeholder="Enter your detailed address (house number, street, etc.)"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Droplets className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Blood & Medical Information
        </h3>
        <p className="text-gray-600">Help us help others</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Blood Type *
          </label>
          <select
            name="bloodType"
            value={form.bloodType}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
          >
            <option value="">Select Blood Type</option>
            {bloodTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Weight (kg) *
          </label>
          <input
            type="number"
            name="weight"
            value={form.weight}
            onChange={handleChange}
            required
            min="45"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
            placeholder="Enter weight in kg"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Last Blood Donation
          </label>
          <input
            type="date"
            name="lastDonation"
            value={form.lastDonation}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Password *
          </label>
          <div className="relative">
            <Shield className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
              placeholder="Create a password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 h-5 w-5 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Confirm Password *
        </label>
        <div className="relative">
          <Shield className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
            placeholder="Confirm your password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-3 h-5 w-5 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Medical Conditions
        </label>
        <textarea
          name="medicalConditions"
          value={form.medicalConditions}
          onChange={handleChange}
          rows={2}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
          placeholder="Any medical conditions? (Optional)"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Current Medications
        </label>
        <textarea
          name="medications"
          value={form.medications}
          onChange={handleChange}
          rows={2}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
          placeholder="Any current medications? (Optional)"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="agreeTerms"
          name="agreeTerms"
          checked={form.agreeTerms}
          onChange={handleChange}
          required
          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
        />
        <label htmlFor="agreeTerms" className="text-sm text-gray-700">
          I agree to the{" "}
          <span className="text-red-600 font-semibold">
            Terms and Conditions
          </span>{" "}
          and <span className="text-red-600 font-semibold">Privacy Policy</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Registration Form */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="rounded-2xl shadow-lg p-8">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-red-600" />
          </div>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Register as a Blood Donor
            </h2>
            <p className="opacity-70">Help save lives in Bangladesh</p>
          </div>

          {renderProgressBar()}

          <form onSubmit={handleSubmit} className="space-y-8">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  currentStep === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Previous
              </button>

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                    isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  } text-white`}
                >
                  {isLoading ? "Registering..." : "Complete Registration"}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Additional Information */}
        <div className="mt-8 bg-red-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-3">
            Why Donate Blood?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-red-700">
            <div className="flex items-start space-x-2">
              <Heart className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <strong>Save Lives:</strong> One donation can save up to 3 lives
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <UserCheck className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <strong>Health Benefits:</strong> Regular donation reduces heart
                disease risk
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Shield className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <strong>Community Impact:</strong> Help your local community in
                emergencies
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
