"use client";

import { useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import {
  Wifi,
  Bluetooth,
  Moon,
  Sun,
  Volume2,
  Flashlight,
  Plane,
  MapPin,
  QrCode,
  Timer,
  Smartphone,
  Battery,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useFakeOS } from "../../context";

export function ControlCenter() {
  const { isControlCenterOpen: isOpen, setIsControlCenterOpen } = useFakeOS();
  const { theme, setTheme } = useTheme();

  const onClose = useCallback(() => setIsControlCenterOpen(false), [setIsControlCenterOpen]);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (info.offset.y < -50 || info.velocity.y < -300) {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[150]"
            style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(20px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Control Center Panel */}
          <motion.div
            className="fixed top-0 right-0 left-0 z-[151] p-4 max-w-md mx-auto"
            style={{ paddingTop: "max(env(safe-area-inset-top), 16px)" }}
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.1, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
          >
            <div className="bg-[#1C1C1E]/95 backdrop-blur-2xl rounded-[28px] overflow-hidden shadow-2xl border border-white/[0.08]">
              {/* Top Section - Connectivity */}
              <div className="p-4 grid grid-cols-2 gap-3">
                {/* Network Group */}
                <div className="bg-white/[0.08] rounded-2xl p-3 space-y-3">
                  <motion.button
                    className="w-full flex items-center gap-3"
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#007AFF] flex items-center justify-center">
                      <Wifi className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-white text-sm font-semibold">Wi-Fi</p>
                      <p className="text-white/50 text-xs">Maison</p>
                    </div>
                  </motion.button>
                  <motion.button
                    className="w-full flex items-center gap-3"
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="w-10 h-10 rounded-full bg-white/[0.15] flex items-center justify-center">
                      <Bluetooth className="w-5 h-5 text-white/60" />
                    </div>
                    <div className="text-left">
                      <p className="text-white/60 text-sm font-semibold">Bluetooth</p>
                      <p className="text-white/40 text-xs">Désactivé</p>
                    </div>
                  </motion.button>
                </div>

                {/* Mode Group */}
                <div className="bg-white/[0.08] rounded-2xl p-3 space-y-3">
                  <motion.button
                    className="w-full flex items-center gap-3"
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="w-10 h-10 rounded-full bg-white/[0.15] flex items-center justify-center">
                      <Plane className="w-5 h-5 text-white/60" />
                    </div>
                    <div className="text-left">
                      <p className="text-white/60 text-sm font-semibold">Avion</p>
                    </div>
                  </motion.button>
                  <motion.button
                    className="w-full flex items-center gap-3"
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#5856D6] flex items-center justify-center">
                      <Moon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-white text-sm font-semibold">Concentration</p>
                    </div>
                  </motion.button>
                </div>
              </div>

              {/* Media & Brightness */}
              <div className="px-4 pb-3 space-y-3">
                {/* Brightness */}
                <div className="bg-white/[0.08] rounded-2xl p-4">
                  <div className="flex items-center gap-4">
                    <Sun className="w-5 h-5 text-white/60" />
                    <div className="flex-1 h-8 bg-white/[0.15] rounded-full overflow-hidden relative">
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-white rounded-full"
                        style={{ width: "65%" }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Volume */}
                <div className="bg-white/[0.08] rounded-2xl p-4">
                  <div className="flex items-center gap-4">
                    <Volume2 className="w-5 h-5 text-white/60" />
                    <div className="flex-1 h-8 bg-white/[0.15] rounded-full overflow-hidden relative">
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-white rounded-full"
                        style={{ width: "45%" }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="px-4 pb-4 grid grid-cols-4 gap-3">
                {[
                  { icon: Flashlight, label: "Lampe", active: false },
                  { icon: Timer, label: "Minuteur", active: false },
                  { icon: QrCode, label: "Scanner", active: false },
                  { icon: MapPin, label: "Position", active: true, color: "#34C759" },
                ].map((item) => (
                  <motion.button
                    key={item.label}
                    className="flex flex-col items-center gap-2"
                    whileTap={{ scale: 0.9 }}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        item.active ? "" : "bg-white/[0.15]"
                      }`}
                      style={item.active ? { backgroundColor: item.color } : {}}
                    >
                      <item.icon className={`w-5 h-5 ${item.active ? "text-white" : "text-white/60"}`} />
                    </div>
                    <span className="text-white/50 text-[10px] font-medium">{item.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Theme Toggle */}
              <div className="px-4 pb-4">
                <motion.button
                  className="w-full p-4 rounded-2xl bg-white/[0.08] flex items-center justify-between"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setTheme(theme === "dark" ? "light" : "dark");
                    if (navigator.vibrate) navigator.vibrate(20);
                  }}
                >
                  <div className="flex items-center gap-3">
                    {theme === "dark" ? (
                      <Moon className="w-5 h-5 text-[#5856D6]" />
                    ) : (
                      <Sun className="w-5 h-5 text-[#FF9F0A]" />
                    )}
                    <span className="text-white font-medium">
                      Mode {theme === "dark" ? "sombre" : "clair"}
                    </span>
                  </div>
                  <div className="w-12 h-7 rounded-full bg-[#34C759] p-1 flex items-center justify-end">
                    <motion.div
                      className="w-5 h-5 rounded-full bg-white shadow"
                      layout
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </div>
                </motion.button>
              </div>

              {/* Drag indicator */}
              <div className="pb-3 flex justify-center">
                <div className="w-10 h-1 rounded-full bg-white/30" />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
