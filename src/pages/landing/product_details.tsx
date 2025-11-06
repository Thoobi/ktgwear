import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { useCart } from "../../components/hooks/useCart";
import type { Wearable } from "../../components/context/cart_context";
import { IoIosClose } from "react-icons/io";

const ProductDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Wearable | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("clothes")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setError(error?.message || "Product not found");
        setProduct(null);
      } else {
        setProduct(data as Wearable);

        // Normalize sizes coming from the API. Some rows may store sizes as
        // an array (preferred) or as a string like "S,M,L". Ensure we always
        // set an array of strings so .map works safely.
        const rawSizes = (data as unknown as Record<string, unknown>).size;
        let sizes: string[] = [];

        const clean = (str: string) =>
          String(str)
            .replace(/^[\x5B"']+|[\x5D"']+$/g, "")
            .trim();

        if (Array.isArray(rawSizes)) {
          sizes = rawSizes
            .filter(Boolean)
            .map((v) => clean(String(v)))
            .filter((s) => s.length > 0);
        } else if (typeof rawSizes === "string") {
          // split on commas, semicolons or whitespace
          sizes = rawSizes
            .split(/[;,\s]+/)
            .map((s) => clean(s))
            .filter((s) => s.length > 0);
        } else if (rawSizes == null) {
          sizes = [];
        } else {
          // Fallback: try to coerce to string and split
          try {
            sizes = String(rawSizes)
              .split(/[;,\s]+/)
              .map((s) => clean(s))
              .filter((s) => s.length > 0);
          } catch {
            sizes = [];
          }
        }

        setAvailableSizes(sizes);
        if (sizes.length > 0) {
          setSelectedSizes([sizes[0]]);
        }

        // normalize images: support multiple shapes from the DB
        const imgsField =
          (data as unknown as Record<string, unknown>)["images"] ??
          (data as unknown as Record<string, unknown>)["image_urls"] ??
          (data as unknown as Record<string, unknown>)["image_url"];

        const normalizedImages: string[] = [];

        try {
          if (Array.isArray(imgsField)) {
            // array of urls or objects
            for (const v of imgsField as unknown[]) {
              if (!v) continue;
              if (typeof v === "string") normalizedImages.push(v);
              else if (typeof v === "object" && v != null) {
                const maybe =
                  (v as Record<string, unknown>)["url"] ??
                  (v as Record<string, unknown>)["image_url"] ??
                  (v as Record<string, unknown>)["src"];
                if (maybe) normalizedImages.push(String(maybe));
              }
            }
          } else if (typeof imgsField === "string") {
            const s = String(imgsField).trim();
            // try to parse JSON array first
            if (s.startsWith("[") && s.endsWith("]")) {
              try {
                const parsed = JSON.parse(s);
                if (Array.isArray(parsed)) {
                  parsed.forEach((p) => {
                    if (typeof p === "string") normalizedImages.push(p);
                    else if (p && typeof p === "object") {
                      const maybe = p["url"] ?? p["image_url"] ?? p["src"];
                      if (maybe) normalizedImages.push(String(maybe));
                    }
                  });
                }
              } catch {
                // not valid json, fall back to comma-split
              }
            }

            if (normalizedImages.length === 0) {
              // split on common separators if comma-separated list
              const parts = s
                .split(/[;,\s]+/)
                .map((p) => p.trim())
                .filter(Boolean);
              if (parts.length > 1) normalizedImages.push(...parts);
              else normalizedImages.push(s);
            }
          } else if (imgsField != null) {
            normalizedImages.push(String(imgsField));
          }
        } catch {
          // ignore and fallback to single image
        }

        if (normalizedImages.length > 0) {
          setImages(normalizedImages);
          setActiveImage(0);
        } else {
          // fallback to the old single image property
          const single = String(
            (data as unknown as Record<string, unknown>)["image_url"] ?? ""
          );
          if (single) setImages([single]);
        }
      }
      setLoading(false);
    };

    void fetchProduct();
  }, [id]);

  const handleAdd = () => {
    if (!product) return;
    if (!selectedSizes || selectedSizes.length === 0) {
      toast.error("Please select at least one size");
      return;
    }

    selectedSizes.forEach((s) => {
      // apply 50% price increase for sizes 3XL to 6XL
      const sizeKey = String(s).replace(/\s+/g, "").toUpperCase();
      const isLarge = /^(?:XL)$/.test(sizeKey);
      const adjustedPrice = isLarge
        ? Math.round(product.price * 1.5)
        : product.price;
      const productWithAdjustedPrice = {
        ...(product as Wearable),
        price: adjustedPrice,
      };
      addToCart(productWithAdjustedPrice, s);
    });
    setSelectedSizes([]);
  };

  if (loading)
    return (
      <div className="min-h-screen justify-center py-12 font-clash">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
          {/* Image skeleton */}
          <div className="w-full h-[480px] bg-gray-200 rounded-md animate-pulse" />

          <div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-6 animate-pulse" />

            <div className="flex flex-wrap gap-2 mb-4">
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
            </div>

            <div className="flex gap-3">
              <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
              <div className="h-10 bg-gray-200 rounded w-24 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!product) return <div className="p-8">No product found.</div>;

  return (
    <div className="min-h-screen pt-20 pb-12 font-clash">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
        <div className="">
          <div className="w-full h-[480px] flex items-center justify-center bg-white">
            <img
              src={images[activeImage] ?? product.image_url}
              alt={product.name}
              className="max-h-[480px] w-full object-contain"
            />
          </div>

          {images && images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {images.map((src, idx) => (
                <button
                  key={String(src) + idx}
                  onClick={() => setActiveImage(idx)}
                  className={`flex-none border rounded p-1 bg-white ${
                    idx === activeImage ? "ring-2 ring-black" : ""
                  }`}
                >
                  <img
                    src={src}
                    alt={`${product.name} ${idx + 1}`}
                    className="h-16 w-16 object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col pt-5">
          <h1 className="text-3xl font-semibold mb-2 uppercase">
            {product.name}
          </h1>
          <p className="text-sm text-gray-600 mb-4">{product.category}</p>
          <p className="text-2xl font-medium mb-6">
            {(() => {
              if (!selectedSizes || selectedSizes.length === 0) {
                return `₦${product.price.toLocaleString("en-NG")}`;
              }

              // compute adjusted prices for selected sizes
              const prices = selectedSizes.map((s) => {
                const sizeKey = String(s).replace(/\s+/g, "").toUpperCase();
                const isLarge = /^(?:[3-6]XL)$/.test(sizeKey);
                return isLarge
                  ? Math.round(product.price * 1.5)
                  : product.price;
              });

              const uniquePrices = Array.from(new Set(prices));
              if (uniquePrices.length === 1) {
                return `₦${uniquePrices[0].toLocaleString("en-NG")}`;
              }

              const min = Math.min(...uniquePrices);
              const max = Math.max(...uniquePrices);
              return `₦${min.toLocaleString("en-NG")} - ₦${max.toLocaleString(
                "en-NG"
              )}`;
            })()}
          </p>

          <div className="mb-6">
            <h4 className="font-medium mb-2">Select size</h4>
            <div className="flex flex-wrap gap-2">
              {availableSizes.length > 0 ? (
                availableSizes.map((s) => {
                  const selected = selectedSizes.includes(s);
                  return (
                    <button
                      key={s}
                      onClick={() =>
                        setSelectedSizes((prev) =>
                          prev.includes(s)
                            ? prev.filter((x) => x !== s)
                            : [...prev, s]
                        )
                      }
                      className={`px-3 py-0.5 border text-sm rounded-full cursor-pointer ${
                        selected ? "bg-black text-white" : "bg-white"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })
              ) : (
                <div className="text-sm text-gray-500">No sizes available</div>
              )}
            </div>
            {selectedSizes && selectedSizes.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedSizes.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-2 pl-3 pr-1 py-1 bg-black text-white rounded-full"
                  >
                    <span className="text-sm">{s}</span>
                    <button
                      onClick={() =>
                        setSelectedSizes((prev) => prev.filter((x) => x !== s))
                      }
                      aria-label={`Remove ${s}`}
                      className="text-xs bg-white cursor-pointer text-black rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      <IoIosClose className="text-base" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAdd}
              className="bg-black text-white px-5 py-2 cursor-pointer"
            >
              Add to cart
            </button>
            <button
              onClick={() => navigate(-1)}
              className="border px-5 py-2 cursor-pointer"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

// Removed accidental markdown code fence wrappers
