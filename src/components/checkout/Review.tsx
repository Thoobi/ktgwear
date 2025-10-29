import React, { useState } from "react";
import { useCart } from "../hooks/useCart";

type Props = { onBack?: () => void; onPlaceOrder?: () => void };

const Review: React.FC<Props> = ({ onBack, onPlaceOrder }) => {
  const { shippingInfo, cartItems, cartTotal } = useCart();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="px-2">
      <h4 className="text-sm font-medium mb-2">Review</h4>
      <div className="text-sm mb-2">
        <div className="font-medium">Shipping</div>
        <div>
          {shippingInfo.firstName} {shippingInfo.lastName}
        </div>
        <div>{shippingInfo.address}</div>
        <div>
          {shippingInfo.city} {shippingInfo.state}
        </div>
      </div>

      <div className="text-sm mb-4">
        <div className="font-medium">Items</div>
        {cartItems.map((it) => (
          <div key={`${it.id}-${it.size}`} className="flex justify-between">
            <div>
              {it.name} x{it.quantity} ({it.size})
            </div>
            <div>₦{(it.price * it.quantity).toLocaleString("en-NG")}</div>
          </div>
        ))}
      </div>

      <div className="text-sm mb-4 border-t pt-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-600">Subtotal</span>
          <span className="text-sm">₦{cartTotal.toLocaleString("en-NG")}</span>
        </div>
        <div className="flex justify-between font-medium text-lg">
          <span>Total</span>
          <span>₦{cartTotal.toLocaleString("en-NG")}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onBack}
          className="border py-2 rounded flex-1 cursor-pointer"
        >
          Back
        </button>
        <button
          onClick={() => setConfirmOpen(true)}
          className="bg-black text-white py-2 rounded flex-1 cursor-pointer"
        >
          Save order
        </button>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-40" />
          <div className="bg-white p-6 rounded shadow-lg z-10 w-[min(420px,90%)]">
            <h3 className="text-lg font-semibold mb-2">Save order?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Do you want to save this order to your account so you can view it
              in your order history?
            </p>
            <div className="flex gap-2 justify-end">
              <button
                className="px-3 py-2 border rounded cursor-pointer"
                onClick={() => setConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-2 bg-black text-white rounded cursor-pointer"
                onClick={() => {
                  setConfirmOpen(false);
                  if (onPlaceOrder) onPlaceOrder();
                }}
              >
                Yes, save order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Review;
