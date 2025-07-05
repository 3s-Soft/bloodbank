import { FcGoogle } from "react-icons/fc";

const Login = () => {
  const handleLogin = async (e) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="max-w-md mx-auto p-6 shadow-md rounded-xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-[#d1444a]">
          Login to Your Account
        </h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
          <button
            type="submit"
            className="w-full bg-[#d1444a] text-white py-2 rounded hover:bg-red-700 transition-all duration-300 cursor-pointer"
          >
            Login
          </button>
        </form>
        <div className="divider"></div>

        <div className="">
          <button className="btn bg-white text-black border-[#e5e5e5] w-full">
            <FcGoogle size={25}></FcGoogle>
            Login with Google
          </button>
        </div>

        <p className="text-sm text-center mt-4">
          Don't have an account?{" "}
          <a
            href="/register"
            className="text-[#d1444a] hover:underline font-bold"
          >
            Register
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
