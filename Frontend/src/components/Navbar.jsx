import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const { logout, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const avatarUrl = user?.profilePic;
  const initials = user?.username?.slice(0, 2)?.toUpperCase() || "U";

  return (
    <nav className="flex justify-between items-center px-6 py-3 bg-blue-600 text-white shadow-md">
      <Link to="/" className="text-2xl font-bold tracking-wide">
        VOXTREAM
      </Link>

      <div className="relative flex items-center gap-4">
        <p className="hidden sm:block font-medium">{user.username}</p>

        <button
          onClick={toggleMenu}
          className="w-10 h-10 rounded-full overflow-hidden border-2 border-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="User avatar"
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white text-blue-600 font-bold">
              {initials}
            </div>
          )}
        </button>

        {menuOpen && (
          <div
            ref={menuRef}
            className="absolute right-0 top-12 mt-2 w-44 bg-white text-black rounded shadow-lg z-50"
          >
            <button
              onClick={logout}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
