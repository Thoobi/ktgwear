import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { IoIosArrowBack } from "react-icons/io";
import { AiOutlinePlus } from "react-icons/ai";

type Product = {
  id?: string;
  name?: string;
  price?: number;
  category?: string;
  image_url?: string;
  images?: string[];
  size?: string | string[];
  created_at?: string;
};

const ProductEditForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [sizes, setSizes] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("name")
          .order("name");

        if (error) {
          console.error("Error fetching categories:", error);
          return;
        }

        const categoryNames = data.map((cat) => cat.name);
        setCategories(categoryNames);
      } catch (err) {
        console.error("Error:", err);
      }
    };

    void fetchCategories();
  }, []);

  useEffect(() => {
    if (id) {
      loadProduct().catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Cleanup image previews on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach((p) => {
        try {
          URL.revokeObjectURL(p);
        } catch {
          // ignore
        }
      });
    };
  }, [imagePreviews]);

  const loadProduct = async () => {
    if (!id) {
      toast.error("Product ID not found");
      navigate("/admin/products");
      return;
    }

    setInitialLoading(true);
    try {
      const { data, error } = await supabase
        .from("clothes")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        toast.error("Failed to load product");
        navigate("/admin/products");
        return;
      }

      const productData = data as Product;
      setProduct(productData);
      setName(productData.name ?? "");
      setPrice(String(productData.price ?? ""));
      setCategory(productData.category ?? "");

      if (Array.isArray(productData.size)) {
        setSizes((productData.size as string[]).join(", "));
      } else {
        setSizes(String(productData.size ?? ""));
      }

      // Fetch images - handle both images array and image_url fallback
      const productImages = Array.isArray(productData.images)
        ? productData.images
        : [];
      setImages(productImages);
    } catch (err) {
      console.error("Error loading product:", err);
      toast.error("Could not load product");
      navigate("/admin/products");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) {
      setImageFiles([]);
      setImagePreviews([]);
      return;
    }

    setImageFiles(files);
    const previews = files.map((f) => URL.createObjectURL(f));
    setImagePreviews(previews);
  };

  const removeExistingImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    const url = imagePreviews[index];
    try {
      if (url) URL.revokeObjectURL(url);
    } catch {
      // ignore
    }

    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!product?.id || !name.trim()) {
      toast.error("Product name is required");
      return;
    }

    setLoading(true);

    try {
      let finalImages = [...images];

      // Upload any new image files
      if (imageFiles.length > 0) {
        const uploadedUrls: string[] = [];

        for (const file of imageFiles) {
          const fileName = `${Date.now()}_${Math.random()
            .toString(36)
            .slice(2, 8)}_${file.name}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("clothes")
            .upload(filePath, file);

          if (uploadError) {
            toast.error("Failed to upload image");
            console.error("Storage error:", uploadError);
            setLoading(false);
            return;
          }

          const { data: urlData } = supabase.storage
            .from("clothes")
            .getPublicUrl(filePath);
          const imageUrl = urlData?.publicUrl;
          if (imageUrl) uploadedUrls.push(imageUrl);
        }

        finalImages = [...finalImages, ...uploadedUrls];
      }

      const payload = {
        name: name.trim(),
        price: Number(price || 0),
        category: category.trim() || undefined,
        size: sizes
          ? JSON.stringify(sizes.split(/[,;\s]+/).filter(Boolean))
          : null,
        images: finalImages.length > 0 ? finalImages : null,
        image_url: finalImages[0] ?? null,
      };

      const { error } = await supabase
        .from("clothes")
        .update(payload)
        .eq("id", product.id);

      if (error) {
        console.error("Update error:", error);
        toast.error("Could not update product");
        return;
      }

      toast.success("Product updated successfully");
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="p-8 font-clash">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 font-clash max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate("/admin/products")}
          className="text-gray-600 hover:text-black mb-4 flex items-center cursor-pointer gap-2"
        >
          <span>
            <IoIosArrowBack size={20} />
          </span>{" "}
          Back to Products
        </button>
        <h2 className="text-3xl font-semibold">Edit Product</h2>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Price</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Enter product price"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Sizes</label>

            {/* Size Pills */}
            {sizes.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {sizes
                  .split(/[,;\s[\]]+/)
                  .filter(Boolean)
                  .map((size, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-black text-white pl-3 pr-1 py-1 rounded-full text-sm"
                    >
                      <span>{size.trim().replace(/['"]/g, "")}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const sizeArray = sizes
                            .split(/[,;\s[\]]+/)
                            .filter(Boolean);
                          const updated = sizeArray
                            .filter((_, i) => i !== idx)
                            .join(",");
                          setSizes(updated);
                        }}
                        className="flex items-center justify-center w-4 h-4 rounded-full bg-white text-black text-xs hover:bg-gray-200 cursor-pointer"
                        aria-label={`Remove size ${size}`}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Images</label>

            {/* Existing Images */}
            {images.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2 text-gray-700">
                  Current Images
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {images.map((src, idx) => (
                    <div
                      key={src + String(idx)}
                      className="relative group cursor-pointer"
                    >
                      <button
                        type="button"
                        onClick={() => removeExistingImage(idx)}
                        className="absolute z-10 -right-2 -top-2 bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        aria-label={`Remove image ${idx + 1}`}
                      >
                        ✕
                      </button>
                      <img
                        src={src}
                        alt={`Product ${idx + 1}`}
                        className="w-full h-auto object-cover rounded border border-gray-200"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images to Upload */}
            {imagePreviews.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2 text-gray-700">
                  New Images
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {imagePreviews.map((src, idx) => (
                    <div key={src + String(idx)} className="relative group">
                      <button
                        type="button"
                        onClick={() => removeNewImage(idx)}
                        className="absolute z-10 -right-2 -top-2 bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        aria-label={`Remove new image ${idx + 1}`}
                      >
                        ✕
                      </button>
                      <img
                        src={src}
                        alt={`New ${idx + 1}`}
                        className="w-full h-32 object-cover rounded border-2 border-black"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* File Input */}
            <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-300 rounded-lg px-4 py-8 cursor-pointer hover:border-black hover:bg-gray-50 transition-colors">
              <AiOutlinePlus size={24} className="text-gray-600" />
              <span className="text-gray-600">Click to add more images</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 cursor-pointer"
            >
              {loading ? "Saving..." : "Update Product"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              disabled={loading}
              className="flex-1 bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors disabled:bg-gray-100 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEditForm;
