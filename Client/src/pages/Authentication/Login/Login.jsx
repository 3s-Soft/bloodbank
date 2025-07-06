import { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Heart,
  ArrowRight,
  UserPlus,
} from "lucide-react";
import { Link } from "react-router";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Login Data:", form);
      alert("Login successful! Welcome back to Blood Bank BD.");

      // Reset form
      setForm({
        email: "",
        password: "",
        rememberMe: false,
      });
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please check your credentials and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Login Form */}
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="rounded-2xl shadow-lg p-8 border">
          <div className="text-center mb-8">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Sign In</h2>
            <p className="">Access your donor account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5" />
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
              <label className="block text-sm font-semibold mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 h-5 w-5 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                className="text-sm text-[#d1444a] hover:text-red-700 font-semibold transition-colors cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center space-x-2 py-3 rounded-lg font-semibold transition-all cursor-pointer ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#d1444a] hover:bg-red-600 hover:shadow-lg transform hover:-translate-y-0.5"
              } text-white`}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="mb-4">Don't have an account?</p>
            <Link
              to="/register"
              className="inline-flex items-center space-x-2 text-[#d1444a] font-semibold hover:text-red-700 transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              <span>Create new account</span>
            </Link>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="mt-6 text-center">
          <p className="text-sm ">
            Need help? Contact us at{" "}
            <a
              href="tel:+8801234567890"
              className="text-[#d1444a] font-semibold hover:text-red-700"
            >
              +880 1627323206
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
