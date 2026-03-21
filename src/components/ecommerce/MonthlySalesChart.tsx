"use client";
import React, { useEffect, useState } from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { api } from "@/lib/api";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function MonthlySalesChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/stats");
        if (res.chartData) {
          setData(res.chartData);
        }
      } catch (err) {
        console.error("Failed to fetch chart data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "45%",
        borderRadius: 6,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: data.length > 0 ? data.map(item => item.month) : ["..."],
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        formatter: (val) => `₹${val.toLocaleString()}`
      }
    },
    grid: {
      yaxis: { lines: { show: true } },
    },
    tooltip: {
      y: { formatter: (val: number) => `₹${val.toLocaleString()}` },
    },
  };

  const series = [
    {
      name: "Revenue",
      data: data.map(item => item.revenue),
    },
  ];

  if (loading) return <div className="h-[250px] flex items-center justify-center text-gray-400">Loading charts...</div>;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white/90">
          Monthly Revenue Trend
        </h3>
        <span className="text-xs font-bold text-brand-500 uppercase tracking-widest">Live Report</span>
      </div>

      <div className="max-w-full overflow-x-auto">
        <div className="-ml-5 min-w-[500px] xl:min-w-full">
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={220}
          />
        </div>
      </div>
    </div>
  );
}
