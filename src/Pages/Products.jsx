import React, { useEffect, useState } from "react";
import ProductsTable from "../components/ProductsTable";
import ProductModal from "../components/ProductModal";
import {
  getProducts,
  addProduct as addProductService,
  updateProduct as updateProductService,
  deleteProduct as deleteProductService,
} from "../services/products";
import toast from "react-hot-toast";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data || []);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      toast.error("Failed to load products. Check console for details.");
    } finally {
      setLoading(false);
    }
  }

  // Called by ProductModal (onSave)
  async function handleAdd(product) {
    try {
      const newProduct = await addProductService({
        name: product.name,
        price: product.price,
        stock: product.stock,
        status: product.status,
        image: product.image,
      });
      setProducts((prev) => [...prev, newProduct]);
      setIsModalOpen(false);
      setProductToEdit(null);
    } catch (err) {
      console.error("Add failed:", err);
      toast.error("Add product failed. See console.");
    }
  }

  async function handleUpdate(product) {
    try {
      const updated = await updateProductService(product);
      setProducts((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      setIsModalOpen(false);
      setProductToEdit(null);
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Update failed. See console.");
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("Delete this product?");
    if (!confirmed) return;
    try {
      await deleteProductService(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Delete failed. See console.");
    }
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Products</h2>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setProductToEdit(null);
              setIsModalOpen(true); // <-- open modal for add
            }}
            className="px-4 py-2 bg-blue-600 !text-white rounded-lg hover:bg-blue-700"
          >
            + Add Product
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-600">Loading products...</div>
      ) : (
        <ProductsTable
          products={products}
          onEdit={(p) => {
            setProductToEdit(p);
            setIsModalOpen(true); // <-- open modal for edit
          }}
          onDelete={handleDelete}
        />
      )}

      {/* Always render modal and pass isOpen prop (ProductModal checks it) */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setProductToEdit(null);
        }}
        onSave={productToEdit ? handleUpdate : handleAdd}
        productToEdit={productToEdit}
      />
    </div>
  );
}
