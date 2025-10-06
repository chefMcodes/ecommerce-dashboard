import React, { useEffect, useState } from "react";
import StatCard from "../components/StartCard";
import SalesChart from "../components/SalesChart";
import OrdersPieChart from "../components/OrdersPieChart";
import OrdersTable from "../components/OrdersTable";

import { getOrders } from "../services/orders";
import { getCustomers } from "../services/customers";
import { getProducts } from "../services/products";

export default function Dashboard() {
  const [totalSales, setTotalSales] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const [orders, customers, products] = await Promise.all([
        getOrders(),
        getCustomers(),
        getProducts(),
      ]);

      // Total sales = sum of all order total_price
      const sales = orders.reduce(
        (sum, order) => sum + Number(order.total_price || 0),
        0
      );

      setTotalSales(sales.toLocaleString());
      setTotalOrders(orders.length);
      setTotalCustomers(customers.length);
      setTotalProducts(products.length);
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatCard title="Total Sales" value={`$${totalSales}`} />
        <StatCard title="Orders" value={totalOrders} />
        <StatCard title="Customers" value={totalCustomers} />
        <StatCard title="Products" value={totalProducts} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">Sales Overview</h3>
          <SalesChart />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">Orders by Status</h3>
          <OrdersPieChart />
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <OrdersTable />
      </div>
    </div>
  );
}
