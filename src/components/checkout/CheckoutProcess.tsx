import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ShippingInfo from "./ShippingInfo";
import Payment from "./PaymentForm";
import Review from "./Review";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import saveOrderHistory from "../../lib/orderHistory";
import { toast } from "sonner";

const CheckoutProcess: React.FC = () => {
  const [step, setStep] = useState(0);
  const {
    clearCart,
    shippingInfo,
    paymentInfo,
    cartItems,
    cartTotal,
    setOrderPlaced,
    disableCheckout,
  } = useCart();
  const { user, userID: ctxUserID, getUser } = useAuth();
  const navigate = useNavigate();

  if (disableCheckout) {
    return (
      <div className="p-6 border rounded text-center">
        <p className="mb-4">
          Your cart is empty. Add items to proceed to checkout.
        </p>
        <button
          onClick={() => navigate("/shop")}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Go to shop
        </button>
      </div>
    );
  }

  const next = () => setStep((s) => Math.min(2, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const handlePlaceOrder = async () => {
    // Build order details payload
    const itemsPayload = cartItems.map((i) => ({
      id: i.id,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      size: i.size,
      image_url: i.image_url,
      category: i.category,
    }));

    const order_details = {
      items: itemsPayload as Record<string, unknown>[],
      // cast shipping and payment to plain records for the DB helper
      shipping: shippingInfo as unknown as Record<string, unknown>,
      payment: paymentInfo as unknown as Record<string, unknown>,
    };

    const paymentRecord = paymentInfo as unknown as Record<string, unknown>;

    // if the payment step already auto-saved the order, skip re-saving
    if (paymentRecord && paymentRecord._order_saved) {
      toast.success("Order placed successfully!");
      setOrderPlaced?.(true);
      clearCart();
      navigate("/user/dashboard");
      return;
    }

    const referenceCandidate = paymentRecord?.reference;
    const referenceId =
      typeof referenceCandidate === "string" ? referenceCandidate : "";

    // ensure we have a user id; userID in context may be null if getUser wasn't called yet
    let uid = ctxUserID ?? user?.id ?? null;
    if (!uid) {
      const fetched = await getUser();
      uid = fetched?.id ?? null;
    }

    if (!uid) {
      toast.error("You must be signed in to place an order.");
      return;
    }

    const { error } = await saveOrderHistory({
      order_total: cartTotal,
      order_details,
      reference_id: referenceId,
      delivery_price: 0,
      user_id: uid,
    });

    if (error) {
      console.error("saveOrderHistory error:", error);
      toast.error(
        "Could not save your order. Please try again or contact support."
      );
      return;
    }

    toast.success("Order placed successfully!");
    // mark order as placed so UI can hide the sidebar summary
    setOrderPlaced?.(true);
    clearCart();
    // navigate to a success page if you have one
    // if (data) {
    //   const idCandidate = data["id"];
    //   if (typeof idCandidate === "string") {
    //     navigate(`/order-success/${idCandidate}`);
    //     return;
    //   }
    // }

    navigate("/user/dashboard");
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <div
          className={`px-3 py-1 rounded-full ${
            step === 0 ? "bg-black text-white" : "bg-gray-100"
          }`}
        >
          1
        </div>
        <div
          className={`px-3 py-1 rounded-full ${
            step === 1 ? "bg-black text-white" : "bg-gray-100"
          }`}
        >
          2
        </div>
        <div
          className={`px-3 py-1 rounded-full ${
            step === 2 ? "bg-black text-white" : "bg-gray-100"
          }`}
        >
          3
        </div>
      </div>

      <div>
        {step === 0 && (
          <ShippingInfo onNext={next} shippingInfo={shippingInfo} />
        )}
        {step === 1 && <Payment onNext={next} onBack={back} />}
        {step === 2 && <Review onBack={back} onPlaceOrder={handlePlaceOrder} />}
      </div>
    </div>
  );
};

export default CheckoutProcess;
