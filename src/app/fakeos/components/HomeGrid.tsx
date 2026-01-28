"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { useFakeOS } from "../context";
import { type AppConfig, iconMap } from "./apps/AppRegistry";

interface HomeGridProps {
  apps: AppConfig[];
}

export function HomeGrid({ apps }: HomeGridProps) {
  return (
    <motion.div
      className="flex-1 grid grid-cols-4 gap-4 content-start"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.05,
            delayChildren: 0.4,
          },
        },
      }}
    >
      {apps.map((app) => (
        <AppIcon key={app.id} app={app} />
      ))}
    </motion.div>
  );
}

interface AppIconProps {
  app: AppConfig;
}

function AppIcon({ app }: AppIconProps) {
  const { launchApp } = useFakeOS();
  const iconRef = useRef<HTMLButtonElement>(null);
  const Icon = iconMap[app.icon];

  const handleClick = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      launchApp(app, rect);
    }
  };

  return (
    <motion.button
      ref={iconRef}
      onClick={handleClick}
      className="flex flex-col items-center gap-2 p-2 rounded-2xl active:bg-white/10 transition-colors"
      variants={{
        hidden: { opacity: 0, scale: 0.5, y: 20 },
        visible: {
          opacity: 1,
          scale: 1,
          y: 0,
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 25,
          },
        },
      }}
      whileTap={{ scale: 0.9 }}
    >
      <motion.div
        className="relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
        style={{
          backgroundColor: app.color,
          boxShadow: `0 8px 24px ${app.color}40`,
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {Icon && <Icon className="w-7 h-7 text-white" strokeWidth={2} />}

        {/* Badge */}
        {app.badge && app.badge > 0 && (
          <motion.div
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, delay: 0.5 }}
          >
            <span className="text-white text-[10px] font-bold">
              {app.badge > 99 ? "99+" : app.badge}
            </span>
          </motion.div>
        )}
      </motion.div>

      <span className="text-white text-xs font-medium text-center leading-tight max-w-[64px] truncate">
        {app.name}
      </span>
    </motion.button>
  );
}
