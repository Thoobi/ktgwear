import Navbar from "../components/shared/navbar";
import Footer from "../components/shared/footer";
import Cart from "../components/shared/cart";
import { Outlet } from "react-router-dom";
import { useCart } from "../components/hooks/useCart";
import { useEffect } from "react";

export default function HomeLayout() {
  const { isCartVisible, setIsCartVisible } = useCart();

  useEffect(() => {
    if (isCartVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isCartVisible]);
  return (
    <main>
      <header className="sticky top-0 z-50 bg-white">
        <Navbar />
      </header>
      <Outlet />
      <Footer />
      {isCartVisible && (
        <>
          <div
            className="fixed inset-0 bg-black/5 z-40 cursor-pointer transition-opacity duration-300 ease-in-out max-lg:hidden"
            onClick={() => setIsCartVisible(false)}
          />
          <div
            className={`fixed top-0 right-0 h-screen z-[80] max-lg:w-full max-lg:h-full shadow-xl transform transition-transform`}
          >
            <Cart />
          </div>
        </>
      )}
    </main>
  );
}
