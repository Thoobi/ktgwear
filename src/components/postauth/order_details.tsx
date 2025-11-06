import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { BsFillPatchCheckFill } from "react-icons/bs";
import { MdError } from "react-icons/md";

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

  // const markPaymentSuccessful = async () => {
  //   if (!order || !id) return;
  //   try {
  //     const existingDetails = order.order_details as unknown as
  //       | Record<string, unknown>
  //       | undefined;
  //     const existingPayment =
  //       (existingDetails?.payment as unknown as Record<string, unknown>) || {};
  //     const newPayment = {
  //       ...(existingPayment || {}),
  //       status: "successful",
  //     } as Record<string, unknown>;
  //     const newDetails = {
  //       ...(existingDetails || {}),
  //       payment: newPayment,
  //     } as Record<string, unknown>;

  //     const { data, error } = await supabase
  //       .from("orderHistory")
  //       .update({ order_details: newDetails })
  //       .eq("id", id)
  //       .select()
  //       .single();

  //     if (error) {
  //       console.error("markPaymentSuccessful error:", error);
  //       toast.error("Could not update payment status");
  //       return;
  //     }

  //     setOrder(data as Record<string, unknown>);
  //     toast.success("Payment marked successful");
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Could not update payment status");
  //   }
  // };

  if (loading) return <div>Loading...</div>;
  if (!order) return <div>No order found</div>;

  const created = (order.created_at as string)
    ? new Date(order.created_at as string)
    : null;
  const totalAmount = Number(order.order_total ?? order.total ?? 0) || 0;

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

  // resolve reference once for display
  const referenceRaw =
    (payment as Record<string, unknown>)["reference"] ??
    (order as Record<string, unknown>)["reference_id"] ??
    "-";
  const referenceVal =
    typeof referenceRaw === "string" ? referenceRaw : String(referenceRaw);

  // collect images: prefer order-level images, then item images
  const images: string[] = [];
  try {
    const orderObj = order as Record<string, unknown>;
    const maybeImage = orderObj["image"] as unknown;
    if (typeof maybeImage === "string" && maybeImage.trim())
      images.push(maybeImage);
    const maybeImages = orderObj["images"] as unknown;
    if (Array.isArray(maybeImages)) {
      (maybeImages as unknown[]).forEach((mi) => {
        if (typeof mi === "string" && mi.trim()) images.push(mi);
      });
    }

    // add item images
    (items || []).forEach((it) => {
      const img = (it as Record<string, unknown>)["image_url"] as unknown;
      if (typeof img === "string" && img.trim()) images.push(img);
    });
  } catch {
    // ignore
  }

  // dedupe while preserving order
  const uniqueImages = Array.from(new Set(images));

  return (
    <div className="max-w-5xl mx-auto pt-10">
      <button
        onClick={() => navigate(-1)}
        className="text-base text-gray-600 hover:underline cursor-pointer"
      >
        Back
      </button>
      <div className="bg-white p-6 rounded-lg ">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold">
              Order #{String((order as Record<string, unknown>)["id"] ?? "")}
            </h2>
            <div className="text-sm text-gray-500 mt-1">
              {created ? created.toLocaleString() : "-"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {uniqueImages.length > 0 && (
              <div className="mb-4">
                <div className="font-medium mb-2">Images</div>
                <div className="grid grid-cols-3 gap-2">
                  {uniqueImages.map((src, idx) => (
                    <img
                      key={idx}
                      src={String(src)}
                      alt={`order-${String(order?.id ?? id)}-img-${idx}`}
                      className="w-full min-h-auto object-cover rounded"
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="font-medium mb-3">Items</h3>
              <div className="space-y-3">
                {items.map((it, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border p-3"
                  >
                    <div className="flex items-center gap-3">
                      {((it as Record<string, unknown>) || {}).image_url ? (
                        <img
                          src={String(
                            (it as Record<string, unknown>)?.image_url ?? ""
                          )}
                          alt={String(
                            (it as Record<string, unknown>)?.name ?? ""
                          )}
                          className="w-15 h-auto object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 " />
                      )}
                      <div>
                        <div className="font-medium uppercase">
                          {String(it.name ?? "")}
                        </div>
                        <div className="text-sm text-gray-500">
                          Size: {String(it.size ?? "-")}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        ₦{Number(it.price ?? 0).toLocaleString("en-NG")}
                      </div>
                      <div className="text-sm text-gray-700">
                        Qty: {String(it.quantity ?? 0)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="self-start border p-4">
            <div className="flex justify-center items-center mb-5">
              {payment.status === "successful" && (
                <BsFillPatchCheckFill className="text-5xl text-green-600" />
              )}
              {(payment.status === "cancelled" ||
                payment.status === "failed") && (
                <MdError className="text-5xl text-red-600" />
              )}
            </div>
            <div className="mb-4 flex justify-center flex-col">
              <h4 className="font-medium mb-2">Shipping Details</h4>
              <div className="text-sm text-gray-700">
                {String(
                  (shipping as Record<string, unknown>)["firstName"] ?? ""
                )}{" "}
                {String(
                  (shipping as Record<string, unknown>)["lastName"] ?? ""
                )}
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

            <div className="">
              <h4 className="font-medium mb-2">Payment</h4>
              <div className="text-sm text-gray-700">
                Status:{" "}
                <span className="font-medium">
                  {String(
                    (payment as Record<string, unknown>)["status"] ?? "unknown"
                  )}
                </span>
              </div>
              <div className="text-sm text-gray-700 mt-2">
                Reference: <span className="text-gray-600">{referenceVal}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <div className="text-start">
                <h3 className="text-base text-black font-medium">Total</h3>
                <div className="text-lg font-bold">
                  ₦{totalAmount.toLocaleString("en-NG")}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
