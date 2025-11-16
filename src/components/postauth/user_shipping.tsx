import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner";

export type ShippingInfoType = {
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
  const [loading, setLoading] = useState<boolean>(false);
  const [hasRow, setHasRow] = useState<boolean | null>(null); // null = not checked yet

  const hasAnyShippingField = (s: ShippingInfoType | null): boolean => {
    if (!s) return false;
    return Object.values(s).some((v) => String(v ?? "").trim().length > 0);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (!userID) {
          const local = localStorage.getItem("savedShippingInfo");
          if (local) {
            setSaved(JSON.parse(local) as ShippingInfoType);
            setHasRow(true);
          } else {
            setSaved(null);
            setHasRow(false);
          }
          return;
        }

        const { data, error } = await supabase
          .from("shipping_info")
          .select("id, shipping_info, user_id, created_at")
          .eq("user_id", userID)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("fetch shipping error:", error);
          toast.error("Could not load your saved shipping information");
          setSaved(null);
          setHasRow(false);
          return;
        }

        const rows = data as unknown as Array<Record<string, unknown>> | null;
        const latest = rows && rows.length ? rows[0] : null;
        if (!latest) {
          setSaved(null);
          setHasRow(false);
        } else {
          setHasRow(true);
          const shippingPayload =
            (latest as Record<string, unknown>)["shipping_info"] ?? null;
          setSaved(shippingPayload as unknown as ShippingInfoType | null);
        }
      } catch (e) {
        console.error("load saved shipping error", e);
        setSaved(null);
        setHasRow(false);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [userID]);

  const handleRemove = async () => {
    // show modal instead of window.confirm — this function is now unused
    setConfirmOpen(true);
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const performRemove = async () => {
    setDeleting(true);
    try {
      if (!userID) {
        localStorage.removeItem("savedShippingInfo");
        setSaved(null);
        setHasRow(false);
        toast.success("Local saved shipping info removed");
        setConfirmOpen(false);
        return;
      }

      // Prefer deleting the row so we can show "No shipping information stored." clearly
      const delRes = await supabase
        .from("shipping_info")
        .delete()
        .eq("user_id", userID);

      // Supabase returns { data, error, status }
      const delError = (delRes as unknown as { error?: unknown }).error ?? null;
      if (delError) {
        // log full response for debugging (visible in browser console)
        console.error("shipping_info delete failed", delRes);

        // fallback to upsert-null if delete fails for some reason
        console.warn(
          "delete failed, attempting upsert-null fallback",
          delError
        );
        const upsertRes = await supabase
          .from("shipping_info")
          .upsert(
            { user_id: userID, shipping_info: null },
            { onConflict: "user_id" }
          );
        const upsertErr =
          (upsertRes as unknown as { error?: unknown }).error ?? null;
        if (upsertErr) {
          console.error(
            "could not remove saved shipping rows (upsert fallback)",
            upsertRes
          );
          toast.error("Could not remove saved shipping info");
          setConfirmOpen(false);
          return;
        }
      }

      setSaved(null);
      setHasRow(false);
      toast.success("Saved shipping info removed");
      setConfirmOpen(false);
    } catch (e) {
      console.error("remove saved shipping error (exception)", e);
      toast.error("Could not remove saved shipping info");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="py-4">
      <h2 className="text-5xl max-md:text-2xl font-medium mb-3">
        Saved Shipping Information
      </h2>

      {loading ? (
        <div>Loading...</div>
      ) : hasRow === false && saved === null ? (
        <div className="text-sm text-gray-600">
          No shipping information stored.
        </div>
      ) : hasAnyShippingField(saved) ? (
        <div className="border p-3">
          <div className="font-medium text-lg">
            {saved!.firstName} {saved!.lastName}
          </div>
          <div>{saved!.address}</div>
          <div>
            {saved!.city}, {saved!.state} {saved!.zip}
          </div>
          <div>{saved!.country}</div>
          <div>{saved!.phone}</div>
          <div className="mt-3">
            <button
              onClick={handleRemove}
              className="px-3 py-2 bg-red-500 text-white cursor-pointer"
            >
              Remove saved shipping
            </button>
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-600 flex flex-col gap-3">
          <div>Your saved shipping information is empty.</div>
        </div>
      )}

      {confirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-40" />
          <div className="bg-white p-6 shadow-lg z-10 w-[min(520px,90%)]">
            <h3 className="text-lg font-semibold mb-2">
              Remove saved shipping?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to remove your saved shipping information?
              This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmOpen(false)}
                className="px-3 py-2 border cursor-pointer"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={performRemove}
                className="px-3 py-2 bg-red-600 text-white cursor-pointer"
                disabled={deleting}
              >
                {deleting ? "Removing..." : "Remove saved shipping"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
