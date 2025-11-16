import { Link, useNavigate } from "react-router-dom";
import Logo from "../../assets/ktg-text-logo.png";
import { useAuth } from "../hooks/useAuth";
import { RiLogoutBoxRLine } from "react-icons/ri";
import { LuShoppingCart } from "react-icons/lu";
import { useState } from "react";

interface NavbarProps {
  navLinks?: {
    tab: string;
    name: string;
    path: string;
  }[];
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export default function Navbar({
  navLinks = [],
  activeTab,
  setActiveTab,
}: NavbarProps) {
  const { handleLogout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="flex justify-between items-center py-5 bg-gray-50/10 backdrop-blur-sm px-10 border-b border-b-gray-200 font-clash max-md:px-5">
      <div>
        <Link to="/">
          <img src={Logo} alt="KTG Logo" className="h-6 max-md:h-5" />
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

        {/* Hamburger Menu Button */}
        <button
          className="lg:hidden flex flex-col justify-center items-center w-6 h-6 z-50 relative"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span
            className={`w-6 h-0.5 bg-black transition-all rounded-full duration-300 absolute ${
              isMenuOpen ? "rotate-45" : "-translate-y-1"
            }`}
          ></span>
          <span
            className={`w-6 h-0.5 bg-black transition-all rounded-full duration-300 absolute ${
              isMenuOpen ? "-rotate-45" : "translate-y-1"
            }`}
          ></span>
        </button>
      </div>

      {/* Backdrop */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 top-[73px] bg-white/10 z-35 lg:hidden backdrop-blur-md transition-all duration-300"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

      {/* Mobile Slide Menu */}
      <div
        className={`fixed top-[73px] right-0 h-[calc(100vh-73px)] w-64 bg-white shadow-2xl z-40 transform transition-transform duration-300 ease-in-out lg:hidden overflow-hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="pt-6 px-6 pb-6">
          <div className="flex flex-col gap-4">
            {/* Navigation Links */}
            {navLinks.length > 0 && (
              <div className="flex flex-col gap-2 mb-2 border-b border-gray-200 pb-4">
                {navLinks.map((link) => (
                  <button
                    key={link.tab}
                    onClick={() => {
                      if (setActiveTab) {
                        setActiveTab(link.tab);
                      }
                      setIsMenuOpen(false);
                    }}
                    className={`text-left px-4 py-2  transition-colors ${
                      activeTab === link.tab
                        ? "bg-black text-white font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {link.name}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                navigate("/shop");
                setIsMenuOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-3 bg-transparent border-black border text-black text-sm w-full justify-center"
            >
              <LuShoppingCart className="text-lg" />
              Continue Shopping
            </button>
            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-3 bg-red-600 text-white text-sm w-full justify-center"
            >
              <RiLogoutBoxRLine className="text-lg" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
