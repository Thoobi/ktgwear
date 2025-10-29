import { supabase } from "./supabase";

export type OrderDetails = {
  items: Array<Record<string, unknown>>;
  shipping: Record<string, unknown>;
  payment?: Record<string, unknown>;
  meta?: Record<string, unknown>;
};

export type SaveOrderResult = {
  data: Record<string, unknown> | null;
  error: unknown;
};

export async function saveOrderHistory(opts: {
  order_total: number;
  order_details: OrderDetails;
  reference_id?: string;
  user_id?: string;
  delivery_price?: number;
}): Promise<SaveOrderResult> {
  const {
    order_total,
    order_details,
    reference_id = "",
    user_id = undefined,
    delivery_price = 0,
  } = opts;

  const payload: Record<string, unknown> = {
    order_total,
    // make sure items are plain objects for DB serialization
    order_details: {
      ...order_details,
      items: order_details.items.map((it) => ({ ...it })),
    },
    reference_id,
    delivery_price,
  };

  if (user_id) {
    payload.user_id = user_id;
  }

  const { data, error } = await supabase
    .from("orderHistory")
    .insert([payload])
    .select()
    .single();

  return { data: data as Record<string, unknown> | null, error };
}

export default saveOrderHistory;
