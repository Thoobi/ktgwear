import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type OrderRow = Record<string, unknown>;

// Helper function to safely convert data to orders array - extracted to avoid React Compiler issues
function normalizeOrderData(data: unknown): OrderRow[] {
  return (data as OrderRow[]) || [];
}

export default function Order() {
  const { userID } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userID) return;
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("orderHistory")
          .select("*, order_details")
          .eq("user_id", userID)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("fetchOrders error:", error);
          toast.error("Could not load your orders");
          setLoading(false);
          return;
        }
        const normalizedOrders = normalizeOrderData(data);
        setOrders(normalizedOrders);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    void fetchOrders();
  }, [userID]);

  return (
    <div>
      <h2 className="text-5xl max-md:text-2xl font-medium mb-4">Your Orders</h2>
      {loading && <p>Loading orders...</p>}
      {!loading && orders.length === 0 && <p>No orders yet.</p>}

      <div className="flex flex-col gap-4">
        {orders.map((o) => {
          const id = String(o.id ?? o.order_id ?? "");
          const total = (o.order_total as number) ?? (o.total as number) ?? 0;
          const created = (o.created_at as string)
            ? new Date(o.created_at as string)
            : null;
          // safe access for nested unknown shapes
          const od = o.order_details as unknown as
            | { payment?: { status?: string } }
            | undefined;
          const topPayment = o as unknown as
            | { payment?: { status?: string } }
            | undefined;
          const paymentStatus =
            od?.payment?.status || topPayment?.payment?.status || "unknown";
          return (
            <div
              key={id}
              className="p-4 border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white shadow-sm"
            >
              <div className="mb-2 sm:mb-0 sm:mr-4 flex-shrink-0 flex items-center justify-center">
                {/* try to show a thumbnail for the order: prefer order-level image, fall back to first item image */}
                {(() => {
                  const od = o.order_details as unknown as
                    | Record<string, unknown>
                    | undefined;
                  const items =
                    (od && Array.isArray(od.items)
                      ? (od.items as Array<Record<string, unknown>>)
                      : []) || [];
                  const orderObj = o as Record<string, unknown>;
                  const orderImage =
                    typeof orderObj["image"] === "string"
                      ? (orderObj["image"] as string)
                      : undefined;
                  const imagesField = orderObj["images"] as unknown;
                  const imagesArray = Array.isArray(imagesField)
                    ? (imagesField as string[])
                    : undefined;
                  const orderImageFromArray =
                    imagesArray && imagesArray.length
                      ? imagesArray[0]
                      : undefined;
                  const firstItemImage = items.length
                    ? (items[0].image_url as string | undefined)
                    : undefined;
                  const src =
                    orderImage || orderImageFromArray || firstItemImage;
                  if (!src) return null;
                  return (
                    <img
                      src={String(src)}
                      alt={`order-${id}-img`}
                      className="w-24 h-auto sm:w-20 sm:h-20 object-cover"
                    />
                  );
                })()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">Order {id}</div>
                <div className="text-sm text-gray-600 truncate">{`₦${Number(
                  total
                ).toLocaleString("en-NG")}`}</div>
                <div className="text-sm text-gray-500 truncate">
                  {created ? created.toLocaleString() : "-"}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-2 sm:mt-0">
                <div className="text-sm whitespace-nowrap">{paymentStatus}</div>
                <button
                  className="px-3 py-1 border flex items-center cursor-pointer gap-2 interactive  hover:bg-gray-50 transition"
                  onClick={() => navigate(`/user/orders/${id}`)}
                  aria-label={`View order ${id}`}
                >
                  <span>View</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
