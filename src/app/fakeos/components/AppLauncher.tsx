"use client";

import { motion } from "framer-motion";
import { X, ChevronLeft } from "lucide-react";
import { useFakeOS } from "../context";
import { type AppConfig, iconMap } from "./apps/AppRegistry";

interface AppLauncherProps {
  app: AppConfig;
  onClose: () => void;
}

export function AppLauncher({ app, onClose }: AppLauncherProps) {
  const { iconRect } = useFakeOS();
  const Icon = iconMap[app.icon];

  const initialX = iconRect ? iconRect.left + iconRect.width / 2 : typeof window !== 'undefined' ? window.innerWidth / 2 : 200;
  const initialY = iconRect ? iconRect.top + iconRect.height / 2 : typeof window !== 'undefined' ? window.innerHeight / 2 : 400;

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-white dark:bg-deal-navy"
      initial={{
        clipPath: `circle(0% at ${initialX}px ${initialY}px)`,
        opacity: 0,
      }}
      animate={{
        clipPath: `circle(150% at ${initialX}px ${initialY}px)`,
        opacity: 1,
      }}
      exit={{
        clipPath: `circle(0% at ${initialX}px ${initialY}px)`,
        opacity: 0,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        opacity: { duration: 0.2 },
      }}
    >
      {/* App Header */}
      <motion.div
        className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-deal-navy/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/10"
        style={{ paddingTop: "max(env(safe-area-inset-top), 12px)" }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.button
          onClick={onClose}
          className="flex items-center gap-1 text-deal-coral"
          whileTap={{ scale: 0.95 }}
        >
          <ChevronLeft className="w-6 h-6" />
          <span className="font-medium">Retour</span>
        </motion.button>

        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: app.color }}
          >
            {Icon && <Icon className="w-5 h-5 text-white" strokeWidth={2} />}
          </div>
          <span className="font-semibold text-gray-900 dark:text-white">{app.name}</span>
        </div>

        <motion.button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center"
          whileTap={{ scale: 0.9 }}
        >
          <X className="w-5 h-5 text-gray-600 dark:text-white/60" />
        </motion.button>
      </motion.div>

      {/* App Content */}
      <motion.div
        className="flex-1 p-6 overflow-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="max-w-lg mx-auto">
          <AppDemoContent app={app} />
        </div>
      </motion.div>
    </motion.div>
  );
}

function AppDemoContent({ app }: { app: AppConfig }) {
  const Icon = iconMap[app.icon];

  const demoContent: Record<string, JSX.Element> = {
    quotes: (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Mes Devis</h2>
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-200 dark:border-white/10"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i }}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Devis #{1000 + i}</p>
                <p className="text-sm text-gray-500 dark:text-white/60">Client {i}</p>
              </div>
              <span className="px-2 py-1 bg-deal-coral/10 text-deal-coral text-xs font-medium rounded-full">
                En attente
              </span>
            </div>
            <p className="mt-2 text-lg font-bold text-gray-900 dark:text-white">
              {(1500 * i).toLocaleString("fr-FR")} EUR
            </p>
          </motion.div>
        ))}
      </div>
    ),
    clients: (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Mes Clients</h2>
        {["Dupont", "Martin", "Bernard"].map((name, i) => (
          <motion.div
            key={name}
            className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-200 dark:border-white/10 flex items-center gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i }}
          >
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">{name[0]}</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{name}</p>
              <p className="text-sm text-gray-500 dark:text-white/60">3 devis</p>
            </div>
          </motion.div>
        ))}
      </div>
    ),
    analytics: (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Statistiques</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "CA Mois", value: "12 450 €", color: "bg-blue-500" },
            { label: "Devis envoyés", value: "24", color: "bg-purple-500" },
            { label: "Taux conversion", value: "68%", color: "bg-green-500" },
            { label: "Clients actifs", value: "18", color: "bg-orange-500" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-200 dark:border-white/10"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * i }}
            >
              <div className={`w-3 h-3 rounded-full ${stat.color} mb-2`} />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-gray-500 dark:text-white/60">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    ),
  };

  return (
    demoContent[app.id] || (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
          style={{ backgroundColor: app.color }}
        >
          {Icon && <Icon className="w-10 h-10 text-white" />}
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{app.name}</h2>
        <p className="text-gray-500 dark:text-white/60">
          Cette fonctionnalité sera bientôt disponible
        </p>
      </div>
    )
  );
}
