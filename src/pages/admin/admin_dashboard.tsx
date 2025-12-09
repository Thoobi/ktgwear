import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminGuard from "../../components/admin/AdminGuard";
import AdminNavbar from "../../components/admin/AdminNavbar";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

type Stats = {
  products: number;
  orders: number;
  admins: number;
  revenue: number;
};
type OrderRow = {
  id?: string;
  reference_id?: string;
  order_total?: number | string;
  created_at?: string;
};

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    products: 0,
    orders: 0,
    admins: 0,
    revenue: 0,
  });
  const [lastOrder, setLastOrder] = useState<OrderRow | null>(null);
  const [unreadOrder, setUnreadOrder] = useState<OrderRow | null>(null);

  const fetchStats = async () => {
    try {
      const { data: clothes } = await supabase.from("clothes").select("id");
      const { data: orders } = await supabase
        .from("orderHistory")
        .select("id,order_total,reference_id,created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      const { data: admins } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "admin");

      const revenue = (orders || []).reduce((acc, o) => {
        const row = o as Record<string, unknown>;
        const val = row["order_total"] ?? 0;
        return (
          acc +
          Number(typeof val === "string" || typeof val === "number" ? val : 0)
        );
      }, 0);

      setStats({
        products: (clothes || []).length,
        orders: (orders || []).length,
        admins: (admins || []).length,
        revenue,
      });

      // set the latest order
      if (orders && orders.length > 0) {
        const latest = orders[0] as OrderRow;
        setLastOrder(latest);
      }
    } catch (err) {
      console.error("fetchStats error:", err);
    }
  };

  // poll for new orders and notify
  useEffect(() => {
    let mounted = true;
    void fetchStats();

    const interval = setInterval(async () => {
      try {
        const { data: orders } = await supabase
          .from("orderHistory")
          .select("id,order_total,reference_id,created_at")
          .order("created_at", { ascending: false })
          .limit(1);

        if (!mounted) return;
        if (orders && orders.length > 0) {
          const latest = orders[0] as OrderRow;
          // if we have a lastOrder and ids differ, it's new
          if (lastOrder && latest.id && latest.id !== lastOrder.id) {
            setUnreadOrder(latest);
            toast.success("New order received");
          }
          // ensure lastOrder is updated
          setLastOrder((prev) => (prev?.id !== latest.id ? latest : prev));
        }
      } catch (err) {
        console.error("order poll error:", err);
      }
    }, 10000); // every 10s

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [lastOrder]);

  return (
    <AdminGuard>
      <AdminNavbar />
      <div className="flex font-clash pt-[65px]">
        <AdminSidebar />
        <div className="p-8 flex-1 ml-56">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-medium mb-4">Admin dashboard</h1>
            <div>
              {unreadOrder ? (
                <div className="p-3 bg-black text-white rounded flex items-center gap-3">
                  <div className="text-sm">New order</div>
                  <div className="text-xs opacity-90">
                    Ref: {unreadOrder.reference_id ?? "-"}
                  </div>
                  <button
                    onClick={() => setUnreadOrder(null)}
                    className="ml-4 text-sm underline"
                  >
                    Mark read
                  </button>
                </div>
              ) : (
                <div className="text-sm text-gray-600">No new orders</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-white border rounded shadow-sm">
              <div className="text-sm text-gray-500">Products</div>
              <div className="text-2xl font-semibold">{stats.products}</div>
            </div>
            <div className="p-4 bg-white border rounded shadow-sm">
              <div className="text-sm text-gray-500">Orders</div>
              <div className="text-2xl font-semibold">{stats.orders}</div>
            </div>
            <div className="p-4 bg-white border rounded shadow-sm">
              <div className="text-sm text-gray-500">Revenue</div>
              <div className="text-2xl font-semibold">
                ₦{stats.revenue.toLocaleString()}
              </div>
            </div>
            <div className="p-4 bg-white border rounded shadow-sm">
              <div className="text-sm text-gray-500">Admins</div>
              <div className="text-2xl font-semibold">{stats.admins}</div>
            </div>
          </div>

          <p className="mb-6">Quick links</p>
          <ul className="space-y-2">
            <li>
              <Link
                className="text-black hover:opacity-80"
                to="/admin/products"
              >
                Manage products
              </Link>
            </li>
            <li>
              <Link className="text-black hover:opacity-80" to="/admin/orders">
                View orders
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </AdminGuard>
  );
};

export default AdminDashboard;
