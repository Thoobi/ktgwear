import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { FiUploadCloud } from "react-icons/fi";
import { toast } from "sonner";

type Props = { onClose?: () => void };

const UploadForm: React.FC<Props> = ({ onClose }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [size, setSize] = useState<string[]>([]);
  const [category, setCategory] = useState("Hoodies");
  // Support multiple images
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

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
    setSize((prev) => {
      if (prev.includes(optionLabel))
        return prev.filter((id) => id !== optionLabel);
      return [...prev, optionLabel];
    });
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

  // cleanup object URLs when previews change/unmount to avoid memory leaks
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

  const removeImage = (index: number) => {
    // revoke object url for the preview
    const url = imagePreviews[index];
    try {
      if (url) URL.revokeObjectURL(url);
    } catch {
      // ignore
    }

    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name || !price || !category || imageFiles.length === 0) {
      toast.error("❌ Please fill all fields and select at least one image.");
      return;
    }

    try {
      setUploading(true);

      // upload all selected files and collect public URLs
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
          toast.error("❌ Upload failed at storage.");
          console.error("Storage error:", uploadError);
          return;
        }

        const { data: urlData } = supabase.storage
          .from("clothes")
          .getPublicUrl(filePath);
        const imageUrl = urlData?.publicUrl;
        if (imageUrl) uploadedUrls.push(imageUrl);
      }

      if (uploadedUrls.length === 0) {
        toast.error("❌ No images were uploaded.");
        return;
      }

      // sanitize and dedupe uploaded urls before inserting
      const sanitizedImages = Array.from(
        new Set(uploadedUrls.filter((u) => typeof u === "string" && u.trim()))
      ).map((u) => String(u));

      // Insert row: try including `image_urls` (some schemas have it), but gracefully
      // fall back to inserting without it if the column doesn't exist in the DB.
      const basePayload = {
        name,
        price: Number(price),
        category,
        images: sanitizedImages,
        image_url: sanitizedImages[0] ?? null,
        size: JSON.stringify(size),
        created_at: new Date().toISOString(),
      } as Record<string, unknown>;

      // First try: include `image_urls` for compatibility with code paths that expect it
      let insertError = null as unknown;
      try {
        const payloadWithUrls = { ...basePayload, image_urls: sanitizedImages };
        const { error } = await supabase
          .from("clothes")
          .insert([payloadWithUrls]);
        insertError = error;
      } catch (err) {
        insertError = err;
      }

      // If the insert failed because `image_urls` column doesn't exist (PGRST204),
      // retry without that column.
      if (insertError) {
        const errObj = insertError as {
          code?: string;
          message?: string;
        } | null;

        if (
          errObj?.code === "PGRST204" ||
          String(errObj?.message ?? "").includes(
            "Could not find the 'image_urls'"
          )
        ) {
          // retry without image_urls
          const { error: secondError } = await supabase
            .from("clothes")
            .insert([basePayload]);
          insertError = secondError;
        }
      }

      if (insertError) {
        // If insertion still failed, show error and abort
        toast.error("❌ Upload failed at database.");
        console.error("DB error:", insertError);
        return;
      }

      toast.success("✅ Clothes uploaded!");
      setName("");
      setPrice("");
      setCategory("Hoodies");
      setImageFiles([]);
      setSize([]);
      setImagePreviews([]);

      if (onClose) onClose();
    } catch (err) {
      // err is unknown — stringify for logging
      console.error(
        "❌ Unexpected error:",
        err && typeof err === "object" ? JSON.stringify(err) : String(err)
      );
      toast.error("Something went wrong. Try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    // constrain height and make inner content scrollable so the modal/page doesn't overflow
    <div className="max-w-3xl w-full mx-auto p-6 bg-white shadow-2xl rounded-xl font-clash max-h-[90vh] overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-medium flex items-center gap-2">
          <FiUploadCloud className="text-black" /> Add Product
        </h2>
        <button
          className="text-sm text-gray-700 hover:underline flex items-center gap-1"
          onClick={() => (onClose ? onClose() : void 0)}
        >
          Cancel
        </button>
      </div>

      <form
        onSubmit={handleUpload}
        className="space-y-4 mb-4 overflow-y-auto max-h-[72vh] pr-2"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Clothe Name</label>
          <input
            type="text"
            placeholder="e.g. KTG Hoodie"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Price (₦)</label>
          <input
            type="number"
            placeholder="e.g. 250000"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="Hoodies">Hoodies</option>
            <option value="SweatShirts">SweatShirts</option>
            <option value="Cargo Pants">Cargo Pants</option>
            <option value="Polo">Polo</option>
            <option value="Joggers">Joggers</option>
            <option value="Two Piece">Two Piece</option>
            <option value="Essentials">Essentials</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <span>
            <label className="block text-sm font-medium mb-1">
              Select Available Size:
            </label>
          </span>
          {options.map((option) => (
            <label
              key={option.id}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={size.includes(option.label)}
                onChange={() => handleSelect(option.label)}
                className="w-4 h-4"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}

          <div className="mt-4">
            <h3 className="font-medium">Selected Items:</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {size.length > 0 ? (
                <ul className="list-none flex flex-wrap gap-2">
                  {size.map((item, index) => (
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

        <div>
          <label className="block text-sm font-medium mb-1">
            Clothes Image
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="w-full border p-2 rounded bg-gray-50"
          />
        </div>

        {imagePreviews && imagePreviews.length > 0 && (
          <div className="mt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {imagePreviews.map((src, idx) => (
                <div key={src + String(idx)} className="relative">
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute z-10 -right-1 -top-1 bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    aria-label={`Remove image ${idx + 1}`}
                  >
                    ✕
                  </button>
                  <img
                    src={src}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-36 object-cover rounded border"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={uploading}
            className="flex-1 bg-black text-white py-2 rounded font-medium hover:bg-gray-900 transition"
          >
            {uploading ? "Uploading..." : "Upload Wear"}
          </button>
          <button
            type="button"
            onClick={() => (onClose ? onClose() : void 0)}
            className="px-4 py-2 border rounded"
          >
            Close
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadForm;
