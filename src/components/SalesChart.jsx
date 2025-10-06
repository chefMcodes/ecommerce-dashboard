import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { getOrders } from "../services/orders";

export default function SalesChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchSalesData();
  }, []);

  async function fetchSalesData() {
    try {
      const orders = await getOrders();

      // Group sales by month
      const salesByMonth = {};
      orders.forEach((order) => {
        const month = new Date(order.created_at).toLocaleString("default", {
          month: "short",
        });
        salesByMonth[month] =
          (salesByMonth[month] || 0) + Number(order.total_price || 0);
      });

      const chartData = Object.keys(salesByMonth).map((month) => ({
        month,
        sales: salesByMonth[month],
      }));

      setData(chartData);
    } catch (err) {
      console.error("Failed to fetch sales data:", err);
    }
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="sales"
          stroke="#6366f1"
          strokeWidth={3}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
