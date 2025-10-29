import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../components/hooks/useCart";
import { useAuth } from "../../components/hooks/useAuth";
import { useEffect } from "react";
import CheckoutProcess from "../../components/checkout/CheckoutProcess";
import /*FiPlus*/ /*FiMinus*/ "react-icons/fi";

const Checkout: React.FC = () => {
  const {
    cartItems,
    cartTotal,
    // increaseQuantity,
    // decreaseQuantity,
    // removeFromCart,
    orderPlaced,
  } = useCart();

  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/account/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (!isLoading && !isAuthenticated) {
    // navigation will occur in useEffect; avoid rendering the checkout UI
    return null;
  }

  return (
    <div className="min-h-screen bg-white text-black font-clash pt-10 pb-16 px-12">
      <h1 className="text-8xl font-medium mb-6">Checkout</h1>
      <div className="w-full flex flex-row justify-between gap-8 px-12">
        <div className="w-[600px] p-6 border rounded h-full sticky top-20">
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-auto">
              <CheckoutProcess />
            </div>
          </div>
        </div>
        <div className="">
          <div>
            <h3 className="text-xl font-medium mb-4">Order summary</h3>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Items</span>
              <span className="text-sm">{cartItems.length}</span>
            </div>
            {!orderPlaced && (
              <div className="flex justify-between mb-4">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-sm">
                  ₦{cartTotal.toLocaleString("en-NG")}
                </span>
              </div>
            )}
          </div>

          {cartItems.length === 0 ? (
            <>
              {" "}
              <div className="p-8 w-[300px] border border-gray-200 rounded">
                Your cart is empty.
              </div>
              <button
                className="mt-4 w-full border py-2 rounded"
                onClick={() => navigate("/shop")}
              >
                Continue Shopping
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-6 w-[450px]">
              {cartItems.map((item, i) => (
                <div
                  key={`${item.id}-${item.size}-${i}`}
                  className="flex items-center gap-4 p-4 border rounded"
                >
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-24 h-24 object-contain rounded"
                  />
                  <div className="flex-1">
                    <h2 className="font-medium uppercase">{item.name}</h2>
                    <p className="text-sm font-medium">
                      ₦{item.price.toLocaleString("en-NG")}
                    </p>
                    <div className="flex flex-row gap-1 items-center">
                      <span className="text-base text-gray-600">Size: </span>
                      <span className="text-black text-sm font-medium">
                        {item.size}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                      {/* <button
                        onClick={() => decreaseQuantity(item)}
                        className="px-2 py-1 bg-gray-100 rounded cursor-pointer"
                      >
                        <FiMinus />
                      </button> */}
                      <div className="px-3">{item.quantity}</div>
                      {/* <button
                        onClick={() => increaseQuantity(item)}
                        className="px-2 py-1 bg-gray-100 rounded cursor-pointer"
                      >
                        <FiPlus />
                      </button> */}
                    </div>
                    {/* <button
                      onClick={() => removeFromCart(item)}
                      className="text-sm text-red-500 cursor-pointer"
                    >
                      <FiTrash2 />
                    </button> */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
