"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { api } from "@/lib/api";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function StatisticsChart() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/stats")
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch stats:", err);
        setLoading(false);
      });
  }, []);

  const options: ApexOptions = {
    colors: ["#465FFF", "#01B574", "#FF9F43"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut",
    },
    labels: ["Service Jobs", "Vehicle Sales", "Net Profit"],
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Net Profit",
              formatter: () => `₹${(stats?.revenueSummary?.netProfit || 0).toLocaleString()}`,
              color: "#374151"
            }
          }
        }
      }
    },
    dataLabels: { enabled: false },
    legend: {
      position: "bottom",
      fontFamily: "Outfit",
      fontWeight: 500,
      labels: { colors: "#6B7280" },
      markers: { size: 7, shape: "circle" }
    },
    tooltip: {
      y: { formatter: (val) => `₹${val.toLocaleString()}` }
    }
  };

  const series = [
    stats?.revenueSummary?.serviceRevenue || 0,
    stats?.revenueSummary?.salesRevenue || 0,
    stats?.revenueSummary?.netProfit || 0
  ];

  if (loading) return <div className="h-[300px] flex items-center justify-center text-gray-400">Loading breakdown...</div>;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6 h-full">
      <div className="flex flex-col gap-5 mb-8">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white/90">
            Income Breakdown
          </h3>
          <p className="mt-1 text-xs font-medium text-gray-500 uppercase tracking-widest bg-gray-50 dark:bg-gray-800 inline-block px-2 py-0.5 rounded">
            All Time Financial Snapshot
          </p>
        </div>
      </div>

      <div className="flex justify-center items-center">
        <Chart options={options} series={series} type="donut" width="100%" height={320} />
      </div>

      <div className="mt-8 space-y-4">
          <div className="flex justify-between items-center bg-brand-50/20 dark:bg-brand-500/5 p-3 rounded-xl border border-brand-100 dark:border-brand-500/10">
              <span className="text-sm font-semibold text-brand-600">Total Revenue Generated</span>
              <span className="text-lg font-extrabold text-brand-700 dark:text-white">₹{(stats?.revenueSummary?.totalRevenue || 0).toLocaleString()}</span>
          </div>
      </div>
    </div>
  );
}