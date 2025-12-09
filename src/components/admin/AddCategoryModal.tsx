import React, { useState } from "react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCategoryAdded: (newCategory: string) => void;
};

const AddCategoryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onCategoryAdded,
}) => {
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCategory.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    setLoading(true);

    try {
      // Insert the new category into the database
      const { error } = await supabase.from("categories").insert([
        {
          name: newCategory.trim(),
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("Insert error:", error);
        toast.error("Could not add category");
        return;
      }

      toast.success("Category added successfully");
      onCategoryAdded(newCategory.trim());
      setNewCategory("");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4 font-clash">
        <h3 className="text-xl font-semibold mb-4">Add New Category</h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Category Name
            </label>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Enter category name"
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-black text-white rounded-lg cursor-pointer hover:bg-gray-800 transition-colors disabled:bg-gray-400"
            >
              {loading ? "Adding..." : "Add Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal;
