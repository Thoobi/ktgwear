import React, { useEffect, useState } from "react";
import AdminGuard from "../../components/admin/AdminGuard";
import AdminNavbar from "../../components/admin/AdminNavbar";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

type Profile = { id?: string; email?: string; role?: string };

const AdminManage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState<Profile[]>([]);

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id,email,role")
        .eq("role", "admin");
      if (error) {
        console.error("fetchAdmins error:", error);
        toast.error("Could not load admins");
        return;
      }
      setAdmins((data as Profile[]) || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    void fetchAdmins();
  }, []);

  const promote = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email) return toast.error("Enter an email");
    setLoading(true);
    try {
      // find profile by email
      const { data: prof, error: selErr } = await supabase
        .from("profiles")
        .select("id,role")
        .eq("email", email)
        .single();
      if (selErr) {
        console.error(selErr);
        toast.error("User profile not found. Ensure the user has signed up.");
        return;
      }
      const id = (prof as Profile).id;
      if (!id) {
        toast.error("Could not determine user id for this email.");
        return;
      }

      if ((prof as Profile).role === "admin") {
        toast("User is already an admin");
        return;
      }

      const { error: upErr } = await supabase
        .from("profiles")
        .update({ role: "admin", updated_at: new Date().toISOString() })
        .eq("id", id);
      if (upErr) {
        console.error(upErr);
        toast.error("Could not promote user");
        return;
      }
      toast.success("User promoted to admin");
      setEmail("");
      void fetchAdmins();
    } finally {
      setLoading(false);
    }
  };

  const demote = async (id?: string) => {
    if (!id) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: "user", updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) {
        console.error(error);
        toast.error("Could not demote user");
        return;
      }
      toast.success("User demoted");
      void fetchAdmins();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminGuard>
      <AdminNavbar />
      <div className="flex">
        <AdminSidebar />
        <div className="p-8 max-w-2xl flex-1">
          <h2 className="text-2xl font-semibold mb-4">Manage Admins</h2>

          <form onSubmit={promote} className="mb-6 flex gap-2">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="border p-2 flex-1"
              type="email"
            />
            <button
              disabled={loading}
              className="bg-black text-white px-4 py-2 cursor-pointer"
            >
              Promote
            </button>
          </form>

          <div>
            <h3 className="font-medium mb-2">Current admins</h3>
            <div className="space-y-2">
              {admins.length === 0 && <div>No admins yet.</div>}
              {admins.map((a) => (
                <div
                  key={a.id}
                  className="p-3 border flex items-center justify-between"
                >
                  <h3 className="text-black">{a.email}</h3>
                  <div>
                    <button
                      onClick={() => demote(a.id)}
                      className="px-3 py-1 border text-sm cursor-pointer"
                    >
                      Demote
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
};

export default AdminManage;
