import { useRef } from "react";
import { IoCloseOutline } from "react-icons/io5";
import { GoPlus } from "react-icons/go";
import { HiMiniMinus } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useCart } from "../hooks/useCart";

const Cart = () => {
  const {
    cartTotal,
    cartItems,
    setIsCartVisible,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    disableCheckout: disabled,
  } = useCart();
  gsap.registerPlugin(useGSAP);
  const cart = useRef(null);
  const navigate = useNavigate();

  return (
    <div
      className={`flex flex-row bg-black h-full w-lg max-md:w-full max-md:h-screen font-clash cart`}
      ref={cart}
    >
      <span
        className="flex flex-col items-center px-1 gap-4 justify-start mt-4 cursor-pointer text-white w-[40px]"
        onClick={() => {
          setIsCartVisible(false);
        }}
      >
        <IoCloseOutline className="text-2xl font-medium" />
        <span className="text-base font-light rotate-180 [writing-mode:vertical-rl]">
          Close shopping cart
        </span>
      </span>
      <div className="w-[28.75rem] max-md:w-full h-full bg-gray-100 text-black py-10 overflow-scroll">
        <div className="absolute top-0 py-3 pr-14 pl-5 z-20 text-black w-full items-center justify-between flex flex-row-reverse bg-white/10 backdrop-blur-sm">
          <h1 className="text-4xl font-medium max-lg:text-3xl max-md:font-semibold">
            Your Cart
          </h1>
        </div>
        <div className="flex flex-col gap-10 max-md:w-full max-md:justify-start max-md:items-start max-md:px-4 justify-center items-center text-black py-5 mt-10 mb-24 pr-10">
          {cartItems.length > 0 ? (
            cartItems.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 max-lg:gap-2 max-md:w-full"
              >
                <button
                  onClick={() => {
                    removeFromCart(item);
                  }}
                >
                  <IoCloseOutline className="text-[1.3rem] cursor-pointer bg-red-500 text-white rounded-full p-0.5" />
                </button>
                <div className="flex flex-row gap-10 max-w-[calc(100%-2rem)] max-lg:gap-3 max-md:w-full max-md:gap-8">
                  <span className="w-32 border-[1px] border-dashed border-black rounded-md">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full"
                    />
                  </span>
                  <div className="flex flex-col gap-2 max-lg:gap-1 justify-center max-md:w-full max-md:px-2">
                    <h2 className="text-base font-normal text-gray-800 uppercase w-[150px]">
                      {item.name}
                    </h2>
                    <div className="flex flex-row items-center justify-between max-md:gap-2 max-md:w-full max-md:px-1">
                      <p className="text-base max-md:text-sm font-medium text-gray-800">{`₦${item.price.toLocaleString(
                        "en-NG"
                      )}`}</p>
                      <p className="text-base font-medium text-gray-800">
                        {item.size}
                      </p>
                    </div>
                    <div className="flex flex-row items-center justify-between">
                      <button
                        onClick={() => {
                          decreaseQuantity(item);
                        }}
                        className="bg-white text-black rounded-md p-2 cursor-pointer"
                      >
                        <HiMiniMinus />
                      </button>
                      <p>{item.quantity}</p>
                      <button
                        onClick={() => {
                          increaseQuantity(item);
                        }}
                        className="bg-white text-black rounded-md p-2 cursor-pointer"
                      >
                        <GoPlus />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex justify-center items-center max-lg:w-full h-[60vh] w-full text-gray-800 px-10">
              <h1 className="text-3xl font-medium">Cart is empty</h1>
            </div>
          )}
        </div>
        <div className="absolute bottom-0 pl-8 pr-20 max-lg:pl-4 max-lg:pr-14 z-20 text-white bg-black w-full h-32 items-center justify-between flex flex-col py-5">
          <div className="flex gap-2 w-full justify-between items-center">
            <h1 className="text-base font-light">Total</h1>
            <span className="w-[70%] h-[1px] bg-white"></span>
            <p className="text-base font-light">{`₦${cartTotal.toLocaleString(
              "en-NG"
            )}`}</p>
          </div>
          <button
            className={`bg-white text-black rounded-full h-12 w-full ${
              disabled ? "opacity-50 cursor-logo" : ""
            }`}
            disabled={cartItems.length < 1 ? disabled : false}
            onClick={() => {
              navigate("/checkout");
              setIsCartVisible(false);
            }}
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
