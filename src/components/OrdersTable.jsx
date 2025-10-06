import React, { useEffect, useState } from "react";
import {
  Table,
  Select,
  Button,
  Popconfirm,
  message,
  Modal,
  Descriptions,
  Space,
} from "antd";
import {
  getOrders,
  updateOrderStatus,
  deleteOrder,
  getOrderById,
} from "../services/orders";
import toast from "react-hot-toast";

const { Option } = Select;

export default function OrdersTable() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  async function fetchOrders() {
    setLoading(true);
    try {
      let data = await getOrders();

      // ✅ Apply filter if not "All"
      if (statusFilter !== "All") {
        data = data.filter((order) => order.status === statusFilter);
      }

      setOrders(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch orders");
    }
    setLoading(false);
  }

  async function handleStatusChange(id, value) {
    try {
      await updateOrderStatus(id, value);
      toast.success("Order status updated");
      fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  }

  async function handleDelete(id) {
    try {
      await deleteOrder(id);
      toast.success("Order deleted");
      fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete order");
    }
  }

  async function handleViewDetails(id) {
    try {
      const order = await getOrderById(id);
      setSelectedOrder(order);
      setModalVisible(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load order details");
    }
  }

  const columns = [
    { title: "Customer", dataIndex: "customer_name", key: "customer_name" },
    { title: "Email", dataIndex: "customer_email", key: "customer_email" },
    { title: "Product", dataIndex: "product_name", key: "product_name" },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    {
      title: "Total",
      dataIndex: "total_price",
      key: "total_price",
      render: (price) => `$${price}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <Select
          value={status}
          style={{ width: 120 }}
          onChange={(value) => handleStatusChange(record.id, value)}
        >
          <Option value="Pending">Pending</Option>
          <Option value="Shipped">Shipped</Option>
          <Option value="Delivered">Delivered</Option>
          <Option value="Cancelled">Cancelled</Option>
        </Select>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleViewDetails(record.id)}>
            View
          </Button>
          <Popconfirm
            title="Are you sure to delete this order?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      {/* ✅ Filter Bar */}
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <h2 style={{ fontSize: "18px", fontWeight: "600" }}>Orders</h2>
        <Select
          value={statusFilter}
          style={{ width: 180 }}
          onChange={setStatusFilter}
        >
          <Option value="All">All Orders</Option>
          <Option value="Pending">Pending</Option>
          <Option value="Shipped">Shipped</Option>
          <Option value="Delivered">Delivered</Option>
          <Option value="Cancelled">Cancelled</Option>
        </Select>
      </div>

      {/* Orders Table */}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={orders}
        loading={loading}
      />

      {/* Order Details Modal */}
      <Modal
        title="Order Details"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        {selectedOrder && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Customer">
              {selectedOrder.customer_name}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedOrder.customer_email}
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              {selectedOrder.phone}
            </Descriptions.Item>
            <Descriptions.Item label="Product">
              {selectedOrder.product_name}
            </Descriptions.Item>
            <Descriptions.Item label="Quantity">
              {selectedOrder.quantity}
            </Descriptions.Item>
            <Descriptions.Item label="Total">
              ${selectedOrder.total_price}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {selectedOrder.status}
            </Descriptions.Item>
            <Descriptions.Item label="Address">
              {selectedOrder.shipping_address}
            </Descriptions.Item>
            <Descriptions.Item label="Notes">
              {selectedOrder.notes || "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Placed At">
              {new Date(selectedOrder.created_at).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </>
  );
}
