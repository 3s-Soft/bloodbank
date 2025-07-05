const Register = () => {

  const handleRegister = async (e) => {
    e.preventDefault();
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-xl">
      <h2 className="text-2xl font-bold text-center text-red-600 mb-6">
        Create an Account
      </h2>
      <form onSubmit={handleRegister} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
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
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
        <button
          type="submit"
          className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
        >
          Register
        </button>
      </form>
      <p className="text-sm text-center mt-4">
        Already have an account?{" "}
        <a href="/login" className="text-red-600 hover:underline">
          Login
        </a>
      </p>
    </div>
  );
};

export default Register;
