// ThemeToggle.jsx
import { MdSunny } from "react-icons/md";
import { FaMoon } from "react-icons/fa";
import { useTheme } from "../provider/ThemeProvider";

const ThemeToggle = () => {
  const { toggleTheme, isLight } = useTheme();

  return (
    <>
      <button
        onClick={toggleTheme}
        className={`relative inline-flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 text-crimson shadow-md cursor-pointer bg-white`}
        aria-label={`Switch to ${isLight ? "dark" : "light"} mode`}
      >
        {isLight ? (
          <MdSunny size={18} className="text-yellow-500" />
        ) : (
          <FaMoon size={16} className="text-gray-800" />
        )}
      </button>
    </>
  );
};

export default ThemeToggle;
