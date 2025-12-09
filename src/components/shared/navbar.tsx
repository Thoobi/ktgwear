import { useLocation, Link, useNavigate } from "react-router-dom";
import { FaRegUser, FaCartShopping } from "react-icons/fa6";
import { useAuth } from "../hooks/useAuth";
import Logo from "../../assets/ktg-text-logo.png";
import { useCart } from "../hooks/useCart";
import { useMemo, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const baseLinks = [
  { label: "Home", url: "/" },
  { label: "Shop", url: "/shop" },
  { label: "About", url: "/about" },
  { label: "Contact", url: "/contact" },
];

export default function Navbar() {
  const { isAuthenticated } = useAuth();
  const { setIsCartVisible, cartLength, allWearables, getAllWears } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (url: string) => location.pathname === url;

  useEffect(() => {
    if (!allWearables || allWearables.length === 0) {
      void getAllWears();
    }
  }, [allWearables, getAllWears]);

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("name")
          .order("name");

        if (error) {
          console.error("Error fetching categories:", error);
          return;
        }

        const categoryNames = data.map((cat) => cat.name);
        setCategories(categoryNames);
      } catch (err) {
        console.error("Error:", err);
      }
    };

    void fetchCategories();
  }, []);

  const categoryLinks = useMemo(() => {
    return categories.map((cat) => {
      const slug = cat.toLowerCase().replace(/\s+/g, "-");
      return { label: cat, url: `/shop/${slug}` };
    });
  }, [categories]);

  return (
    <nav className="fixed top-0 left-0 right-0 flex justify-between items-center py-5 bg-white backdrop-blur-sm px-10 max-md:px-4.5 border-b border-b-gray-200 font-clash z-50">
      <div>
        <Link to="/">
          <img src={Logo} alt="KTG Logo" className="h-6 max-md:h-5" />
        </Link>
      </div>

      {/* Desktop Navigation */}
      <ul className="hidden lg:flex gap-5">
        {[...baseLinks, ...categoryLinks].map((link) => (
          <li
            key={link.url}
            className={`flex flex-col items-center group py-1 relative ${
              isActive(link.url) ? "font-medium text-gray-800" : "text-gray-600"
            }`}
          >
            <Link to={link.url}>{link.label}</Link>
          </li>
        ))}
      </ul>

      <div className="flex gap-4 items-center">
        <FaRegUser
          size={18}
          className="cursor-pointer"
          onClick={() => {
            console.log("[Navbar] user icon click, isAuthenticated:", {
              isAuthenticated,
            });
            if (isAuthenticated) navigate("/user/dashboard");
            else navigate("/account/login");
          }}
        />

        <div className="relative">
          <span className="absolute -top-1 -right-2 text-[10px] bg-red-500 text-white font-medium rounded-full px-1">
            {cartLength}
          </span>
          <FaCartShopping
            size={20}
            className="cursor-pointer"
            onClick={() => setIsCartVisible(true)}
          />
        </div>

        {/* Hamburger Menu Button */}
        <button
          className="lg:hidden flex flex-col justify-center items-center w-6 h-5 z-50 relative"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span
            className={`w-6 h-0.5 bg-black transition-all rounded-full duration-300 absolute ${
              isMenuOpen ? "rotate-43" : "-translate-y-1"
            }`}
          ></span>
          <span
            className={`w-6 h-0.5 bg-black transition-all rounded-full duration-300 absolute ${
              isMenuOpen ? "-rotate-43" : "translate-y-1"
            }`}
          ></span>
        </button>
      </div>

      {/* Backdrop */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 top-[58px] bg-white/10 z-35 lg:hidden backdrop-blur-md transition-all duration-300"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

      {/* Mobile Slide Menu */}
      <div
        className={`fixed top-[58px] left-0 h-[calc(100vh-58px)] w-64 bg-white shadow-2xl z-40 transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="pt-6 px-6 pb-6">
          <ul className="flex flex-col gap-4">
            {[...baseLinks, ...categoryLinks].map((link) => (
              <li
                key={link.url}
                className={`py-2 border-b border-gray-100 ${
                  isActive(link.url)
                    ? "font-medium text-gray-800"
                    : "text-gray-600"
                }`}
              >
                <Link
                  to={link.url}
                  onClick={() => setIsMenuOpen(false)}
                  className="block"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
