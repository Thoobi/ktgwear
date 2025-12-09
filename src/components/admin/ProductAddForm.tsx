import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { IoIosArrowBack } from "react-icons/io";
import { AiOutlinePlus } from "react-icons/ai";

const ProductAddForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [sizes, setSizes] = useState<string[]>([]);
  const [images, setImages] = useState<
    { id: string; file: File; preview: string }[]
  >([]);

  const options = [
    { id: 1, label: "XS" },
    { id: 2, label: "SM" },
    { id: 3, label: "M" },
    { id: 4, label: "L" },
    { id: 5, label: "XL" },
    { id: 6, label: "2XL" },
    { id: 7, label: "3XL" },
    { id: 8, label: "4XL" },
    { id: 9, label: "5XL" },
    { id: 10, label: "6XL" },
  ];

  const handleSelect = (optionLabel: string) => {
    setSizes((prev) => {
      if (prev.includes(optionLabel))
        return prev.filter((id) => id !== optionLabel);
      return [...prev, optionLabel];
    });
  };

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
          // Fallback to default categories if fetch fails
          setCategories([
            "Hoodies",
            "SweatShirts",
            "Cargo Pants",
            "Polo",
            "Joggers",
            "Two Piece",
            "Essentials",
          ]);
          return;
        }

        const categoryNames = data.map((cat) => cat.name);
        setCategories(categoryNames);
        if (categoryNames.length > 0 && !category) {
          setCategory(categoryNames[0]);
        }
      } catch (err) {
        console.error("Error:", err);
        // Fallback to default categories
        setCategories([
          "Hoodies",
          "SweatShirts",
          "Cargo Pants",
          "Polo",
          "Joggers",
          "Two Piece",
          "Essentials",
        ]);
      }
    };

    void fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup image previews on unmount
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        try {
          URL.revokeObjectURL(img.preview);
        } catch {
          // ignore
        }
      });
    };
  }, [images]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) {
      setImages([]);
      return;
    }

    const newImages = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages(newImages);
  };

  const removeNewImage = (id: string) => {
    const image = images.find((img) => img.id === id);
    if (image) {
      try {
        URL.revokeObjectURL(image.preview);
      } catch {
        // ignore
      }
    }

    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !price || !category.trim() || images.length === 0) {
      toast.error("Please fill all fields and select at least one image");
      return;
    }

    setLoading(true);

    try {
      // Upload all image files
      const uploadedUrls: string[] = [];

      for (const img of images) {
        const file = img.file;
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

      if (uploadedUrls.length === 0) {
        toast.error("No images were uploaded");
        setLoading(false);
        return;
      }

      // Insert product
      const payload = {
        name: name.trim(),
        price: Number(price),
        category: category.trim(),
        size: sizes.length > 0 ? JSON.stringify(sizes) : null,
        images: uploadedUrls,
        image_url: uploadedUrls[0] ?? null,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("clothes").insert([payload]);

      if (error) {
        console.error("Insert error:", error);
        toast.error("Could not add product");
        return;
      }

      toast.success("Product added successfully");
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

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
        <h2 className="text-3xl font-semibold">Add Product</h2>
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
              <label className="block text-sm font-medium mb-2">Price *</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Enter product price"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                required
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

            <div className="flex flex-col gap-2">
              {options.map((option) => (
                <div key={option.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={sizes.includes(option.label)}
                    onChange={() => handleSelect(option.label)}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm">{option.label}</span>
                </div>
              ))}

              <div className="mt-4">
                <h3 className="font-medium">Selected Items:</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {sizes.length > 0 ? (
                    <ul className="list-none flex flex-wrap gap-2">
                      {sizes.map((item, index) => (
                        <li
                          key={index}
                          className="text-sm bg-black text-white px-3 py-1 rounded-full"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No sizes selected</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Images *</label>

            {/* New Images to Upload */}
            {images.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2 text-gray-700">
                  Selected Images
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {images.map((img, idx) => (
                    <div key={img.id} className="relative group">
                      <button
                        type="button"
                        onClick={() => removeNewImage(img.id)}
                        className="absolute z-10 -right-2 -top-2 bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        aria-label={`Remove image ${idx + 1}`}
                      >
                        ✕
                      </button>
                      <img
                        src={img.preview}
                        alt={`New ${idx + 1}`}
                        className="w-full h-auto object-cover rounded border-2 border-black"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* File Input */}
            <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-300 rounded-lg px-4 py-8 cursor-pointer hover:border-black hover:bg-gray-50 transition-colors">
              <AiOutlinePlus size={24} className="text-gray-600" />
              <span className="text-gray-600">Click to add images</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
                required
              />
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 cursor-pointer"
            >
              {loading ? "Adding..." : "Add Product"}
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

export default ProductAddForm;
