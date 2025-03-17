// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import ApexCharts from "apexcharts";
import { useEffect } from "react";

const Chart = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const options = {
    chart: {
      height: "100%",
      maxWidth: "100%",
      type: "line",
      fontFamily: "Inter, sans-serif",
      dropShadow: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
    },
    tooltip: {
      enabled: true,
      x: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 2,
      curve: "smooth",
    },
    grid: {
      show: true,
      strokeDashArray: 4,
      padding: {
        left: 2,
        right: 2,
        top: -26,
      },
    },
    series: [
      {
        name: "ASset Terjual",
        data: [6500, 6418, 6456, 6526, 6356, 6456],
        color: "#FFB3AF",
      },
      {
        name: "Transaksi",
        data: [6456, 6356, 6526, 6332, 6418, 6500],
        color: "#BE0924",
      },
    ],
    legend: {
      show: false,
    },
    xaxis: {
      categories: [
        "01 Feb",
        "02 Feb",
        "03 Feb",
        "04 Feb",
        "05 Feb",
        "06 Feb",
        "07 Feb",
      ],
      labels: {
        show: true,
        style: {
          fontFamily: "Inter, sans-serif",
          cssClass: "text-xs font-normal fill-gray-500 dark:fill-gray-400",
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      show: false,
    },
  };

  useEffect(() => {
    const chart = new ApexCharts(
      document.getElementById("line-chart"),
      options
    );
    chart.render();

    return () => {
      chart.destroy();
    };
  }, []);

  return (
    <>
      <div className="w-full h-auto   bg-white rounded-lg shadow-lg dark:bg-neutral-25 dark:shadow-neutral-10 p-4 md:p-6">
        <div className="flex justify-between mb-5">
          <div className="grid gap-4 grid-cols-2">
            <div>
              <h5 className="flex items-center text-gray-500 dark:text-gray-400 mb-2">
                All Asset
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-6 h-3 text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer ms-1"
                  aria-hidden="true">
                  ?
                </button>
              </h5>
              <p className="text-gray-900 dark:text-white text-2xl font-bold">
                420
              </p>
              {dropdownOpen && (
                <div className="absolute z-10 p-3 mt-2 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-neutral-20 dark:border-gray-600">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Clicks growth - Incremental
                  </h3>
                  <p>
                    Report helps navigate cumulative growth of community
                    activities. Ideally, the chart should have a growing trend,
                    as stagnating chart signifies a significant decrease of
                    community activity.
                  </p>
                </div>
              )}
            </div>
            <div>
              <h5 className="flex items-center text-gray-500 dark:text-gray-400 mb-2">
                Asset Terjual
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-10 h-4 text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer ms-1"
                  aria-hidden="true">
                  ?
                </button>
              </h5>
              <p className="text-gray-900 dark:text-white text-2xl font-bold">
                1000
              </p>
              {dropdownOpen && (
                <div className="absolute z-10 p-3 mt-2 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-neutral-20 dark:border-gray-600">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    CPC growth - Incremental
                  </h3>
                  <p>
                    Report helps navigate cumulative growth of community
                    activities. Ideally, the chart should have a growing trend,
                    as stagnating chart signifies a significant decrease of
                    community activity.
                  </p>
                </div>
              )}
            </div>
          </div>
          <div>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className=" px-3 py-2 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 focus:outline-none dark:bg-neutral-20 dark:text-gray-400 dark:border-gray-600">
              date
              <svg
                className="w-2.5 h-2.5 ms-2.5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6">
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 4 4 4-4"
                />
              </svg>
            </button>
            {dropdownOpen && (
              <div className="z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700">
                <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                  {[
                    "Yesterday",
                    "Today",
                    "Last 7 days",
                    "Last 30 days",
                    "Last 90 days",
                  ].map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <div id="line-chart" className="h-48">
          <div className="grid grid-cols-1 items-center border-t border-gray-200 dark:border-gray-700 mt-2.5">
            <div className="pt-5">
              <a
                href="#"
                className="px-5 py-2.5 text-sm font-medium text-neutral-20  focus:ring-4 focus:outline-none rounded-lg flex items-center">
                View full report
                <svg
                  className="w-3.5 h-3.5 text-neutral-20 ms-2 rtl:rotate-180"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 16 20">
                  <path d="M14.066 0H7v5a2 2 0 0 1-2 2H0v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.934-2Zm-3 15H4.828a1 1 0 0 1 0-2h6.238a1 1 0 0 1 0 2Zm0-4H4.828a1 1 0 0 1 0-2h6.238a1 1 0 1 1 0 2Z" />
                  <path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.98 2.98 0 0 0 .13 5H5Z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chart;
