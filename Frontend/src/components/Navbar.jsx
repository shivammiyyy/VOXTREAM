import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const {logout, user} = useAuth();
  const username = user.username;

  return (
    <nav className="flex justify-between items-center px-6 py-3 bg-blue-600 text-white shadow">
      <Link to="/" className="text-xl font-bold">VOXTREAM</Link>

      <div className="flex gap-4">
        <Link to="/" className="hover:underline">Home</Link>
        <Link to="/chat" className="hover:underline">Chat</Link>
        <p>{username}</p>
        <button onClick={() => logout()} className="hover:underline">Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
