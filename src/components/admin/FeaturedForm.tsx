import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  createFeaturedCollection,
  updateFeaturedCollection,
  getFeaturedCollectionById,
} from "../../lib/featuredCollections";
import type { CreateFeaturedCollectionInput } from "../../types/featured";
import { toast } from "sonner";
import { IoIosArrowBack } from "react-icons/io";
import { supabase } from "../../lib/supabase";

interface FeaturedFormProps {
  collectionId?: string;
  mode: "add" | "edit";
}

const FeaturedForm: React.FC<FeaturedFormProps> = ({ collectionId, mode }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(mode === "edit");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const categories = [
    "Hoodies",
    "T-Shirts",
    "Sweatshirts",
    "Accessories",
    "All",
  ];

  useEffect(() => {
    if (mode === "edit" && collectionId) {
      void loadCollection();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, collectionId]);

  const loadCollection = async () => {
    if (!collectionId) return;

    setInitialLoading(true);
    const { data, error } = await getFeaturedCollectionById(collectionId);

    if (error || !data) {
      toast.error("Failed to load collection");
      navigate("/admin/featured");
      return;
    }

    setTitle(data.title);
    setDescription(data.description || "");
    setImageUrl(data.image_url);
    setCategory(data.category || "");
    setDisplayOrder(String(data.display_order || 0));
    setIsActive(data.is_active ?? true);
    setImagePreview(data.image_url);
    setInitialLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    try {
      const fileName = `${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}_${imageFile.name}`;
      const filePath = `featured/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("clothes")
        .upload(filePath, imageFile);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast.error("Failed to upload image");
        return null;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("clothes").getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.error("Unexpected upload error:", err);
      toast.error("Failed to upload image");
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setLoading(true);

    try {
      let finalImageUrl = imageUrl;

      // If there's a new image file, upload it
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (!uploadedUrl) {
          setLoading(false);
          return;
        }
        finalImageUrl = uploadedUrl;
      }

      if (!finalImageUrl) {
        toast.error("Image is required");
        setLoading(false);
        return;
      }

      const input: CreateFeaturedCollectionInput = {
        title: title.trim(),
        description: description.trim() || undefined,
        image_url: finalImageUrl,
        category: category || undefined,
        display_order: parseInt(displayOrder) || 0,
        is_active: isActive,
      };

      if (mode === "edit" && collectionId) {
        const { error } = await updateFeaturedCollection(collectionId, input);

        if (error) {
          toast.error("Failed to update collection");
        } else {
          toast.success("Collection updated successfully");
          navigate("/admin/featured");
        }
      } else {
        const { error } = await createFeaturedCollection(input);

        if (error) {
          toast.error("Failed to create collection");
        } else {
          toast.success("Collection created successfully");
          navigate("/admin/featured");
        }
      }
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
          <p className="text-gray-500">Loading collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 font-clash max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate("/admin/featured")}
          className="text-gray-600 hover:text-black mb-4 flex items-center gap-2"
        >
          <span>
            <IoIosArrowBack size={20} />
          </span>{" "}
          Back to Featured Collections
        </button>
        <h2 className="text-3xl font-semibold">
          {mode === "edit" ? "Edit Collection" : "Add New Collection"}
        </h2>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Enter collection title"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Enter collection description"
              rows={3}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Image *</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}
            {!imageFile && mode === "add" && (
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Or enter image URL"
              />
            )}
          </div>

          <div className="mb-4">
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

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Display Order
            </label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="0"
            />
          </div>

          <div className="mb-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">
                Active (visible on homepage)
              </span>
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400"
            >
              {loading
                ? "Saving..."
                : mode === "edit"
                ? "Update Collection"
                : "Create Collection"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/featured")}
              disabled={loading}
              className="flex-1 bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors disabled:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeaturedForm;
