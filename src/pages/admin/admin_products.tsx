import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminGuard from "../../components/admin/AdminGuard";
import AdminNavbar from "../../components/admin/AdminNavbar";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import AddCategoryModal from "../../components/admin/AddCategoryModal";

type Product = {
  id?: string;
  name?: string;
  price?: number;
  category?: string;
  image_url?: string;
  images?: string[];
  size?: string | string[];
  created_at?: string;
};

const AdminProducts: React.FC = () => {
  const navigate = useNavigate();
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    admins: 0,
    revenue: 0,
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const fetchStats = async () => {
    try {
      const { data: clothes } = await supabase
        .from("clothes")
        .select("id,price");
      const { data: orders } = await supabase
        .from("orderHistory")
        .select("id,order_total");
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
    } catch (err) {
      console.error("fetchStats error:", err);
    }
  };

  useEffect(() => {
    void fetchStats();
    void fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const { data, error } = await supabase.from("clothes").select("*");
      if (error) {
        console.error("fetchProducts error:", error);
        toast.error("Could not load products");
        return;
      }
      setProducts((data as Product[]) || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const deleteProduct = async (id: string, name: string) => {
    setDeleting({ id, name } as Product);
  };

  const confirmDelete = async () => {
    if (!deleting?.id) return;

    try {
      const { error } = await supabase
        .from("clothes")
        .delete()
        .eq("id", deleting.id);
      if (error) {
        console.error("delete product error:", error);
        toast.error("Could not delete product");
        return;
      }
      toast.success("Product deleted");
      setDeleting(null);
      void fetchProducts();
      void fetchStats();
    } catch (err) {
      console.error(err);
      toast.error("Could not delete product");
    }
  };

  return (
    <AdminGuard>
      <AdminNavbar />
      <div className="flex pt-[65px]">
        <AdminSidebar />
        <div className="p-8 flex-1 font-clash ml-56">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-medium">Admin dashboard</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddCategory(true)}
                className="bg-gray-700 text-white px-4 py-2 cursor-pointer hover:bg-gray-800 transition-colors"
              >
                Add category
              </button>
              <button
                onClick={() => navigate("/admin/products/add")}
                className="bg-black text-white px-4 py-2 cursor-pointer hover:bg-gray-900 transition-colors"
              >
                Add product
              </button>
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

          <div className="mt-6">
            <h3 className="text-xl font-medium mb-3">Products</h3>
            {loadingProducts ? (
              <div>Loading products...</div>
            ) : products.length === 0 ? (
              <div>No products found.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {products.map((p) => (
                  <div key={p.id} className="border p-3 flex flex-col gap-3">
                    <div className="w-full h-auto bg-gray-100 rounded overflow-hidden">
                      <img
                        src={
                          (Array.isArray(p.images) && p.images[0]) ||
                          p.image_url ||
                          ""
                        }
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-row items-center justify-between px-2">
                      <div>
                        <h4 className="font-medium uppercase">{p.name}</h4>
                        <div className="text-sm text-gray-600">
                          {p.category}
                        </div>
                      </div>
                      <div className="mt-2 font-medium">
                        ₦{Number(p.price ?? 0).toLocaleString("en-NG")}
                      </div>
                    </div>
                    <div className="flex gap-5">
                      <button
                        onClick={() => navigate(`/admin/products/edit/${p.id}`)}
                        className="px-6 py-1.5 bg-black text-white cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id!, p.name!)}
                        className="px-6 py-1.5 bg-red-500 text-white cursor-pointer hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delete confirmation modal */}
          {deleting && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white p-6 rounded max-w-md w-full mx-4">
                <h3 className="text-xl font-medium mb-4">Delete Product</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">"{deleting.name}"</span>? This
                  action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setDeleting(null)}
                    className="px-4 py-1.5 border cursor-pointer hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => void confirmDelete()}
                    className="px-4 py-1.5 bg-red-500 text-white cursor-pointer hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          <AddCategoryModal
            isOpen={showAddCategory}
            onClose={() => setShowAddCategory(false)}
            onCategoryAdded={() => {
              // Optional: refresh products if needed
              void fetchProducts();
            }}
          />
        </div>
      </div>
    </AdminGuard>
  );
};

export default AdminProducts;
