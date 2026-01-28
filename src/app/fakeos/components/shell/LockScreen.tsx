"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Lock, Camera, Flashlight, Battery, Wifi, Signal } from "lucide-react";
import { useFakeOS } from "../../context";

export function LockScreen() {
  const { isLocked, setIsLocked, osStyle } = useFakeOS();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [unlockProgress, setUnlockProgress] = useState(0);
  const dragY = useMotionValue(0);

  const isIOS = osStyle === "ios";

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (info.offset.y < -150 || info.velocity.y < -500) {
        if (navigator.vibrate) navigator.vibrate([20, 50, 20]);
        setIsLocked(false);
      }
      setUnlockProgress(0);
    },
    [setIsLocked]
  );

  const handleDrag = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const progress = Math.min(Math.abs(info.offset.y) / 200, 1);
      setUnlockProgress(progress);
    },
    []
  );

  const formattedTime = currentTime.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedDate = currentTime.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const opacity = useTransform(dragY, [0, -200], [1, 0]);
  const scale = useTransform(dragY, [0, -200], [1, 0.9]);
  const blur = useTransform(dragY, [0, -200], [0, 20]);

  return (
    <AnimatePresence>
      {isLocked && (
        <motion.div
          className="fixed inset-0 z-[200] overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
          transition={{ duration: 0.4 }}
        >
          {/* Wallpaper */}
          <div className="absolute inset-0">
            {/* Premium gradient background */}
            <div
              className="absolute inset-0"
              style={{
                background: isIOS
                  ? "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
                  : "linear-gradient(180deg, #1a1a2e 0%, #2d1b4e 50%, #1a1a2e 100%)"
              }}
            />

            {/* Animated gradient orbs */}
            <motion.div
              className="absolute w-[500px] h-[500px] rounded-full"
              style={{
                background: isIOS
                  ? "radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)"
                  : "radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)",
                top: "-100px",
                right: "-100px",
                filter: "blur(60px)",
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.4, 0.6, 0.4],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute w-[400px] h-[400px] rounded-full"
              style={{
                background: isIOS
                  ? "radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)"
                  : "radial-gradient(circle, rgba(244,114,182,0.3) 0%, transparent 70%)",
                bottom: "20%",
                left: "-100px",
                filter: "blur(60px)",
              }}
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />
          </div>

          {/* Status Bar */}
          <motion.div
            className="absolute top-0 left-0 right-0 px-6 pt-3 flex items-center justify-between z-10"
            style={{ paddingTop: "max(env(safe-area-inset-top), 12px)" }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-white/90 font-medium text-sm">
              {formattedTime}
            </span>

            {isIOS && (
              <div className="w-28 h-8 bg-black rounded-full" />
            )}

            <div className="flex items-center gap-1.5">
              <Signal className="w-4 h-4 text-white/90" />
              <Wifi className="w-4 h-4 text-white/90" />
              <div className="flex items-center">
                <Battery className="w-6 h-4 text-white/90" />
              </div>
            </div>
          </motion.div>

          {/* Main Content - Draggable */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing"
            style={{ y: dragY, opacity, scale }}
            drag="y"
            dragConstraints={{ top: -250, bottom: 0 }}
            dragElastic={{ top: 0.2, bottom: 0 }}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
          >
            {/* Lock Icon */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="mb-6"
            >
              <motion.div
                className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  isIOS
                    ? "bg-white/10 backdrop-blur-xl border border-white/20"
                    : "bg-white/5"
                }`}
                animate={unlockProgress > 0 ? { scale: 1 + unlockProgress * 0.2 } : {}}
              >
                <Lock
                  className={`w-6 h-6 transition-colors ${
                    unlockProgress > 0.5 ? "text-green-400" : "text-white/70"
                  }`}
                />
              </motion.div>
            </motion.div>

            {/* Time */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <h1
                className={`font-thin tracking-tight ${
                  isIOS ? "text-8xl text-white" : "text-7xl text-white"
                }`}
                style={{
                  fontFamily: isIOS ? "-apple-system, SF Pro Display" : "Google Sans, Roboto",
                  textShadow: "0 4px 30px rgba(0,0,0,0.3)"
                }}
              >
                {formattedTime}
              </h1>
            </motion.div>

            {/* Date */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={`text-white/70 mt-2 capitalize ${
                isIOS ? "text-xl font-light" : "text-lg"
              }`}
            >
              {formattedDate}
            </motion.p>

            {/* Notification Preview Widget */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-10 w-full max-w-sm px-6"
            >
              <div
                className={`p-4 backdrop-blur-2xl border border-white/10 ${
                  isIOS
                    ? "bg-white/10 rounded-[20px]"
                    : "bg-white/5 rounded-2xl"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">D</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white/90 text-sm font-semibold">DEAL</p>
                    <p className="text-white/50 text-xs">Maintenant</p>
                  </div>
                </div>
                <p className="text-white/80 text-sm">
                  Nouveau devis signé ! Dupont SPRL a accepté votre devis de 8 500 €
                </p>
              </div>
            </motion.div>

            {/* Stats Widget */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-4 w-full max-w-sm px-6"
            >
              <div
                className={`p-4 backdrop-blur-2xl border border-white/10 ${
                  isIOS
                    ? "bg-white/10 rounded-[20px]"
                    : "bg-white/5 rounded-2xl"
                }`}
              >
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-white">12.4k</p>
                    <p className="text-white/50 text-xs">CA Mois</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">3</p>
                    <p className="text-white/50 text-xs">En attente</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">75%</p>
                    <p className="text-white/50 text-xs">Conversion</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Bottom Quick Actions */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 pb-8 px-10"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 32px)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            {/* Swipe indicator */}
            <motion.div
              className="flex flex-col items-center mb-8"
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <div className="w-1 h-8 rounded-full bg-gradient-to-t from-white/0 via-white/50 to-white/0" />
              <p className="text-white/40 text-sm mt-2">Glisser pour déverrouiller</p>
            </motion.div>

            {/* Quick actions */}
            <div className="flex items-center justify-between">
              <motion.button
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isIOS
                    ? "bg-white/10 backdrop-blur-xl"
                    : "bg-white/5"
                }`}
                whileTap={{ scale: 0.9 }}
              >
                <Flashlight className="w-5 h-5 text-white/70" />
              </motion.button>

              {/* Home indicator */}
              <div className={`w-32 h-1 rounded-full ${isIOS ? "bg-white/30" : "bg-white/20"}`} />

              <motion.button
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isIOS
                    ? "bg-white/10 backdrop-blur-xl"
                    : "bg-white/5"
                }`}
                whileTap={{ scale: 0.9 }}
              >
                <Camera className="w-5 h-5 text-white/70" />
              </motion.button>
            </div>
          </motion.div>

          {/* Unlock Progress Ring */}
          {unlockProgress > 0 && (
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <svg width="200" height="200" className="rotate-[-90deg]">
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="2"
                />
                <motion.circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke={unlockProgress > 0.7 ? "#34D399" : "#fff"}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={565}
                  strokeDashoffset={565 - (565 * unlockProgress)}
                  style={{ filter: "drop-shadow(0 0 10px rgba(255,255,255,0.3))" }}
                />
              </svg>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
