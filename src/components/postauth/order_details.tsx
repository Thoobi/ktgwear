import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { BsFillPatchCheckFill } from "react-icons/bs";
import { MdError } from "react-icons/md";

import Navbar from "./navbar";
import Sidebar from "./sidebar";
import PostAuthLayout from "../../layout/postauth_layout";

const sidebarItems = [
  { tab: "ORDERS", name: "Orders", path: "/user/orders", component: <div /> },
  { tab: "SHIPPING", name: "Shipping info", path: "/user", component: <div /> },
];

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("ORDERS");

  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      setLoading(true);
      let hadError = false;
      try {
        const { data, error } = await supabase
          .from("orderHistory")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("fetchOrder error:", error);
          toast.error("Could not load order details");
          hadError = true;
        } else {
          setOrder(data as Record<string, unknown>);
        }
      } catch (err) {
        console.error(err);
        toast.error("Could not load order details");
        hadError = true;
      }

      // ensure loading state is always cleared (no `finally` to satisfy React Compiler)
      setLoading(false);

      if (hadError) return;
    };

    void fetchOrder();
  }, [id]);

  // derived values
  let created: Date | null = null;
  let totalAmount = 0;
  let items: Array<Record<string, unknown>> = [];
  let shipping: Record<string, unknown> = {};
  let payment: Record<string, unknown> = {};
  let referenceVal = "-";
  let uniqueImages: string[] = [];

  if (order) {
    if (order.created_at) {
      try {
        created = new Date(order.created_at as string);
      } catch {
        created = null;
      }
    }
    totalAmount = Number(order.order_total ?? order.total ?? 0) || 0;
    const orderDetails =
      (order.order_details as Record<string, unknown> | undefined) ?? {};
    items = ((orderDetails.items as
      | Array<Record<string, unknown>>
      | undefined) || []) as Array<Record<string, unknown>>;
    shipping =
      (orderDetails.shipping as Record<string, unknown> | undefined) || {};
    payment =
      (orderDetails.payment as Record<string, unknown> | undefined) || {};

    const refRaw = payment?.reference ?? order?.reference_id ?? "-";
    referenceVal = typeof refRaw === "string" ? refRaw : String(refRaw);

    const images: string[] = [];
    // Collect images with safe, explicit checks (no try/catch or complex expressions)
    const maybeImage = (order as Record<string, unknown>)["image"];
    if (typeof maybeImage === "string" && maybeImage.trim()) {
      images.push(maybeImage);
    }

    const maybeImages = (order as Record<string, unknown>)["images"];
    if (Array.isArray(maybeImages)) {
      for (const mi of maybeImages) {
        if (typeof mi === "string" && mi.trim()) images.push(mi);
      }
    }

    for (const it of items || []) {
      const img = (it as Record<string, unknown>)["image_url"];
      if (typeof img === "string" && img.trim()) images.push(img);
    }

    uniqueImages = Array.from(new Set(images));
  }

  if (loading) {
    return (
      <PostAuthLayout
        navbar={
          <Navbar
            navLinks={sidebarItems}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        }
      >
        <div className="flex-1 flex items-center justify-center">
          Loading...
        </div>
      </PostAuthLayout>
    );
  }

  if (!order) {
    return (
      <PostAuthLayout
        navbar={
          <Navbar
            navLinks={sidebarItems}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        }
        sidebar={
          <Sidebar
            navlink={sidebarItems}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
        }
      >
        <div className="flex-1 flex items-center justify-center">
          No order found
        </div>
      </PostAuthLayout>
    );
  }

  return (
    <PostAuthLayout
      navbar={
        <Navbar
          navLinks={sidebarItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      }
      sidebar={
        <Sidebar
          navlink={sidebarItems}
          setActiveTab={setActiveTab}
          activeTab={activeTab}
        />
      }
    >
      <button
        onClick={() => navigate(-1)}
        className="text-base text-gray-600 hover:underline cursor-pointer mb-4"
      >
        Back
      </button>

      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-2">
          <div>
            <h2 className="text-2xl max-md:text-lg max-md:font-medium font-semibold">
              Order #{String(order?.id ?? "")}
            </h2>
            <div className="text-sm text-gray-500 mt-1">
              {created ? created.toLocaleString() : "-"}
            </div>
          </div>
        </div>

        <div className="grid  grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {uniqueImages.length > 0 && (
              <div className="mb-4">
                <div className="font-medium mb-2">Images</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {uniqueImages.map((src, idx) => (
                    <img
                      key={idx}
                      src={String(src)}
                      alt={`order-${String(order?.id ?? id)}-img-${idx}`}
                      className="w-full object-cover h-auto border"
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
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between border p-3 gap-3"
                  >
                    <div className="flex items-center gap-3 mb-2 sm:mb-0">
                      {it?.image_url ? (
                        <img
                          src={String(it.image_url)}
                          alt={String(it?.name ?? "")}
                          className="w-16 h-auto sm:w-20 sm:h-auto object-cover border"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded" />
                      )}
                      <div>
                        <div className="font-medium uppercase truncate">
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

          <aside className="self-start order-first lg:order-none mb-4 lg:mb-0 border border-dashed border-gray-400 p-4">
            <div className="flex justify-center items-center mb-5">
              {payment?.status === "successful" && (
                <BsFillPatchCheckFill className="text-[40px] text-green-600" />
              )}
              {(payment?.status === "cancelled" ||
                payment?.status === "failed") && (
                <MdError className="text-5xl text-red-600" />
              )}
            </div>
            <div className="flex flex-col items-center justify-center gap-1 my-2">
              <div className="text-center">
                <div className="text-lg font-medium">
                  ₦{totalAmount.toLocaleString("en-NG")}
                </div>
              </div>
              <span className="font-normal text-xs">
                {String(payment?.status ?? "unknown")}
              </span>
              <div className="text-xs text-gray-700">
                Reference: <span className="text-gray-600">{referenceVal}</span>
              </div>
            </div>

            <div className="mt-2 mb-2 flex justify-center flex-col">
              <h4 className="font-medium ">Shipping Details</h4>
              <div className="text-sm text-gray-700">
                {String(shipping?.firstName ?? "")}{" "}
                {String(shipping?.lastName ?? "")}
              </div>
              <div className="text-sm text-gray-700">
                {String(shipping?.address ?? "")}
              </div>
              <div className="text-sm text-gray-700">
                {String(shipping?.city ?? "")} {String(shipping?.state ?? "")}
              </div>
              <div className="text-sm text-gray-700">
                {String(shipping?.country ?? "")}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </PostAuthLayout>
  );
};

export default OrderDetails;
