import React from "react";
import PaystackPop from "@paystack/inline-js";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import saveOrderHistory from "../../lib/orderHistory";
import { paystackPublicKey } from "../../../constant";

type Props = { onNext: () => void; onBack?: () => void };

const Payment: React.FC<Props> = ({ onNext, onBack }) => {
  const { cartTotal, shippingInfo, setActiveTab, setPaymentInfo, cartItems } =
    useCart();
  const { user, userID: ctxUserID, getUser } = useAuth();

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

        // build order payload and save immediately (so order exists even before final "Place order" click)
        (async () => {
          try {
            const itemsPayload = (cartItems || []).map((i) => ({
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
              shipping: shippingInfo as unknown as Record<string, unknown>,
              payment: paymentRecord,
            };

            const referenceCandidate = ref || "";

            // ensure we have a user id; try context user, then fetch if needed
            let uid = ctxUserID ?? user?.id ?? null;
            if (!uid) {
              const fetched = await getUser();
              uid = fetched?.id ?? null;
            }

            const { data, error } = await saveOrderHistory({
              order_total: cartTotal,
              order_details,
              reference_id: referenceCandidate,
              delivery_price: 0,
              user_id: uid ?? undefined,
            });

            if (error) {
              console.error(
                "Auto-save order on payment success failed:",
                error
              );
            } else {
              // annotate payment info so later steps don't re-save
              setPaymentInfo?.({
                ...paymentRecord,
                _order_saved: true,
                _order_db: data || null,
              });
            }
          } catch (err) {
            console.error("Error saving order after payment success:", err);
          } finally {
            setActiveTab("REVIEW");
            onNext();
          }
        })();
      },
      onCancel: (transaction: unknown) => {
        console.log("Transaction was cancelled", transaction);
        const cancelledRecord: Record<string, unknown> = {
          status: "cancelled",
          provider: "paystack",
          raw: transaction,
        };
        setPaymentInfo?.(cancelledRecord);

        // save order with cancelled status as well
        (async () => {
          try {
            const itemsPayload = (cartItems || []).map((i) => ({
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
              shipping: shippingInfo as unknown as Record<string, unknown>,
              payment: cancelledRecord,
            };

            // ensure we have a user id; try context user, then fetch if needed
            let uid2 = ctxUserID ?? user?.id ?? null;
            if (!uid2) {
              const fetched = await getUser();
              uid2 = fetched?.id ?? null;
            }

            const { data, error } = await saveOrderHistory({
              order_total: cartTotal,
              order_details,
              reference_id: "",
              delivery_price: 0,
              user_id: uid2 ?? undefined,
            });

            if (error) {
              console.error("Auto-save order on payment cancel failed:", error);
            } else {
              setPaymentInfo?.({
                ...cancelledRecord,
                _order_saved: true,
                _order_db: data || null,
              });
            }
          } catch (err) {
            console.error("Error saving order after cancellation:", err);
          } finally {
            onBack?.();
          }
        })();
      },
    });
  }

  return (
    <section>
      <div className="flex flex-col items-center justify-center w-full h-full">
        <h2 className="text-4xl font-bold mb-4">Payment</h2>
        <div className="mb-4 text-center">
          <div className="text-sm text-gray-600">Amount to pay</div>
          <div className="text-2xl font-semibold">
            ₦{cartTotal.toLocaleString("en-NG")}
          </div>
          <div className="text-sm text-gray-500">
            {(cartItems || []).length} item
            {(cartItems || []).length !== 1 ? "s" : ""}
          </div>
        </div>
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
