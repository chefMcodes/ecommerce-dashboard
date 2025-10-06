import React, { useEffect, useState } from "react";
import { Table, Input, Button, Modal, Form, message } from "antd";
import CustomerOrdersModal from "./CustomerOrdersModal";

import {
  getCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
} from "../services/customers";
import toast from "react-hot-toast";

const { Search } = Input;

export default function CustomersTable() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [ordersModalOpen, setOrdersModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [form] = Form.useForm();

  // Fetch customers
  useEffect(() => {
    fetchCustomers();
  }, [search]);

  async function fetchCustomers() {
    setLoading(true);
    try {
      let data = await getCustomers();

      // 🔍 Local search filter
      if (search) {
        data = data.filter(
          (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.email.toLowerCase().includes(search.toLowerCase())
        );
      }

      setCustomers(data);
    } catch (err) {
      toast.error("Failed to fetch customers: " + err.message);
    }
    setLoading(false);
  }

  // Delete
  async function handleDelete(id) {
    try {
      await deleteCustomer(id);
      toast.success("Customer deleted");
      fetchCustomers();
    } catch (err) {
      toast.error("Delete failed: " + err.message);
    }
  }

  // Open Add
  function openAddModal() {
    setEditingCustomer(null);
    form.resetFields();
    setIsModalOpen(true);
  }

  // Open Edit
  function openEditModal(customer) {
    setEditingCustomer(customer);
    form.setFieldsValue(customer);
    setIsModalOpen(true);
  }

  // Open Orders modal
  function openOrdersModal(customer) {
    setSelectedCustomer(customer);
    setOrdersModalOpen(true);
  }

  // Save (Add / Update)
  async function handleOk() {
    try {
      const values = await form.validateFields();

      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, values);
        message.success("Customer updated");
      } else {
        await addCustomer(values);
        message.success("Customer added");
      }

      setIsModalOpen(false);
      fetchCustomers();
    } catch (err) {
      message.error("Save failed: " + err.message);
    }
  }

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone", dataIndex: "phone", key: "phone" },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button type="link" onClick={() => openEditModal(record)}>
            Edit
          </Button>
          <Button type="link" onClick={() => openOrdersModal(record)}>
            View Orders
          </Button>
          <Button danger onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Top controls */}
      <div style={{ marginBottom: 16, display: "flex", gap: 10 }}>
        <Search
          placeholder="Search customers"
          onSearch={setSearch}
          enterButton
          allowClear
        />
        <Button type="primary" onClick={openAddModal}>
          Add Customer
        </Button>
      </div>

      {/* Customers Table */}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={customers}
        loading={loading}
      />

      {/* Add/Edit Customer Modal */}
      <Modal
        title={editingCustomer ? "Edit Customer" : "Add Customer"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleOk}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter customer name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Invalid email format" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* View Orders Modal */}
      <CustomerOrdersModal
        customer={selectedCustomer}
        open={ordersModalOpen}
        onClose={() => setOrdersModalOpen(false)}
      />
    </div>
  );
}
