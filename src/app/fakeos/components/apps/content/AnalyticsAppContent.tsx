"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign, FileText, Users, Target, Calendar } from "lucide-react";

// Demo analytics data
const kpis = [
  {
    label: "CA du mois",
    value: "12 450 €",
    change: "+12%",
    positive: true,
    icon: DollarSign,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    label: "Devis envoyés",
    value: "24",
    change: "+8%",
    positive: true,
    icon: FileText,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    label: "Taux conversion",
    value: "68%",
    change: "+5%",
    positive: true,
    icon: Target,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    label: "Nouveaux clients",
    value: "7",
    change: "-2",
    positive: false,
    icon: Users,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
];

// Demo monthly data for chart
const monthlyData = [
  { month: "Sep", revenue: 8200 },
  { month: "Oct", revenue: 9500 },
  { month: "Nov", revenue: 7800 },
  { month: "Déc", revenue: 11200 },
  { month: "Jan", revenue: 12450 },
];

// Demo top clients
const topClients = [
  { name: "Garcia Construction", revenue: 45000, quotes: 8 },
  { name: "Dupont SPRL", revenue: 24500, quotes: 5 },
  { name: "Martin & Fils", revenue: 12800, quotes: 3 },
];

export function AnalyticsAppContent() {
  const maxRevenue = Math.max(...monthlyData.map((d) => d.revenue));

  return (
    <div className="p-4 space-y-6">
      {/* Period Selector */}
      <div className="flex items-center gap-2">
        {["7j", "30j", "90j", "1an"].map((period, i) => (
          <motion.button
            key={period}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              i === 1
                ? "bg-purple-500 text-white"
                : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60"
            }`}
            whileTap={{ scale: 0.95 }}
          >
            {period}
          </motion.button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.label}
            className="bg-white dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-white/10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-xl ${kpi.bgColor}`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <div
                className={`flex items-center gap-1 text-xs font-medium ${
                  kpi.positive ? "text-green-500" : "text-red-500"
                }`}
              >
                {kpi.positive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {kpi.change}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {kpi.value}
            </p>
            <p className="text-xs text-gray-500 dark:text-white/50 mt-1">
              {kpi.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      <motion.div
        className="bg-white dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-white/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Évolution CA
          </h3>
          <Calendar className="w-4 h-4 text-gray-400" />
        </div>

        {/* Simple Bar Chart */}
        <div className="flex items-end justify-between gap-2 h-32">
          {monthlyData.map((data, index) => (
            <motion.div
              key={data.month}
              className="flex-1 flex flex-col items-center gap-2"
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
              style={{ originY: 1 }}
            >
              <div className="w-full flex flex-col items-center">
                <span className="text-xs text-gray-500 dark:text-white/50 mb-1">
                  {(data.revenue / 1000).toFixed(1)}k
                </span>
                <motion.div
                  className={`w-full rounded-t-lg ${
                    index === monthlyData.length - 1
                      ? "bg-gradient-to-t from-purple-600 to-purple-400"
                      : "bg-gray-200 dark:bg-white/20"
                  }`}
                  style={{
                    height: `${(data.revenue / maxRevenue) * 80}px`,
                  }}
                  initial={{ height: 0 }}
                  animate={{ height: `${(data.revenue / maxRevenue) * 80}px` }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                />
              </div>
              <span className="text-xs text-gray-500 dark:text-white/50">
                {data.month}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Top Clients */}
      <motion.div
        className="bg-white dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-white/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          Top Clients
        </h3>

        <div className="space-y-3">
          {topClients.map((client, index) => (
            <div
              key={client.name}
              className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 dark:bg-white/5"
            >
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                <span className="text-purple-500 font-bold text-sm">
                  #{index + 1}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                  {client.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-white/50">
                  {client.quotes} devis
                </p>
              </div>
              <p className="font-bold text-gray-900 dark:text-white">
                {client.revenue.toLocaleString("fr-FR")} €
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
