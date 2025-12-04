"use client";

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

interface GrowthChartProps {
  data?: Array<{
    mes: string;
    admins: number;
    lideres: number;
    pessoas: number;
  }>;
}

const defaultData = [
  { mes: "Jan", admins: 0, lideres: 0, pessoas: 0 },
  { mes: "Fev", admins: 0, lideres: 0, pessoas: 0 },
  { mes: "Mar", admins: 0, lideres: 0, pessoas: 0 },
  { mes: "Abr", admins: 0, lideres: 0, pessoas: 0 },
  { mes: "Mai", admins: 0, lideres: 0, pessoas: 0 },
  { mes: "Jun", admins: 0, lideres: 0, pessoas: 0 },
];

export default function GrowthChart({ data }: GrowthChartProps) {
  const chartData = data && data.length > 0 ? data : defaultData;

  return (
    <div className="rounded-xl bg-white p-6 shadow-card dark:bg-gray-dark">
      <h3 className="mb-6 text-xl font-bold text-dark dark:text-white">
        Crescimento da Base
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData}>
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
