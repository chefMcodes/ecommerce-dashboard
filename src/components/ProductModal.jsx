import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { supabase } from "../supabaseClient";
import toast from "react-hot-toast";

export default function ProductModal({
  isOpen,
  onClose,
  onSave,
  productToEdit,
}) {
  const [form, setForm] = useState({
    id: null,
    name: "",
    price: "",
    stock: "",
    status: "Active",
    image: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (productToEdit) {
      setForm({
        id: productToEdit.id,
        name: productToEdit.name || "",
        price: productToEdit.price || "",
        stock: productToEdit.stock || "",
        status: productToEdit.status || "Active",
        image: productToEdit.image || "",
      });
      setPreview(productToEdit.image || "");
    } else {
      setForm({
        id: null,
        name: "",
        price: "",
        stock: "",
        status: "Active",
        image: "",
      });
      setPreview("");
    }
  }, [productToEdit, isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
    }
  };

  const handleChange = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      toast.error("Please provide product name and price.");
      return;
    }

    let imageUrl = preview;

    // ✅ Upload to Supabase Storage if a new file is selected
    if (selectedFile) {
      const fileName = `${Date.now()}-${selectedFile.name}`;
      const { data, error } = await supabase.storage
        .from("products") // bucket name
        .upload(fileName, selectedFile);

      if (error) {
        console.error("Image upload failed:", error);
        toast.error("Image upload failed");
        return;
      }

      // ✅ Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("products")
        .getPublicUrl(fileName);

      imageUrl = publicUrlData.publicUrl;
    }

    const productData = {
      id: form.id,
      name: form.name,
      price: form.price,
      stock: form.stock || 0,
      status: form.status,
      image: imageUrl || "https://placehold.co/100x100",
    };

    onSave(productData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-4">
      <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">
            {form.id ? "Edit Product" : "Add Product"}
          </h3>
          <button type="button" onClick={onClose} aria-label="Close">
            <XMarkIcon className="h-6 w-6 text-gray-600 hover:text-gray-900" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Product Name</label>
            <input
              type="text"
              value={form.name}
              onChange={handleChange("name")}
              className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Price</label>
              <input
                type="number"
                value={form.price}
                onChange={handleChange("price")}
                className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Stock</label>
              <input
                type="number"
                value={form.stock}
                onChange={handleChange("stock")}
                className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Status</label>
            <select
              value={form.status}
              onChange={handleChange("status")}
              className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Product Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full mt-1"
            />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="mt-3 w-24 h-24 object-cover rounded border"
              />
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
