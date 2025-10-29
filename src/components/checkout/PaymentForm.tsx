import React from "react";
import PaystackPop from "@paystack/inline-js";
import { useCart } from "../hooks/useCart";
import { paystackPublicKey } from "../../../constant";

type Props = { onNext: () => void; onBack?: () => void };

const Payment: React.FC<Props> = ({ onNext, onBack }) => {
  const { cartTotal, shippingInfo, setActiveTab, setPaymentInfo } = useCart();

  async function initializeTransaction() {
    const popup = new PaystackPop();
    popup.newTransaction({
      key: paystackPublicKey,
      email: shippingInfo.email,
      amount: cartTotal * 100,
      onload: (response: unknown) => {
        console.log("Transaction initialized:", response);
      },
      onSuccess: (transaction: unknown) => {
        console.log("Transaction successful:", transaction);
        // Extract a plausible reference id from the returned payload.
        // Paystack typically returns { reference: string, ... } or nested data.
        // safely extract reference from unknown transaction payload
        const t = transaction as unknown;
        let ref: string | undefined = undefined;
        if (t && typeof t === "object") {
          const obj = t as Record<string, unknown>;
          if (typeof obj["reference"] === "string") {
            ref = obj["reference"] as string;
          } else if (obj["data"] && typeof obj["data"] === "object") {
            const data = obj["data"] as Record<string, unknown>;
            if (typeof data["reference"] === "string")
              ref = data["reference"] as string;
          }
        }

        const paymentRecord: Record<string, unknown> = {
          status: "successful",
          provider: "paystack",
          reference: ref,
          raw: transaction,
        };
        // persist payment info to cart context so checkout can include it in the order payload
        setPaymentInfo?.(paymentRecord);
        setActiveTab("REVIEW");
        onNext();
      },
      onCancel: (transaction: unknown) => {
        console.log("Transaction was cancelled", transaction);
        setPaymentInfo?.({
          status: "cancelled",
          provider: "paystack",
          raw: transaction,
        });
        onBack?.();
      },
    });
  }

  return (
    <section>
      <div className="flex flex-col items-center justify-center w-full h-full">
        <h2 className="text-4xl font-bold mb-4">Payment</h2>
        <button
          onClick={() => {
            initializeTransaction();
            console.log("amount:", cartTotal, "email:", shippingInfo.email);
          }}
          className="px-8 py-2 bg-blue-600 text-white text-lg font-medium rounded-full cursor-pointer"
        >
          Pay Now
        </button>
      </div>
    </section>
  );
};

export default Payment;
