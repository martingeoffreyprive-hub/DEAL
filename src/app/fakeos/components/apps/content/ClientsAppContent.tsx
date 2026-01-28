"use client";

import { motion } from "framer-motion";
import { Plus, Search, Phone, Mail, MapPin, Building2, User, MoreVertical } from "lucide-react";

// Demo clients data
const demoClients = [
  {
    id: "1",
    name: "Dupont SPRL",
    type: "company",
    contact: "Jean Dupont",
    email: "jean@dupont-sprl.be",
    phone: "+32 475 12 34 56",
    location: "Bruxelles",
    quotesCount: 5,
    totalSpent: 24500,
  },
  {
    id: "2",
    name: "Martin & Fils",
    type: "company",
    contact: "Pierre Martin",
    email: "p.martin@martinfils.be",
    phone: "+32 486 78 90 12",
    location: "Liège",
    quotesCount: 3,
    totalSpent: 12800,
  },
  {
    id: "3",
    name: "Sophie Bernard",
    type: "individual",
    contact: "Sophie Bernard",
    email: "sophie.bernard@gmail.com",
    phone: "+32 479 45 67 89",
    location: "Namur",
    quotesCount: 2,
    totalSpent: 5200,
  },
  {
    id: "4",
    name: "Garcia Construction",
    type: "company",
    contact: "Carlos Garcia",
    email: "carlos@garcia-construction.be",
    phone: "+32 488 23 45 67",
    location: "Charleroi",
    quotesCount: 8,
    totalSpent: 45000,
  },
  {
    id: "5",
    name: "Michel Petit",
    type: "individual",
    contact: "Michel Petit",
    email: "michel.petit@outlook.be",
    phone: "+32 476 89 01 23",
    location: "Mons",
    quotesCount: 1,
    totalSpent: 3400,
  },
];

const getAvatarColor = (name: string) => {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-teal-500",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

export function ClientsAppContent() {
  return (
    <div className="p-4 space-y-4">
      {/* Header Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un client..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
          />
        </div>
        {/* Add */}
        <motion.button
          className="p-2.5 bg-green-500 rounded-xl"
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-5 h-5 text-white" />
        </motion.button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Total clients", value: "45", icon: User },
          { label: "Entreprises", value: "28", icon: Building2 },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <stat.icon className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stat.value}</p>
              <p className="text-xs text-green-700/60 dark:text-green-300/60">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Clients List */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-white/60 uppercase tracking-wider">
          Tous les clients
        </h3>

        {demoClients.map((client, index) => (
          <motion.div
            key={client.id}
            className="bg-white dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-white/10 shadow-sm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getAvatarColor(
                  client.name
                )}`}
              >
                <span className="text-white font-bold text-lg">
                  {client.name.charAt(0)}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                    {client.name}
                  </h4>
                  {client.type === "company" && (
                    <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-white/50">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {client.location}
                  </span>
                  <span>{client.quotesCount} devis</span>
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <motion.button
                    className="p-2 bg-gray-100 dark:bg-white/10 rounded-lg"
                    whileTap={{ scale: 0.9 }}
                  >
                    <Phone className="w-4 h-4 text-green-500" />
                  </motion.button>
                  <motion.button
                    className="p-2 bg-gray-100 dark:bg-white/10 rounded-lg"
                    whileTap={{ scale: 0.9 }}
                  >
                    <Mail className="w-4 h-4 text-blue-500" />
                  </motion.button>
                </div>
              </div>

              {/* Total */}
              <div className="text-right">
                <p className="font-bold text-gray-900 dark:text-white">
                  {client.totalSpent.toLocaleString("fr-FR")} €
                </p>
                <p className="text-xs text-gray-400">Total</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
