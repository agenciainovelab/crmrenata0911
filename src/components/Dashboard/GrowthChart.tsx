"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const mockData = [
  { mes: "Jan", admins: 12, lideres: 45, pessoas: 230 },
  { mes: "Fev", admins: 15, lideres: 58, pessoas: 310 },
  { mes: "Mar", admins: 18, lideres: 72, pessoas: 425 },
  { mes: "Abr", admins: 22, lideres: 89, pessoas: 580 },
  { mes: "Mai", admins: 28, lideres: 105, pessoas: 720 },
  { mes: "Jun", admins: 35, lideres: 128, pessoas: 890 },
];

export default function GrowthChart() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 300);
          return 100;
        }
        return prev + 25;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-card dark:bg-gray-dark">
        <div className="mb-4 h-6 w-48 animate-pulse rounded bg-gray-3 dark:bg-dark-3"></div>
        <div className="h-80 animate-pulse rounded-lg bg-gray-3 dark:bg-dark-3"></div>
        <div className="mt-4 text-center text-sm text-primary">
          Carregando gráfico {progress}%
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-card dark:bg-gray-dark">
      <h3 className="mb-6 text-xl font-bold text-dark dark:text-white">
        Crescimento da Base
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={mockData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="mes"
            stroke="#6B7280"
            style={{ fontSize: "12px" }}
          />
          <YAxis stroke="#6B7280" style={{ fontSize: "12px" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="admins"
            stroke="#3A0CA3"
            strokeWidth={2}
            name="Admins"
            dot={{ fill: "#3A0CA3", r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="lideres"
            stroke="#7B2CBF"
            strokeWidth={2}
            name="Líderes"
            dot={{ fill: "#7B2CBF", r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="pessoas"
            stroke="#3B82F6"
            strokeWidth={2}
            name="Pessoas"
            dot={{ fill: "#3B82F6", r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
