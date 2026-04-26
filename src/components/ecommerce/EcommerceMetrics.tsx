"use client";
import React, { useEffect, useState } from "react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon, DollarLineIcon, ShootingStarIcon } from "@/icons";
import { api } from "@/lib/api";

import { useQuery } from "@tanstack/react-query";

export const EcommerceMetrics = () => {
  const { data: stats, isLoading: loading } = useQuery({
    queryKey: ["stats"],
    queryFn: () => api.get("/stats"),
  });

  if (loading) return <div className="p-4 text-center">Loading stats...</div>;

  const items = [
    {
      label: "Total Service Jobs",
      value: stats?.totalServiceJobs || 0,
      icon: <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />,
      color: "brand"
    },
    {
      label: "Under Rebuild",
      value: stats?.underRebuild || 0,
      icon: <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />,
      color: "warning"
    },
    {
      label: "Total Revenue",
      value: `₹${(stats?.revenueSummary?.totalRevenue || 0).toLocaleString()}`,
      icon: <DollarLineIcon className="text-gray-800 size-6 dark:text-white/90" />,
      color: "success"
    },
    {
      label: "Ready for Sale",
      value: `${stats?.inventorySummary?.available || 0} Vehicles`,
      icon: <ShootingStarIcon className="text-gray-800 size-6 dark:text-white/90" />,
      color: "brand"
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-6">
      {items.map((item, index) => (
        <div key={index} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            {item.icon}
          </div>

          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {item.label}
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {item.value}
              </h4>
            </div>
            {/* Optional: Add growth indicators if backend provides them */}
          </div>
        </div>
      ))}
    </div>
  );
};
