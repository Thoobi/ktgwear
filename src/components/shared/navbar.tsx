import { useLocation, Link, useNavigate } from "react-router-dom";
import { FaRegUser, FaCartShopping } from "react-icons/fa6";
import { useAuth } from "../hooks/useAuth";
import Logo from "../../assets/ktg-text-logo.png";
import { useCart } from "../hooks/useCart";
import { useMemo, useEffect } from "react";

const baseLinks = [
  { label: "Home", url: "/" },
  { label: "Shop", url: "/shop" },
  { label: "About", url: "/about" },
  { label: "Contact", url: "/contact" },
];

export default function Navbar() {
  const { isAuthenticated } = useAuth();
  const { setIsCartVisible, cartLength, allWearables, getAllWears } = useCart();

  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (url: string) => location.pathname === url;

  useEffect(() => {
    if (!allWearables || allWearables.length === 0) {
      void getAllWears();
    }
  }, [allWearables, getAllWears]);

  const categoryLinks = useMemo(() => {
    const set = new Set<string>();
    (allWearables || []).forEach((w) => {
      if (w.category) set.add(w.category);
    });
    return Array.from(set).map((cat) => {
      const slug = cat.toLowerCase().replace(/\s+/g, "-");
      return { label: cat, url: `/shop/${slug}` };
    });
  }, [allWearables]);

  return (
    <nav className="flex justify-between items-center py-4 bg-gray-50/10 backdrop-blur-sm px-10 border-b border-b-gray-200 font-clash">
      <div>
        <Link to="/">
          <img src={Logo} alt="KTG Logo" />
        </Link>
      </div>

      <ul className="flex gap-5">
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
      </div>
    </nav>
  );
}
