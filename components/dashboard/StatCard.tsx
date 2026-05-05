"use client";

import { ReactNode } from "react";
import { Card } from "@/components/ui";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: ReactNode;
}

export function StatCard({ title, value, change, changeType = "neutral", icon }: StatCardProps) {
  const changeClasses = {
    positive: "text-green-600",
    negative: "text-red-600",
    neutral: "text-gray-600",
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">{value}</p>
          {change && (
            <p className={`text-xs mt-2 font-medium ${changeClasses[changeType]}`}>
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="p-2.5 bg-gray-50 rounded-xl">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
