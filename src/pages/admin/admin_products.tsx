import React, { useEffect, useState } from "react";
import AdminGuard from "../../components/admin/AdminGuard";
import AdminNavbar from "../../components/admin/AdminNavbar";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { supabase } from "../../lib/supabase";
import UploadForm from "../../components/admin/UploadForm";
import { toast } from "sonner";

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
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    admins: 0,
    revenue: 0,
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editSizes, setEditSizes] = useState("");

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

  const openEdit = (p: Product) => {
    setEditing(p);
    setEditName(p.name ?? "");
    setEditPrice(String(p.price ?? ""));
    setEditCategory(p.category ?? "");
    if (Array.isArray(p.size)) setEditSizes((p.size as string[]).join(","));
    else setEditSizes(String(p.size ?? ""));
  };

  const closeEdit = () => {
    setEditing(null);
    setEditName("");
    setEditPrice("");
    setEditCategory("");
    setEditSizes("");
  };

  const saveEdit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!editing?.id) return toast.error("Missing product id");
    try {
      const payload: Record<string, unknown> = {
        name: editName,
        price: Number(editPrice || 0),
        category: editCategory,
        size: editSizes
          ? JSON.stringify(editSizes.split(/[,;\s]+/).filter(Boolean))
          : null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("clothes")
        .update(payload)
        .eq("id", editing.id);
      if (error) {
        console.error("update product error:", error);
        toast.error("Could not update product");
        return;
      }
      toast.success("Product updated");
      closeEdit();
      void fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error("Could not update product");
    }
  };

  return (
    <AdminGuard>
      <AdminNavbar />
      <div className="flex">
        <AdminSidebar />
        <div className="p-8 flex-1 font-clash">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-medium">Admin dashboard</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowModal(true)}
                className="bg-black text-white px-4 py-2 cursor-pointer"
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
                  <div
                    key={p.id}
                    className="border p-3 rounded flex flex-col gap-3"
                  >
                    <div className="w-full h-40 bg-gray-100 rounded overflow-hidden">
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
                    <div className="flex-1">
                      <h4 className="font-medium">{p.name}</h4>
                      <div className="text-sm text-gray-600">{p.category}</div>
                      <div className="mt-2">
                        ₦{Number(p.price ?? 0).toLocaleString("en-NG")}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="px-3 py-1 bg-black text-white rounded"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Edit modal */}
          {editing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white p-6 rounded max-w-lg w-full mx-4">
                <h3 className="text-xl font-medium mb-4">Edit product</h3>
                <form onSubmit={saveEdit} className="space-y-3">
                  <div>
                    <label className="text-sm block mb-1">Name</label>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full border p-2 rounded"
                    />
                  </div>
                  <div>
                    <label className="text-sm block mb-1">Price</label>
                    <input
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-full border p-2 rounded"
                      type="number"
                    />
                  </div>
                  <div>
                    <label className="text-sm block mb-1">Category</label>
                    <input
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full border p-2 rounded"
                    />
                  </div>
                  <div>
                    <label className="text-sm block mb-1">
                      Sizes (comma separated)
                    </label>
                    <input
                      value={editSizes}
                      onChange={(e) => setEditSizes(e.target.value)}
                      className="w-full border p-2 rounded"
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => closeEdit()}
                      className="px-4 py-2 border rounded"
                    >
                      Cancel
                    </button>
                    <button className="px-4 py-2 bg-black text-white rounded">
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="max-w-3xl w-full mx-4">
                <UploadForm
                  onClose={() => {
                    setShowModal(false);
                    void fetchStats();
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
};

export default AdminProducts;
