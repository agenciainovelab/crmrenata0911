"use client";

import { useState, useEffect } from "react";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: "purple" | "blue" | "green";
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "purple",
}: StatsCardProps) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setLoading(false);
          return 100;
        }
        return prev + 20;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const colorClasses = {
    purple: "bg-primary/10 text-primary",
    blue: "bg-political-blue/10 text-political-blue",
    green: "bg-green/10 text-green",
  };

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-card dark:bg-gray-dark">
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-3">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-3 dark:bg-dark-3"></div>
            <div className="h-8 w-32 animate-pulse rounded bg-gray-3 dark:bg-dark-3"></div>
            <div className="h-3 w-20 animate-pulse rounded bg-gray-3 dark:bg-dark-3"></div>
          </div>
          <div className="h-14 w-14 animate-pulse rounded-full bg-gray-3 dark:bg-dark-3"></div>
        </div>
        <div className="mt-3 text-center text-xs text-primary">
          Carregando {progress}%
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-card transition-all hover:shadow-card-2 dark:bg-gray-dark">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-dark-5 dark:text-dark-6">
            {title}
          </p>
          <h3 className="mt-2 text-3xl font-bold text-dark dark:text-white">
            {value}
          </h3>
          {trend && (
            <p
              className={`mt-2 text-sm font-medium ${
                trend.isPositive ? "text-green" : "text-red"
              }`}
            >
              {trend.isPositive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full ${colorClasses[color]}`}
        >
          <Icon className="h-7 w-7" />
        </div>
      </div>
    </div>
  );
}
