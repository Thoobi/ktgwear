import { Link, useNavigate } from "react-router-dom";
import Logo from "../../assets/ktg-text-logo.png";
import { useAuth } from "../hooks/useAuth";
import { RiLogoutBoxRLine } from "react-icons/ri";
import { LuShoppingCart } from "react-icons/lu";

export default function Navbar() {
  const { handleLogout } = useAuth();
  const navigate = useNavigate();
  return (
    <nav className="flex justify-between items-center py-4 bg-gray-50/10 backdrop-blur-sm px-10 border-b border-b-gray-200 font-clash">
      <div>
        <Link to="/">
          <img src={Logo} alt="KTG Logo" />
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            navigate("/shop");
          }}
          className="hidden lg:inline-flex px-4 py-2 cursor-pointer bg-transparent border-black border text-black text-sm items-center"
        >
          <LuShoppingCart className="text-lg inline-block mr-2" />
          Continue Shopping
        </button>
        <button
          onClick={handleLogout}
          className="hidden lg:inline-flex px-4 py-2 cursor-pointer bg-red-600 text-white text-sm items-center"
        >
          <RiLogoutBoxRLine className="text-lg inline-block mr-2" />
          Logout
        </button>
      </div>
    </nav>
  );
}
