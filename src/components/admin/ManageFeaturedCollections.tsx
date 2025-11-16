import React, { useEffect, useState } from "react";
import {
  getAllFeaturedCollections,
  createFeaturedCollection,
  updateFeaturedCollection,
  deleteFeaturedCollection,
  toggleFeaturedCollectionStatus,
} from "../../lib/featuredCollections";
import type {
  FeaturedCollection,
  CreateFeaturedCollectionInput,
} from "../../types/featured";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase";

const ManageFeaturedCollections: React.FC = () => {
  const [collections, setCollections] = useState<FeaturedCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCollection, setEditingCollection] =
    useState<FeaturedCollection | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);

  const categories = [
    "Hoodies",
    "T-Shirts",
    "Sweatshirts",
    "Accessories",
    "All",
  ];

  useEffect(() => {
    void fetchCollections();
  }, []);

  const fetchCollections = async () => {
    setLoading(true);
    const { data, error } = await getAllFeaturedCollections();

    if (error) {
      toast.error("Failed to load featured collections");
      console.error(error);
    } else {
      setCollections(data || []);
    }

    setLoading(false);
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

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setImageUrl("");
    setCategory("");
    setDisplayOrder("0");
    setIsActive(true);
    setImageFile(null);
    setImagePreview("");
    setEditingCollection(null);
  };

  const openModal = (collection?: FeaturedCollection) => {
    if (collection) {
      setEditingCollection(collection);
      setTitle(collection.title);
      setDescription(collection.description || "");
      setImageUrl(collection.image_url);
      setCategory(collection.category || "");
      setDisplayOrder(String(collection.display_order || 0));
      setIsActive(collection.is_active ?? true);
      setImagePreview(collection.image_url);
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setUploading(true);

    try {
      let finalImageUrl = imageUrl;

      // If there's a new image file, upload it
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (!uploadedUrl) {
          setUploading(false);
          return;
        }
        finalImageUrl = uploadedUrl;
      }

      if (!finalImageUrl) {
        toast.error("Image is required");
        setUploading(false);
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

      if (editingCollection) {
        const { error } = await updateFeaturedCollection(
          editingCollection.id,
          input
        );

        if (error) {
          toast.error("Failed to update collection");
        } else {
          toast.success("Collection updated successfully");
          closeModal();
          void fetchCollections();
        }
      } else {
        const { error } = await createFeaturedCollection(input);

        if (error) {
          toast.error("Failed to create collection");
        } else {
          toast.success("Collection created successfully");
          closeModal();
          void fetchCollections();
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this collection?")) return;

    const { error } = await deleteFeaturedCollection(id);

    if (error) {
      toast.error("Failed to delete collection");
    } else {
      toast.success("Collection deleted successfully");
      void fetchCollections();
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await toggleFeaturedCollectionStatus(id, !currentStatus);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(
        `Collection ${!currentStatus ? "activated" : "deactivated"}`
      );
      void fetchCollections();
    }
  };

  return (
    <div className="p-8 font-clash">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-semibold">Manage Featured Collections</h2>
        <button
          onClick={() => openModal()}
          className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Add New Collection
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading collections...</p>
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No featured collections yet. Create your first one!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48">
                <img
                  src={collection.image_url}
                  alt={collection.title}
                  className="w-full h-full object-cover"
                />
                <div
                  className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold ${
                    collection.is_active
                      ? "bg-green-500 text-white"
                      : "bg-gray-500 text-white"
                  }`}
                >
                  {collection.is_active ? "Active" : "Inactive"}
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">
                  {collection.title}
                </h3>
                {collection.description && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {collection.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                  {collection.category && (
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {collection.category}
                    </span>
                  )}
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    Order: {collection.display_order}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(collection)}
                    className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      handleToggleStatus(
                        collection.id,
                        collection.is_active ?? false
                      )
                    }
                    className="flex-1 bg-gray-500 text-white px-3 py-2 rounded text-sm hover:bg-gray-600 transition-colors"
                  >
                    {collection.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleDelete(collection.id)}
                    className="flex-1 bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-2xl font-semibold mb-4">
                {editingCollection ? "Edit Collection" : "Add New Collection"}
              </h3>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Title *
                  </label>
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
                  <label className="block text-sm font-medium mb-2">
                    Image
                  </label>
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
                  {!imageFile && !editingCollection && (
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
                  <label className="block text-sm font-medium mb-2">
                    Category
                  </label>
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
                    disabled={uploading}
                    className="flex-1 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                  >
                    {uploading
                      ? "Saving..."
                      : editingCollection
                      ? "Update Collection"
                      : "Create Collection"}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={uploading}
                    className="flex-1 bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors disabled:bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFeaturedCollections;
