import React, { useEffect, useState } from "react";
import {
  Modal,
  Table,
  message,
  Button,
  Form,
  Input,
  Select,
  InputNumber,
} from "antd";
import { getOrdersByCustomer, createOrder } from "../services/orders";
import { getProducts } from "../services/products";
import toast from "react-hot-toast";

export default function CustomerOrdersModal({ customer, open, onClose }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (open && customer) {
      fetchOrders();
      fetchProducts();
    }
  }, [open, customer]);

  async function fetchOrders() {
    setLoading(true);
    try {
      const data = await getOrdersByCustomer(customer.id);
      setOrders(data);
    } catch (err) {
      toast.error("Failed to fetch orders: " + err.message);
    }
    setLoading(false);
  }

  async function fetchProducts() {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      toast.error("Failed to fetch products: " + err.message);
    }
  }

  async function handleAddOrder(values) {
    try {
      const selectedProduct = products.find((p) => p.id === values.product_id);
      if (!selectedProduct) {
        toast.error("Please select a valid product");
        return;
      }

      const totalPrice = selectedProduct.price * values.quantity;

      const newOrder = {
        customer_id: customer.id,
        customer_name: customer.name,
        customer_email: customer.email,
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        quantity: values.quantity,
        total_price: totalPrice,
        status: "pending",
      };

      await createOrder(newOrder);
      toast.success("Order created successfully");
      setAddModalOpen(false);
      form.resetFields();
      fetchOrders(); // refresh orders
    } catch (err) {
      toast.error("Failed to create order: " + err.message);
    }
  }

  const columns = [
    { title: "Order ID", dataIndex: "id", key: "id" },
    { title: "Product", dataIndex: "product_name", key: "product_name" },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    {
      title: "Total Price",
      dataIndex: "total_price",
      key: "total_price",
      render: (t) => `$${t}`,
    },
    { title: "Status", dataIndex: "status", key: "status" },
    {
      title: "Date",
      dataIndex: "created_at",
      key: "created_at",
      render: (d) => new Date(d).toLocaleDateString(),
    },
  ];

  return (
    <>
      <Modal
        title={`Orders for ${customer?.name}`}
        open={open}
        onCancel={onClose}
        footer={null}
        width={700}
      >
        <div className="flex justify-end mb-3">
          <Button type="primary" onClick={() => setAddModalOpen(true)}>
            Add Order
          </Button>
        </div>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={orders}
          loading={loading}
        />
      </Modal>

      {/* Add Order Modal */}
      <Modal
        title="Add New Order"
        open={addModalOpen}
        onCancel={() => setAddModalOpen(false)}
        onOk={() => form.submit()}
        okText="Create"
      >
        <Form form={form} layout="vertical" onFinish={handleAddOrder}>
          <Form.Item
            label="Product"
            name="product_id"
            rules={[{ required: true, message: "Please select a product" }]}
          >
            <Select placeholder="Select product">
              {products.map((p) => (
                <Select.Option key={p.id} value={p.id}>
                  {p.name} (${p.price})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Quantity"
            name="quantity"
            rules={[
              { required: true, message: "Please enter quantity" },
              {
                validator: (_, value) =>
                  Number(value) >= 1
                    ? Promise.resolve()
                    : Promise.reject("Quantity must be at least 1"),
              },
            ]}
          >
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
