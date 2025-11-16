export interface FeaturedCollection {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  product_ids?: string[];
  category?: string;
  display_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateFeaturedCollectionInput {
  title: string;
  description?: string;
  image_url: string;
  product_ids?: string[];
  category?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface UpdateFeaturedCollectionInput {
  title?: string;
  description?: string;
  image_url?: string;
  product_ids?: string[];
  category?: string;
  display_order?: number;
  is_active?: boolean;
}
