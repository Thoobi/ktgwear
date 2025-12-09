import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllFeaturedCollections,
  deleteFeaturedCollection,
  toggleFeaturedCollectionStatus,
} from "../../lib/featuredCollections";
import type { FeaturedCollection } from "../../types/featured";
import { toast } from "sonner";

const ManageFeaturedCollections: React.FC = () => {
  const navigate = useNavigate();
  const [collections, setCollections] = useState<FeaturedCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<FeaturedCollection | null>(null);

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

  const handleDelete = (collection: FeaturedCollection) => {
    setDeleting(collection);
  };

  const confirmDelete = async () => {
    if (!deleting?.id) return;

    const { error } = await deleteFeaturedCollection(deleting.id);

    if (error) {
      toast.error("Failed to delete collection");
    } else {
      toast.success("Collection deleted successfully");
      setDeleting(null);
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
          onClick={() => navigate("/admin/featured/add")}
          className="bg-black text-white px-6 py-2 hover:bg-gray-800 transition-colors cursor-pointer"
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
                  className={`absolute top-2 right-2 px-2 py-1 text-xs font-semibold ${
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
                    <span className="bg-gray-100 px-2 py-1 ">
                      {collection.category}
                    </span>
                  )}
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    Order: {collection.display_order}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      navigate(`/admin/featured/edit/${collection.id}`)
                    }
                    className="flex-1 bg-blue-500 text-white px-3 py-2 text-sm hover:bg-blue-600 transition-colors cursor-pointer rounded"
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
                    className="flex-1 bg-gray-500 text-white px-3 py-2 text-sm hover:bg-gray-600 transition-colors cursor-pointer rounded"
                  >
                    {collection.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleDelete(collection)}
                    className="flex-1 bg-red-500 text-white px-3 py-2 text-sm hover:bg-red-600 transition-colors cursor-pointer rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded max-w-md w-full mx-4">
            <h3 className="text-xl font-medium mb-4">Delete Collection</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold">"{deleting.title}"</span>? This
              action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleting(null)}
                className="px-4 py-2 border rounded cursor-pointer hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => void confirmDelete()}
                className="px-4 py-2 bg-red-500 text-white rounded cursor-pointer hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFeaturedCollections;
