"use client";

import { motion } from "framer-motion";
import { Wifi, Bell } from "lucide-react";

interface StatusBarProps {
  time: Date;
  batteryLevel?: number;
  signalStrength?: number;
  notificationCount?: number;
  onNotificationAreaClick?: () => void;
  onControlAreaClick?: () => void;
}

export function StatusBar({
  time,
  batteryLevel = 85,
  signalStrength = 4,
  notificationCount = 2,
  onNotificationAreaClick,
  onControlAreaClick,
}: StatusBarProps) {
  const formattedTime = time.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const getBatteryColor = () => {
    if (batteryLevel > 50) return "bg-green-400";
    if (batteryLevel > 20) return "bg-yellow-400";
    return "bg-red-400";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative z-50 px-5 py-2 flex items-center justify-between"
      style={{ paddingTop: "max(env(safe-area-inset-top), 8px)" }}
    >
      {/* Left: Time & Notifications - Tap to open Notification Center */}
      <motion.button
        className="flex items-center gap-2"
        whileTap={{ scale: 0.95 }}
        onClick={onNotificationAreaClick}
      >
        <span className="text-white font-semibold text-sm tracking-tight">
          {formattedTime}
        </span>
        {notificationCount > 0 && (
          <div className="relative">
            <Bell className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-deal-coral rounded-full flex items-center justify-center">
              <span className="text-[8px] text-white font-bold">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            </div>
          </div>
        )}
      </motion.button>

      {/* Center: Dynamic Island style notch */}
      <motion.div
        className="w-28 h-7 bg-black rounded-full flex items-center justify-center"
        whileTap={{ scale: 0.95, width: 120 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      </motion.div>

      {/* Right: Status icons - Tap to open Control Center */}
      <motion.button
        className="flex items-center gap-1.5"
        whileTap={{ scale: 0.95 }}
        onClick={onControlAreaClick}
      >
        {/* Signal strength */}
        <div className="flex items-end gap-[2px] h-3">
          {[1, 2, 3, 4].map((bar) => (
            <div
              key={bar}
              className={`w-[3px] rounded-sm transition-colors ${
                bar <= signalStrength ? "bg-white" : "bg-white/30"
              }`}
              style={{ height: `${bar * 25}%` }}
            />
          ))}
        </div>

        {/* WiFi */}
        <Wifi className="w-4 h-4 text-white" strokeWidth={2.5} />

        {/* Battery */}
        <div className="flex items-center gap-0.5">
          <div className="relative">
            <div className="w-6 h-3 rounded-sm border border-white/80 flex items-center p-[2px] overflow-hidden">
              <motion.div
                className={`h-full rounded-[1px] ${getBatteryColor()}`}
                initial={{ width: 0 }}
                animate={{ width: `${batteryLevel}%` }}
                transition={{ duration: 0.5, delay: 0.3 }}
              />
            </div>
            <div className="absolute -right-[2px] top-1/2 -translate-y-1/2 w-[2px] h-1.5 bg-white/80 rounded-r-sm" />
          </div>
          <span className="text-white/80 text-[10px] font-medium ml-0.5">
            {batteryLevel}%
          </span>
        </div>
      </motion.button>
    </motion.div>
  );
}
