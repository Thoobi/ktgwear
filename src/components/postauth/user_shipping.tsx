import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type ShippingInfoType = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip: string;
};

export default function ShippingInfo() {
  const { userID } = useAuth();
  const [saved, setSaved] = useState<ShippingInfoType | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userID) return;
    const load = async () => {
      setLoading(true);
      try {
        if (!userID) {
          // fallback to localStorage
          const local = localStorage.getItem("savedShippingInfo");
          if (local) setSaved(JSON.parse(local) as ShippingInfoType);
          return;
        }

        console.log("loadSaved(user_shipping) userID:", userID);
        const { data, error } = await supabase
          .from("shippingInfo")
          .select("*, shipping_info")
          .eq("user_id", userID)
          .order("created_at", { ascending: false });
        console.log("shippingInfo query result:", { data, error });

        if (error) {
          console.error("fetchOrders error:", error);
          toast.error("Could not load your orders");
          return;
        }

        // data is an array of rows. pick the latest row and extract shipping_info if present.
        const rows = data as unknown as Array<Record<string, unknown>> | null;
        const latest = rows && rows.length ? rows[0] : null;
        const shippingPayload = latest ? latest.shipping_info ?? latest : null;
        setSaved(shippingPayload as ShippingInfoType | null);
      } catch (err) {
        console.error("load saved shipping error", err);
        setSaved(null);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [userID]);

  const handleRemove = async () => {
    if (!userID) {
      localStorage.removeItem("savedShippingInfo");
      setSaved(null);
      toast.success("Local saved shipping info removed");
      return;
    }

    try {
      // try nulling JSON column first
      const { error } = await supabase
        .from("shippingInfo")
        .upsert({ user_id: userID, shipping_info: null });
      if (error) {
        console.warn("JSON null-upsert failed, attempting delete rows:", error);
        // fallback: delete rows for this user_id
        const { error: delErr } = await supabase
          .from("shippingInfo")
          .delete()
          .eq("user_id", userID);
        if (delErr) {
          console.error("could not remove saved shipping rows", delErr);
          toast.error("Could not remove saved shipping info");
        } else {
          setSaved(null);
          toast.success("Saved shipping info removed");
        }
      } else {
        setSaved(null);
        toast.success("Saved shipping info removed");
      }
    } catch (err) {
      console.error("remove saved shipping error", err);
      toast.error("Could not remove saved shipping info");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-3">Saved Shipping Information</h2>
      {loading ? (
        <div>Loading...</div>
      ) : saved ? (
        <div className="border p-3 rounded">
          <div className="font-medium text-lg">
            {saved.firstName} {saved.lastName}
          </div>
          <div>{saved.address}</div>
          <div>
            {saved.city}, {saved.state} {saved.zip}
          </div>
          <div>{saved.country}</div>
          <div>{saved.phone}</div>
          <div className="mt-3">
            <button
              onClick={handleRemove}
              className="px-3 py-1 bg-red-500 text-white rounded"
            >
              Remove saved shipping
            </button>
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-600 flex flex-col gap-3">
          <div>No saved shipping information found.</div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/checkout")}
              className="px-3 py-1 bg-black text-white rounded"
            >
              Add shipping info now
            </button>
            <button
              onClick={() => {
                // allow user to save from checkout later — open checkout page in new tab
                window.open("/checkout", "_blank");
              }}
              className="px-3 py-1 border rounded"
            >
              Open checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
