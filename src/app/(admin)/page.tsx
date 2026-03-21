import type { Metadata } from "next";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import React from "react";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import DemographicCard from "@/components/ecommerce/DemographicCard";

export const metadata: Metadata = {
  title:
    "Next.js E-commerce Dashboard | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Home for TailAdmin Dashboard Template",
};

export default function Ecommerce() {
  return (
    <div className="space-y-6">
       <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white/90">Royal Garage Overview</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Welcome to your garage management suite! Here's a quick summary.</p>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <EcommerceMetrics />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <MonthlySalesChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <StatisticsChart />
        </div>
      </div>
    </div>
  );
}
