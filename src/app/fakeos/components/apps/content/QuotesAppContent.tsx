"use client";

import { motion } from "framer-motion";
import { Plus, Search, Filter, MoreHorizontal, FileText, Clock, CheckCircle, XCircle } from "lucide-react";

// Demo quotes data
const demoQuotes = [
  {
    id: "QT-1042",
    client: "Dupont SPRL",
    subject: "Rénovation cuisine complète",
    amount: 8500,
    status: "pending",
    date: "2024-01-28",
    daysAgo: 2,
  },
  {
    id: "QT-1041",
    client: "Martin & Fils",
    subject: "Installation électrique atelier",
    amount: 3200,
    status: "accepted",
    date: "2024-01-25",
    daysAgo: 5,
  },
  {
    id: "QT-1040",
    client: "Bernard SA",
    subject: "Peinture bureaux",
    amount: 2100,
    status: "pending",
    date: "2024-01-22",
    daysAgo: 8,
  },
  {
    id: "QT-1039",
    client: "Petit Jean",
    subject: "Terrasse bois",
    amount: 4800,
    status: "rejected",
    date: "2024-01-20",
    daysAgo: 10,
  },
  {
    id: "QT-1038",
    client: "Garcia Construction",
    subject: "Extension garage",
    amount: 12500,
    status: "accepted",
    date: "2024-01-18",
    daysAgo: 12,
  },
];

const statusConfig = {
  pending: {
    label: "En attente",
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    icon: Clock,
  },
  accepted: {
    label: "Accepté",
    color: "bg-green-500/10 text-green-600 dark:text-green-400",
    icon: CheckCircle,
  },
  rejected: {
    label: "Refusé",
    color: "bg-red-500/10 text-red-600 dark:text-red-400",
    icon: XCircle,
  },
};

export function QuotesAppContent() {
  return (
    <div className="p-4 space-y-4">
      {/* Header Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un devis..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-deal-coral/50 transition-all"
          />
        </div>
        {/* Filter */}
        <motion.button
          className="p-2.5 bg-gray-100 dark:bg-white/10 rounded-xl"
          whileTap={{ scale: 0.95 }}
        >
          <Filter className="w-5 h-5 text-gray-600 dark:text-white/60" />
        </motion.button>
        {/* Add */}
        <motion.button
          className="p-2.5 bg-deal-coral rounded-xl"
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-5 h-5 text-white" />
        </motion.button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "En attente", value: 3, color: "text-amber-500" },
          { label: "Acceptés", value: 12, color: "text-green-500" },
          { label: "Ce mois", value: "24,5k €", color: "text-deal-coral" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 dark:text-white/50">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quotes List */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-white/60 uppercase tracking-wider">
          Devis récents
        </h3>

        {demoQuotes.map((quote, index) => {
          const status = statusConfig[quote.status as keyof typeof statusConfig];
          const StatusIcon = status.icon;

          return (
            <motion.div
              key={quote.id}
              className="bg-white dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-white/10 shadow-sm"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      {quote.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${status.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </div>
                  <p className="text-gray-900 dark:text-white font-medium truncate">
                    {quote.client}
                  </p>
                  <p className="text-gray-500 dark:text-white/50 text-sm truncate">
                    {quote.subject}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {quote.amount.toLocaleString("fr-FR")} €
                  </p>
                  <p className="text-xs text-gray-400 dark:text-white/40">
                    Il y a {quote.daysAgo} jours
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
