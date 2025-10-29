import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

const OrderDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("orderHistory")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("fetchOrder error:", error);
          toast.error("Could not load order details");
          return;
        }
        setOrder(data as Record<string, unknown>);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    void fetchOrder();
  }, [id]);

  const markPaymentSuccessful = async () => {
    if (!order || !id) return;
    try {
      const existingDetails = order.order_details as unknown as
        | Record<string, unknown>
        | undefined;
      const existingPayment =
        (existingDetails?.payment as unknown as Record<string, unknown>) || {};
      const newPayment = {
        ...(existingPayment || {}),
        status: "successful",
      } as Record<string, unknown>;
      const newDetails = {
        ...(existingDetails || {}),
        payment: newPayment,
      } as Record<string, unknown>;

      const { data, error } = await supabase
        .from("orderHistory")
        .update({ order_details: newDetails })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("markPaymentSuccessful error:", error);
        toast.error("Could not update payment status");
        return;
      }

      setOrder(data as Record<string, unknown>);
      toast.success("Payment marked successful");
    } catch (err) {
      console.error(err);
      toast.error("Could not update payment status");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!order) return <div>No order found</div>;

  const items =
    (
      order.order_details as unknown as {
        items?: Array<{
          name?: string;
          size?: string;
          price?: number;
          quantity?: number;
        }>;
      }
    )?.items || [];
  const shipping =
    (order.order_details as unknown as { shipping?: Record<string, unknown> })
      ?.shipping || {};
  const payment =
    (order.order_details as unknown as { payment?: Record<string, unknown> })
      ?.payment || {};

  return (
    <div>
      <button onClick={() => navigate(-1)} className="mb-4 underline">
        Back
      </button>
      <h2 className="text-2xl font-semibold mb-3">
        Order {String((order as Record<string, unknown>)["id"] ?? "")}
      </h2>
      <div className="mb-4">
        <div className="font-medium">Items</div>
        <ul className="list-disc pl-6">
          {items.map((it, i) => (
            <li key={i} className="mb-2">
              {String(it.name ?? "")} — {String(it.size ?? "")} — ₦
              {Number(it.price ?? 0).toLocaleString("en-NG")} x{" "}
              {String(it.quantity ?? 0)}
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-4">
        <div className="font-medium">Shipping</div>
        <div className="text-sm text-gray-700">
          {String((shipping as Record<string, unknown>)["firstName"] ?? "")}{" "}
          {String((shipping as Record<string, unknown>)["lastName"] ?? "")}
        </div>
        <div className="text-sm text-gray-700">
          {String((shipping as Record<string, unknown>)["address"] ?? "")}
        </div>
        <div className="text-sm text-gray-700">
          {String((shipping as Record<string, unknown>)["city"] ?? "")}{" "}
          {String((shipping as Record<string, unknown>)["state"] ?? "")}
        </div>
        <div className="text-sm text-gray-700">
          {String((shipping as Record<string, unknown>)["country"] ?? "")}
        </div>
      </div>

      <div className="mb-4">
        <div className="font-medium">Payment</div>
        <div className="text-sm text-gray-700">
          Status:{" "}
          {String((payment as Record<string, unknown>)["status"] ?? "unknown")}
        </div>
        <div className="text-sm text-gray-700">
          Reference:{" "}
          {String(
            (payment as Record<string, unknown>)["reference"] ??
              (order as Record<string, unknown>)["reference_id"] ??
              "-"
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={markPaymentSuccessful}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Mark payment successful
        </button>
      </div>
    </div>
  );
};

export default OrderDetails;
