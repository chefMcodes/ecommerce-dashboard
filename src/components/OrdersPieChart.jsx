import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { getOrders } from "../services/orders";

const COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#6366f1"];

export default function OrdersPieChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchStatusData();
  }, []);

  async function fetchStatusData() {
    try {
      const orders = await getOrders();

      const statusCounts = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});

      const chartData = Object.keys(statusCounts).map((status) => ({
        name: status,
        value: statusCounts[status],
      }));

      setData(chartData);
    } catch (err) {
      console.error("Failed to fetch orders status data:", err);
    }
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          cx="50%"
          cy="50%"
          outerRadius={120}
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
