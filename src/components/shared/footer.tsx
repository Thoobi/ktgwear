import { Link } from "react-router-dom";
const contact = [
  {
    label: "Contact Support",
    value: "+234 703 948 5211",
  },
  {
    label: "Email",
    value: "ktgwears@gmail.com",
  },
];
const collection = [
  {
    label: "Joggers",
    url: "/shop",
  },
  {
    label: "SweatShirts",
    url: "/shop",
  },
  {
    label: "Two Piece",
    url: "/shop",
  },
  {
    label: "Polo",
    url: "/shop",
  },
  {
    label: "Essentials",
    url: "/shop",
  },
];
const services = [
  {
    label: "About Us",
    url: "/about",
  },
  {
    label: "Contact Us",
    url: "/contact",
  },
  {
    label: "Terms of Service",
    url: "/terms",
  },
  {
    label: "Privacy Policy",
    url: "/privacy",
  },
  {
    label: "Return & Refund Policy",
    url: "/return",
  },
  {
    label: "Shipping Policy",
    url: "/shipping",
  },
  {
    label: "FAQs",
    url: "/faqs",
  },
];
const subcribe = [
  {
    label: "Email",
    placeholder: "Enter your email",
    type: "email",
  },
];
export default function Footer() {
  return (
    <footer className="bg-gray-50 py-20 grid grid-cols-4 gap-10 w-full px-10 font-clash">
      <div className="flex flex-col gap-3">
        <h5 className="font-medium text-2xl">Get In Touch With Us</h5>
        <p>
          KTG wears is an online and in-store leading fashion boutique with an
          array of carefully curated apparel and accessories to amplify your
          personal style.
        </p>
        <div className="flex flex-col gap-2">
          {contact.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <h6 className="font-medium">{item.label}:</h6>
              <p>{item.value}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <h5 className="font-medium text-xl">Collection</h5>
        <div className="flex flex-col gap-2">
          {collection.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <Link to={item.url} className="text-base">
                {item.label}
              </Link>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <h5 className="font-medium text-xl">Customer Service</h5>
        <div className="flex flex-col gap-2">
          {services.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <Link to={item.url} className="text-base">
                {item.label}
              </Link>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <h5 className="font-medium text-lg">
          Join Our Waitlist for Exclusive Offers
        </h5>
        <div className="flex flex-col gap-2">
          {subcribe.map((item) => (
            <div key={item.label} className="flex flex-col items-start gap-2">
              <label className="flex flex-col gap-2 border p-2 font-clash w-[300px]">
                <span className="text-sm after:content-['*'] after:text-red-500">
                  {item.label}
                </span>
                <input
                  type={item.type}
                  placeholder={item.placeholder}
                  className="focus:outline-none focus:ring-0 text-base"
                />
              </label>
              <button className="bg-black/90 cursor-pointer text-white px-4 py-2 text-base hover:bg-black transition-all duration-300 ease-in-out">
                Subscribe
              </button>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
