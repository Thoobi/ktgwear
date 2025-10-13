import { Link } from "react-router-dom";
import Logo from "../../assets/ktg-text-logo.png";
import { useAuth } from "../hooks/useAuth";
import { RiLogoutBoxRLine } from "react-icons/ri";

export default function Navbar() {
  const { handleLogout } = useAuth();
  return (
    <nav className="flex justify-between items-center py-4 bg-gray-50/10 backdrop-blur-sm px-10 border-b border-b-gray-200 font-clash">
      <div>
        <Link to="/">
          <img src={Logo} alt="KTG Logo" />
        </Link>
      </div>
      <button
        onClick={handleLogout}
        className="hidden lg:inline-flex px-4 py-2 cursor-pointer bg-red-600 text-white text-sm items-center"
      >
        <RiLogoutBoxRLine className="text-lg inline-block mr-2" />
        Logout
      </button>
    </nav>
  );
}
