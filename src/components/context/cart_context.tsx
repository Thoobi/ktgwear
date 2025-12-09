"use client";

import React, {
  createContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../hooks/useAuth";

// ---------- Types ----------

export interface Wearable {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url: string;
  size: string[];
}

export interface CartItem extends Omit<Wearable, "size"> {
  size: string;
  quantity: number;
}

export interface ShippingInfoType {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip: string;
}

export type PaymentInfoType = Record<string, unknown>;

export type ReviewInfoType = Record<string, unknown>;

export type OrderInfoType = Record<string, unknown>;

interface ProgressTabItem {
  tag: string;
  range: number;
  name: string;
  content: React.ReactNode;
}

interface CartContextType {
  addToCart: (value: Wearable, size?: string) => void;
  removeFromCart: (value: CartItem) => void;
  increaseQuantity: (value: CartItem) => void;
  decreaseQuantity: (value: CartItem) => void;
  clearCart: () => void;
  cartLength: number;
  isCartVisible: boolean;
  setIsCartVisible: React.Dispatch<React.SetStateAction<boolean>>;
  disableCheckout: boolean;
  setDisableCheckout: React.Dispatch<React.SetStateAction<boolean>>;
  cartActive: boolean;
  setCartActive: React.Dispatch<React.SetStateAction<boolean>>;
  cartItems: CartItem[];
  cartTotal: number;
  selectedSize: string;
  setSelectedSize: React.Dispatch<React.SetStateAction<string>>;
  size: string[];
  activeTab: string;
  progressTab: ProgressTabItem[];
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  completedSteps: number[];
  setCompletedSteps: React.Dispatch<React.SetStateAction<number[]>>;
  shippingInfo: ShippingInfoType;
  setShippingInfo: React.Dispatch<React.SetStateAction<ShippingInfoType>>;
  paymentInfo: PaymentInfoType;
  setPaymentInfo: React.Dispatch<React.SetStateAction<PaymentInfoType>>;
  reviewInfo: ReviewInfoType;
  setReviewInfo: React.Dispatch<React.SetStateAction<ReviewInfoType>>;
  orderInfo: OrderInfoType;
  setOrderInfo: React.Dispatch<React.SetStateAction<OrderInfoType>>;
  orderPlaced: boolean;
  setOrderPlaced: React.Dispatch<React.SetStateAction<boolean>>;
  setMenuActive: React.Dispatch<React.SetStateAction<boolean>>;
  menuActive: boolean;
  getAllWears: () => Promise<void>;
  allWearables: Wearable[];
  total: number;
  limit: number;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  from: number;
  to: number;
  totalPages: number;
  loading: boolean;
}

// ---------- Progress Tabs ----------

const progressTab: ProgressTabItem[] = [
  {
    tag: "SHIPPING",
    range: 0,
    name: "Shipping Info",
    content: <div>Shipping Info</div>,
  },
  {
    tag: "PAYMENT",
    range: 1,
    name: "Payment",
    content: <div>Payment</div>,
  },
  {
    tag: "REVIEW",
    range: 2,
    name: "Review",
    content: <div>Review</div>,
  },
];

// ---------- Context ----------

const CartContext = createContext<CartContextType | undefined>(undefined);

// ---------- Provider ----------

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { userID } = useAuth();
  const [allWearables, setAllWearables] = useState<Wearable[]>([]);
  const [cartActive, setCartActive] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartLength, setCartLength] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [activeTab, setActiveTab] = useState(progressTab[0].tag);
  const [completedSteps, setCompletedSteps] = useState<number[]>([0]);
  const [menuActive, setMenuActive] = useState(false);

  const [shippingInfo, setShippingInfo] = useState<ShippingInfoType>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zip: "",
  });

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfoType>({});
  const [reviewInfo, setReviewInfo] = useState<ReviewInfoType>({});
  const [orderInfo, setOrderInfo] = useState<OrderInfoType>({});
  const [orderPlaced, setOrderPlaced] = useState<boolean>(false);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [disableCheckout, setDisableCheckout] = useState(true);

  // derive available sizes from fetched wearables (unique)
  const size = useMemo<string[]>(() => {
    const set = new Set<string>();
    allWearables.forEach((w) => {
      if (Array.isArray(w.size)) {
        w.size.forEach((s) => set.add(s));
      }
    });
    const arr = Array.from(set);
    // sensible fallback if wearables not loaded yet
    return arr.length > 0 ? arr : ["S", "M", "L", "XL"];
  }, [allWearables]);

  // ---------- Load Cart from Session (guest users only) ----------
  useEffect(() => {
    // Only load from session storage if user is NOT signed in
    if (userID) return;

    const localData = sessionStorage.getItem("cartItems");
    if (localData) {
      const parsedData: CartItem[] = JSON.parse(localData);
      setCartItems(parsedData);
      setCartLength(parsedData.length || 0);
    }
  }, [userID]);
  // ---------- Load Cart from DB for signed-in users ----------
  const [hasLoadedDbCart, setHasLoadedDbCart] = useState(false);

  useEffect(() => {
    // when user signs in, load their cart from DB only
    if (!userID || hasLoadedDbCart) return;

    const fetchDbCart = async () => {
      try {
        const { data, error } = await supabase
          .from("cart")
          .select("*")
          .eq("user_id", userID)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("fetch cart error:", error);
          return;
        }

        const rows = data as unknown as Array<Record<string, unknown>>;

        // Always use DB cart as source of truth for signed-in users
        if (!rows || rows.length === 0) {
          // empty cart in DB - clear local cart
          setCartItems([]);
          setCartLength(0);
          sessionStorage.removeItem("cartItems");
          setHasLoadedDbCart(true);
          return;
        }

        // map DB rows to CartItem shape
        const mapped: CartItem[] = rows.map((r) => {
          const productId = String(r["product_id"] ?? "");
          const name = String(r["name"] ?? "");
          const price = Number(r["price"] ?? 0) || 0;
          const category = String(r["category"] ?? "");
          const image_url = String(r["image_url"] ?? "");
          const qty = Number(r["quantity"] ?? 0) || 0;
          const sizeField = r["size"] as unknown;
          let size = "";
          if (Array.isArray(sizeField) && sizeField.length > 0)
            size = String((sizeField as unknown[])[0]);
          else if (typeof sizeField === "string") size = String(sizeField);

          return {
            id: productId,
            name,
            price,
            category,
            image_url,
            size,
            quantity: qty,
          } as CartItem;
        });

        // DB cart is the only source of truth for signed-in users
        setCartItems(mapped);
        setCartLength(mapped.length || 0);
        sessionStorage.setItem("cartItems", JSON.stringify(mapped));
        setHasLoadedDbCart(true);
      } catch (err) {
        console.error("error loading cart from db:", err);
      }
    };

    void fetchDbCart();
  }, [userID, hasLoadedDbCart]);

  // ---------- Cart Logic ----------
  const addToCart = useCallback(
    (value: Wearable, sizeParam?: string) => {
      console.log("=== ADD TO CART CALLED ===");
      console.log("Product:", value);
      console.log("Size param:", sizeParam);
      console.log("Selected size state:", selectedSize);
      console.log("User ID:", userID);

      setCartItems((prevCart) => {
        console.log("Previous cart:", prevCart);
        const prevCartItems = Array.isArray(prevCart) ? prevCart : [];

        const sizeToUse =
          sizeParam && sizeParam !== "SELECT A SIZE" ? sizeParam : selectedSize;

        console.log("Size to use:", sizeToUse);

        if (!sizeToUse || sizeToUse === "SELECT A SIZE") {
          console.log("ERROR: No size selected");
          toast.error("Please select a size first");
          return prevCartItems;
        }

        const existingProduct = prevCartItems.find(
          (item) => item.id === value.id && item.size === sizeToUse
        );

        if (existingProduct) {
          console.log("ERROR: Item already in cart");
          toast.error(
            `This item in size ${sizeToUse} is already in your cart!`
          );
          return prevCartItems;
        }

        const newItem: CartItem = { ...value, quantity: 1, size: sizeToUse };
        const updatedCart = [...prevCartItems, newItem];

        console.log("New item:", newItem);
        console.log("Updated cart:", updatedCart);

        toast.success(`Item added in size ${sizeToUse} to cart 🤩`);
        sessionStorage.setItem("cartItems", JSON.stringify(updatedCart));
        setCartLength(updatedCart.length);

        // persist to DB for signed-in users (or allow anonymous carts)
        (async () => {
          try {
            console.log("Attempting to save to DB...");
            console.log("UserID:", userID);
            console.log("Product ID:", value.id);

            if (!userID) {
              console.log("No user ID - skipping database save (guest cart)");
              return;
            }

            if (!value.id) {
              console.error("ERROR: Product ID is missing!");
              toast.error("Cannot add to cart: Product ID missing");
              return;
            }

            // find existing same product+size for this user
            const { data: existingRows, error: selErr } = await supabase
              .from("cart")
              .select("*")
              .eq("user_id", userID)
              .eq("product_id", value.id);

            if (selErr) {
              console.error("cart select error:", selErr);
              toast.error("Failed to check cart");
              return;
            }

            console.log("Existing rows:", existingRows);

            // attempt to find matching size entry (size stored as JSON/array)
            let matched = null as Record<string, unknown> | null;
            if (Array.isArray(existingRows)) {
              for (const r of existingRows) {
                try {
                  const s = (r as Record<string, unknown>)["size"] as unknown;
                  if (Array.isArray(s)) {
                    if (String(s[0]) === String(sizeToUse)) {
                      matched = r as Record<string, unknown>;
                      break;
                    }
                  } else if (typeof s === "string") {
                    if (String(s) === String(sizeToUse)) {
                      matched = r as Record<string, unknown>;
                      break;
                    }
                  }
                } catch {
                  /* ignore malformed row size */
                }
              }
            }

            if (matched) {
              console.log("Updating existing cart item quantity");
              const newQty = (Number(matched["quantity"] ?? 0) || 0) + 1;
              const { error: updErr } = await supabase
                .from("cart")
                .update({ quantity: newQty })
                .eq("id", matched["id"] as string);
              if (updErr) {
                console.error("cart update error:", updErr);
                toast.error("Failed to update cart quantity");
              } else {
                console.log("Cart updated successfully");
              }
            } else {
              console.log("Inserting new cart item");
              const payload = {
                user_id: userID,
                product_id: String(value.id),
                name: String(value.name),
                price: Number(value.price),
                category: String(value.category),
                image_url: String(value.image_url),
                size: [sizeToUse],
                quantity: 1,
              };
              console.log("Payload:", payload);

              const { data: insertData, error: insErr } = await supabase
                .from("cart")
                .insert([payload])
                .select();

              if (insErr) {
                console.error("cart insert error:", insErr);
                toast.error(`Failed to save to cart: ${insErr.message}`);
              } else {
                console.log("Cart inserted successfully:", insertData);
              }
            }
          } catch (err) {
            console.error("persist cart add error:", err);
            toast.error("Error saving cart to database");
          }
        })();

        return updatedCart;
      });

      setSelectedSize("SELECT A SIZE");
    },
    [selectedSize, userID]
  );

  const removeFromCart = useCallback(
    (value: CartItem) => {
      setCartItems((prevCart) => {
        if (!prevCart || prevCart.length < 1) {
          sessionStorage.removeItem("cartItems");
          toast.error("Cart is empty");
          setCartLength(0);
          return [];
        }

        const updatedCart = prevCart.filter(
          (item) => !(item.id === value.id && item.size === value.size)
        );

        toast.success("Item removed from cart");
        sessionStorage.setItem("cartItems", JSON.stringify(updatedCart));
        setCartLength(updatedCart.length);

        // persist removal to DB for signed-in users
        if (userID) {
          (async () => {
            try {
              const { data: existingRows, error: selErr } = await supabase
                .from("cart")
                .select("*")
                .eq("user_id", userID)
                .eq("product_id", value.id);

              if (selErr) console.error("cart select error:", selErr);

              if (Array.isArray(existingRows)) {
                for (const r of existingRows) {
                  try {
                    const s = (r as Record<string, unknown>)["size"] as unknown;
                    const sizeMatches = Array.isArray(s)
                      ? String((s as unknown[])[0]) === String(value.size)
                      : String(s) === String(value.size);
                    if (sizeMatches) {
                      await supabase
                        .from("cart")
                        .delete()
                        .eq(
                          "id",
                          (r as Record<string, unknown>)["id"] as string
                        );
                      break;
                    }
                  } catch {
                    // ignore
                  }
                }
              }
            } catch (err) {
              console.error("persist cart remove error:", err);
            }
          })();
        }

        return updatedCart;
      });
    },
    [userID]
  );

  const increaseQuantity = useCallback(
    (value: CartItem) => {
      setCartItems((prevCart) =>
        prevCart.map((item) =>
          item.id === value.id && item.size === value.size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );

      // persist to DB
      if (userID) {
        (async () => {
          try {
            const { data: existingRows, error: selErr } = await supabase
              .from("cart")
              .select("*")
              .eq("user_id", userID)
              .eq("product_id", value.id);
            if (selErr) console.error("cart select error:", selErr);

            if (Array.isArray(existingRows)) {
              for (const r of existingRows) {
                try {
                  const s = (r as Record<string, unknown>)["size"] as unknown;
                  const sizeMatches = Array.isArray(s)
                    ? String((s as unknown[])[0]) === String(value.size)
                    : String(s) === String(value.size);
                  if (sizeMatches) {
                    const newQty =
                      (Number(
                        (r as Record<string, unknown>)["quantity"] ?? 0
                      ) || 0) + 1;
                    const { error: updErr } = await supabase
                      .from("cart")
                      .update({ quantity: newQty })
                      .eq("id", (r as Record<string, unknown>)["id"] as string);
                    if (updErr) console.error("cart update error:", updErr);
                    break;
                  }
                } catch {
                  // ignore
                }
              }
            }
          } catch (err) {
            console.error("persist cart increase error:", err);
          }
        })();
      }
    },
    [userID]
  );

  const decreaseQuantity = useCallback(
    (value: CartItem) => {
      setCartItems((prevCart) =>
        prevCart
          .map((item) =>
            item.id === value.id &&
            item.size === value.size &&
            item.quantity > 1
              ? { ...item, quantity: item.quantity - 1 }
              : item
          )
          .filter((item) => item.quantity > 0)
      );

      if (userID) {
        (async () => {
          try {
            const { data: existingRows, error: selErr } = await supabase
              .from("cart")
              .select("*")
              .eq("user_id", userID)
              .eq("product_id", value.id);
            if (selErr) console.error("cart select error:", selErr);

            if (Array.isArray(existingRows)) {
              for (const r of existingRows) {
                try {
                  const s = (r as Record<string, unknown>)["size"] as unknown;
                  const sizeMatches = Array.isArray(s)
                    ? String((s as unknown[])[0]) === String(value.size)
                    : String(s) === String(value.size);
                  if (sizeMatches) {
                    const currentQty =
                      Number((r as Record<string, unknown>)["quantity"] ?? 0) ||
                      0;
                    if (currentQty > 1) {
                      const { error: updErr } = await supabase
                        .from("cart")
                        .update({ quantity: currentQty - 1 })
                        .eq(
                          "id",
                          (r as Record<string, unknown>)["id"] as string
                        );
                      if (updErr) console.error("cart update error:", updErr);
                    } else {
                      await supabase
                        .from("cart")
                        .delete()
                        .eq(
                          "id",
                          (r as Record<string, unknown>)["id"] as string
                        );
                    }
                    break;
                  }
                } catch {
                  // ignore
                }
              }
            }
          } catch (err) {
            console.error("persist cart decrease error:", err);
          }
        })();
      }
    },
    [userID]
  );

  const calculateTotal = useCallback((items: CartItem[]) => {
    return items.reduce(
      (total, item) => total + item.price * (item.quantity || 1),
      0
    );
  }, []);

  useEffect(() => {
    if (cartItems.length > 0) {
      setCartTotal(calculateTotal(cartItems));
      setCartLength(cartItems.length);
      sessionStorage.setItem("cartItems", JSON.stringify(cartItems));
      setDisableCheckout(false);
    } else {
      setCartTotal(0);
      setCartLength(0);
      setDisableCheckout(true);
    }
  }, [cartItems, calculateTotal]);

  // ---------- Pagination + Fetch ----------
  const [limit] = useState(7);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const totalPages = Math.ceil(total / limit);
  const [loading, setLoading] = useState(true);

  const getAllWears = async () => {
    setLoading(true);
    const { data, count, error } = await supabase
      .from("clothes")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error fetching wears:", error);
      toast.error(error.message || "Failed to fetch wearables");
    } else {
      setTotal(count || 0);
      setAllWearables(data || []);
    }

    setLoading(false);
  };

  // ---------- Clear Cart ----------
  const clearCart = useCallback(() => {
    setCartItems([]);
    setCartTotal(0);
    setCartLength(0);
    sessionStorage.removeItem("cartItems");

    if (userID) {
      (async () => {
        try {
          const { error } = await supabase
            .from("cart")
            .delete()
            .eq("user_id", userID);
          if (error) console.error("cart clear error:", error);
        } catch (err) {
          console.error("persist cart clear error:", err);
        }
      })();
    }
  }, [userID]);

  // ---------- Context Value ----------
  const value: CartContextType = {
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    cartLength,
    cartActive,
    setCartActive,
    cartItems,
    cartTotal,
    selectedSize,
    setSelectedSize,
    size,
    activeTab,
    progressTab,
    setActiveTab,
    completedSteps,
    setCompletedSteps,
    shippingInfo,
    setShippingInfo,
    paymentInfo,
    setPaymentInfo,
    reviewInfo,
    setReviewInfo,
    orderInfo,
    setOrderInfo,
    orderPlaced,
    setOrderPlaced,
    setMenuActive,
    menuActive,
    getAllWears,
    allWearables,
    total,
    limit,
    page,
    setPage,
    from,
    to,
    totalPages,
    loading,
    isCartVisible,
    setIsCartVisible,
    disableCheckout,
    setDisableCheckout,
  };

  // ---------- Render ----------
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export { CartContext };
