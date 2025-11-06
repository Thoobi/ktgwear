import React, { useEffect, useState } from "react";
import AdminGuard from "../../components/admin/AdminGuard";
import AdminNavbar from "../../components/admin/AdminNavbar";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { supabase } from "../../lib/supabase";
import Logo from "../../assets/ktg-text-logo.png";

type Order = {
  id?: string;
  status?: string;
  order_total?: number | string;
  reference_id?: string;
  created_at?: string;
  order_details?: unknown;
  [key: string]: unknown;
};

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const fetchOrders = async (status?: string | null) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orderHistory")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setOrders([]);
        return;
      }

      const raw = (data as Order[]) || [];
      const processed = raw.map((item) => {
        const rec = item as Record<string, unknown>;
        let od: unknown = rec["order_details"] ?? rec["orderDetails"] ?? null;
        if (typeof od === "string") {
          try {
            od = JSON.parse(od);
          } catch {
            // leave as string if parsing fails
          }
        }
        return { ...item, order_details: od } as Order;
      });

      let finalList = processed;
      if (status) {
        finalList = processed.filter((o) => {
          const rec = o as Record<string, unknown>;
          const od = rec["order_details"] as
            | Record<string, unknown>
            | undefined;
          let payStatus: unknown = undefined;
          if (od && typeof od === "object") {
            const payment = od["payment"] as
              | Record<string, unknown>
              | undefined;
            payStatus = payment ? payment["status"] : od["payment_status"];
          }
          const effective =
            (typeof payStatus === "string" ? payStatus : undefined) ?? o.status;
          return effective === status;
        });
      }

      setOrders(finalList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchOrders(statusFilter);
  }, [statusFilter]);

  return (
    <AdminGuard>
      <AdminNavbar />
      <div className="flex">
        <AdminSidebar />
        <div className="p-8 flex-1 font-clash">
          <h2 className="text-2xl font-medium mb-4">Orders</h2>

          <div className="mb-4 space-x-2">
            {[
              { key: null, label: "All" },
              { key: "successful", label: "Successful" },
              { key: "cancelled", label: "Cancelled" },
              { key: "failed", label: "Failed" },
            ].map((b) => (
              <button
                key={String(b.key)}
                onClick={() => setStatusFilter(b.key as string | null)}
                className={
                  "px-3 py-1 border cursor-pointer" +
                  (statusFilter === b.key ? " bg-gray-200" : "")
                }
              >
                {b.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12" aria-busy>
              <img
                src={Logo}
                alt="loading"
                className="w-24 h-24 animate-pulse opacity-90"
              />
            </div>
          ) : (
            <div className="space-y-3">
              {orders.length === 0 ? (
                <div>No orders found.</div>
              ) : (
                orders.map((o: Order) => {
                  const rec = o as Record<string, unknown>;
                  const od = rec["order_details"] as
                    | Record<string, unknown>
                    | undefined;
                  const paymentStatus =
                    od && typeof od === "object"
                      ? (
                          od["payment"] as Record<string, unknown> | undefined
                        )?.["status"] ?? od["payment_status"]
                      : undefined;

                  return (
                    <div
                      key={String(o.id ?? Math.random())}
                      className="p-4 border"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="text-sm text-gray-600">Status:</div>
                      </div>
                      <div className="font-semibold">
                        Total: {o.order_total ?? "-"}
                      </div>
                      <div className="text-xs text-gray-500">
                        Reference: {o.reference_id ?? "-"}
                      </div>
                      <div className="text-xs text-gray-500">
                        Payment:{" "}
                        {typeof paymentStatus === "string"
                          ? paymentStatus
                          : "-"}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
};

export default AdminOrders;
