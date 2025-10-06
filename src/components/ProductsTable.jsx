import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Select,
  Button,
  Tag,
  Space,
  message,
  Popconfirm,
} from "antd";
import { getProducts, deleteProduct } from "../services/products";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const { Search } = Input;
const { Option } = Select;

export default function ProductsTable({ onEdit }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");

  useEffect(() => {
    fetchProducts();
  }, [search, sort]);

  async function fetchProducts() {
    setLoading(true);
    try {
      let data = await getProducts();

      // 🔍 Apply search filter
      if (search) {
        data = data.filter((p) =>
          p.name.toLowerCase().includes(search.toLowerCase())
        );
      }

      // 🔽 Apply sorting
      if (sort === "price-low") {
        data.sort((a, b) => a.price - b.price);
      } else if (sort === "price-high") {
        data.sort((a, b) => b.price - a.price);
      }

      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err.message);
      message.error("Failed to fetch products");
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    try {
      await deleteProduct(id);
      toast.success("Product deleted successfully");
      fetchProducts(); // refresh
    } catch (err) {
      console.error("Delete failed:", err.message);
      toast.error("Delete failed");
    }
  }

  const columns = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (img) =>
        img ? (
          <img
            src={img}
            alt="product"
            className="w-12 h-12 rounded object-cover"
          />
        ) : (
          <span>No Image</span>
        ),
    },
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => `$${price}`,
    },
    { title: "Stock", dataIndex: "stock", key: "stock" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Active" ? "green" : "gray"}>{status}</Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            type="default"
            icon={<PencilIcon className="h-4 w-4" />}
            onClick={() => onEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure to delete this product?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<TrashIcon className="h-4 w-4" />}>
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* 🔍 Search & Sort */}
      <div
        style={{ marginBottom: 16, display: "flex", gap: 10, flexWrap: "wrap" }}
      >
        <Search
          placeholder="Search products"
          onSearch={setSearch}
          enterButton
          allowClear
          style={{ maxWidth: 300 }}
        />
        <Select
          placeholder="Sort by"
          onChange={setSort}
          style={{ width: 180 }}
          allowClear
        >
          <Option value="price-low">Price: Low → High</Option>
          <Option value="price-high">Price: High → Low</Option>
        </Select>
      </div>

      {/* 📊 Products Table */}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={products}
        loading={loading}
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
}
