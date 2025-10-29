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

  // ---------- Load Cart from Session ----------
  useEffect(() => {
    const localData = sessionStorage.getItem("cartItems");
    if (localData) {
      const parsedData: CartItem[] = JSON.parse(localData);
      setCartItems(parsedData);
      setCartLength(parsedData.length || 0);
    }
  }, []);

  // ---------- Cart Logic ----------
  const addToCart = useCallback(
    (value: Wearable, sizeParam?: string) => {
      setCartItems((prevCart) => {
        const prevCartItems = Array.isArray(prevCart) ? prevCart : [];

        const sizeToUse =
          sizeParam && sizeParam !== "SELECT A SIZE" ? sizeParam : selectedSize;

        if (!sizeToUse) {
          toast.error("Please select a size first");
          return prevCartItems;
        }

        const existingProduct = prevCartItems.find(
          (item) => item.id === value.id && item.size === sizeToUse
        );

        if (existingProduct) {
          toast.error(
            `This item in size ${sizeToUse} is already in your cart!`
          );
          return prevCartItems;
        }

        const newItem: CartItem = { ...value, quantity: 1, size: sizeToUse };
        const updatedCart = [...prevCartItems, newItem];

        toast.success(`Item added in size ${sizeToUse} to cart 🤩`);
        sessionStorage.setItem("cartItems", JSON.stringify(updatedCart));
        setCartLength(updatedCart.length);

        return updatedCart;
      });

      setSelectedSize("SELECT A SIZE");
    },
    [selectedSize]
  );

  const removeFromCart = useCallback((value: CartItem) => {
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

      return updatedCart;
    });
  }, []);

  const increaseQuantity = useCallback((value: CartItem) => {
    setCartItems((prevCart) =>
      prevCart.map((item) =>
        item.id === value.id && item.size === value.size
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }, []);

  const decreaseQuantity = useCallback((value: CartItem) => {
    setCartItems((prevCart) =>
      prevCart
        .map((item) =>
          item.id === value.id && item.size === value.size && item.quantity > 1
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

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
  }, []);

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
