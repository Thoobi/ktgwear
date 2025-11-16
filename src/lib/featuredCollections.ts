import { supabase } from "./supabase";
import type {
  FeaturedCollection,
  CreateFeaturedCollectionInput,
  UpdateFeaturedCollectionInput,
} from "../types/featured";

/**
 * Fetch all active featured collections ordered by display_order
 */
export const getFeaturedCollections = async (): Promise<{
  data: FeaturedCollection[] | null;
  error: Error | null;
}> => {
  try {
    const { data, error } = await supabase
      .from("featured_collections")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching featured collections:", error);
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as FeaturedCollection[], error: null };
  } catch (err) {
    console.error("Unexpected error fetching featured collections:", err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
};

/**
 * Fetch all featured collections (admin only - includes inactive ones)
 */
export const getAllFeaturedCollections = async (): Promise<{
  data: FeaturedCollection[] | null;
  error: Error | null;
}> => {
  try {
    const { data, error } = await supabase
      .from("featured_collections")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching all featured collections:", error);
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as FeaturedCollection[], error: null };
  } catch (err) {
    console.error("Unexpected error fetching all featured collections:", err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
};

/**
 * Get featured collections by category
 */
export const getFeaturedCollectionsByCategory = async (
  category: string
): Promise<{
  data: FeaturedCollection[] | null;
  error: Error | null;
}> => {
  try {
    const { data, error } = await supabase
      .from("featured_collections")
      .select("*")
      .eq("is_active", true)
      .eq("category", category)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching featured collections by category:", error);
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as FeaturedCollection[], error: null };
  } catch (err) {
    console.error(
      "Unexpected error fetching featured collections by category:",
      err
    );
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
};

/**
 * Get a single featured collection by ID
 */
export const getFeaturedCollectionById = async (
  id: string
): Promise<{
  data: FeaturedCollection | null;
  error: Error | null;
}> => {
  try {
    const { data, error } = await supabase
      .from("featured_collections")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching featured collection:", error);
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as FeaturedCollection, error: null };
  } catch (err) {
    console.error("Unexpected error fetching featured collection:", err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
};

/**
 * Create a new featured collection (admin only)
 */
export const createFeaturedCollection = async (
  input: CreateFeaturedCollectionInput
): Promise<{
  data: FeaturedCollection | null;
  error: Error | null;
}> => {
  try {
    const { data, error } = await supabase
      .from("featured_collections")
      .insert([input])
      .select()
      .single();

    if (error) {
      console.error("Error creating featured collection:", error);
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as FeaturedCollection, error: null };
  } catch (err) {
    console.error("Unexpected error creating featured collection:", err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
};

/**
 * Update an existing featured collection (admin only)
 */
export const updateFeaturedCollection = async (
  id: string,
  input: UpdateFeaturedCollectionInput
): Promise<{
  data: FeaturedCollection | null;
  error: Error | null;
}> => {
  try {
    const { data, error } = await supabase
      .from("featured_collections")
      .update(input)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating featured collection:", error);
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as FeaturedCollection, error: null };
  } catch (err) {
    console.error("Unexpected error updating featured collection:", err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
};

/**
 * Delete a featured collection (admin only)
 */
export const deleteFeaturedCollection = async (
  id: string
): Promise<{
  error: Error | null;
}> => {
  try {
    const { error } = await supabase
      .from("featured_collections")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting featured collection:", error);
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (err) {
    console.error("Unexpected error deleting featured collection:", err);
    return {
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
};

/**
 * Toggle featured collection active status (admin only)
 */
export const toggleFeaturedCollectionStatus = async (
  id: string,
  is_active: boolean
): Promise<{
  data: FeaturedCollection | null;
  error: Error | null;
}> => {
  return updateFeaturedCollection(id, { is_active });
};
