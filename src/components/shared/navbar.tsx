import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { FaRegUser } from "react-icons/fa6";
import Logo from "../../assets/ktg-text-logo.png";
import { FaCartShopping } from "react-icons/fa6";

const navlinks = [
  {
    label: "Home",
    url: "/",
  },
  {
    label: "About",
    url: "/about",
  },
  {
    label: "Contact",
    url: "/contact",
  },
  {
    label: "Joggers",
    url: "/shop",
  },
  {
    label: "Hoodies",
    url: "/hoodies",
  },
  {
    label: "SweatShirts",
    url: "/sweatshirts",
  },
  {
    label: "Cargo",
    url: "/cargo",
  },
  {
    label: "Polo",
    url: "/polo",
  },
  {
    label: "Two Piece",
    url: "/two-piece",
  },
  {
    label: "Essentials",
    url: "/essentials",
  },
];

export default function Navbar() {
  const location = useLocation();
  const isActive = (url: string) => location.pathname === url;
  return (
    <nav className="flex justify-between items-center py-4 bg-gray-50/10 backdrop-blur-sm px-10 border-b border-b-gray-200 font-clash">
      <div>
        <Link to="/">
          <img src={Logo} alt="KTG Logo" />
        </Link>
      </div>
      <ul className="flex gap-5">
        {navlinks.map((link) => (
          <li
            key={link.url}
            className="flex flex-col items-center group py-1 relative"
          >
            <Link
              to={link.url}
              className={`${isActive(link.url) && "font-medium"}`}
            >
              {link.label}
            </Link>
            <span
              className={`group-hover:w-full group-hover:absolute group-hover:bottom-1 w-0 bg-black group-hover:h-[1px] transition-all duration-250 ease-in-out ${
                isActive(link.url) && "group-hover:hidden"
              }`}
            ></span>
          </li>
        ))}
      </ul>
      <div className="flex gap-4 items-center">
        <FaRegUser
          size={18}
          className="cursor-pointer"
          onClick={() => (window.location.href = "/account/login")}
        />
        <div className="relative">
          <span className="absolute -top-1 -right-2 text-[10px] bg-red-500 text-white rounded-full px-1">
            0
          </span>
          <FaCartShopping size={20} className="cursor-pointer" />
        </div>
      </div>
    </nav>
  );
}
