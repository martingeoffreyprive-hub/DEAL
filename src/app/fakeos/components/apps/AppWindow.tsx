"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { X, ChevronLeft, MoreVertical } from "lucide-react";
import { type AppConfig, iconMap } from "./AppRegistry";
import { QuotesAppContent, ClientsAppContent, AnalyticsAppContent, SettingsAppContent } from "./content";
import { useFakeOS } from "../../context";

export function AppWindow() {
  const { activeApp, isAppOpen, iconRect, closeApp } = useFakeOS();
  const [isDragging, setIsDragging] = useState(false);
  const dragY = useMotionValue(0);

  // Default app config for type safety
  const app = activeApp || {
    id: "",
    name: "",
    icon: "FileText" as const,
    color: "#E85A5A",
    href: "",
    category: "main" as const,
  };

  const Icon = iconMap[app.icon] || iconMap.FileText;

  // Calculate initial position from icon
  const initialX = iconRect
    ? iconRect.left + iconRect.width / 2
    : typeof window !== "undefined"
    ? window.innerWidth / 2
    : 200;
  const initialY = iconRect
    ? iconRect.top + iconRect.height / 2
    : typeof window !== "undefined"
    ? window.innerHeight / 2
    : 400;

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setIsDragging(false);
      // Close app if dragged down enough
      if (info.offset.y > 200 || info.velocity.y > 500) {
        if (navigator.vibrate) navigator.vibrate(20);
        closeApp();
      }
    },
    [closeApp]
  );

  const opacity = useTransform(dragY, [0, 300], [1, 0.5]);
  const scale = useTransform(dragY, [0, 300], [1, 0.85]);

  return (
    <AnimatePresence>
      {isAppOpen && activeApp && (
        <motion.div
          className="fixed inset-0 z-[100]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: isDragging ? 1 : 0 }}
          />

          {/* App Window */}
          <motion.div
            className="absolute inset-0 bg-white dark:bg-deal-navy overflow-hidden"
            style={{ y: dragY, opacity, scale }}
            initial={{
              clipPath: `circle(0% at ${initialX}px ${initialY}px)`,
              borderRadius: 32,
            }}
            animate={{
              clipPath: `circle(150% at ${initialX}px ${initialY}px)`,
              borderRadius: isDragging ? 32 : 0,
            }}
            exit={{
              clipPath: `circle(0% at ${initialX}px ${initialY}px)`,
              borderRadius: 32,
              opacity: 0,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              opacity: { duration: 0.2 },
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
          >
            {/* App Header */}
            <motion.div
              className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-deal-navy/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/10"
              style={{ paddingTop: "max(env(safe-area-inset-top), 12px)" }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              {/* Back button */}
              <motion.button
                onClick={closeApp}
                className="flex items-center gap-1 text-deal-coral min-w-[80px]"
                whileTap={{ scale: 0.95 }}
              >
                <ChevronLeft className="w-6 h-6" />
                <span className="font-medium">Retour</span>
              </motion.button>

              {/* App title with icon */}
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: app.color }}
                >
                  <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {app.name}
                </span>
              </div>

              {/* Menu button */}
              <motion.button
                className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10 min-w-[40px]"
                whileTap={{ scale: 0.9 }}
              >
                <MoreVertical className="w-5 h-5" />
              </motion.button>
            </motion.div>

            {/* Drag indicator - shows when dragging */}
            {isDragging && (
              <motion.div
                className="absolute top-20 left-1/2 -translate-x-1/2 z-20"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="px-4 py-2 bg-black/80 rounded-full">
                  <p className="text-white text-sm font-medium">
                    Glisser vers le bas pour fermer
                  </p>
                </div>
              </motion.div>
            )}

            {/* App Content */}
            <motion.div
              className="flex-1 overflow-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                height: "calc(100vh - 60px)",
                paddingBottom: "env(safe-area-inset-bottom)",
              }}
            >
              <DefaultAppContent app={app} />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Content mapping for each app
const appContentMap: Record<string, React.ComponentType> = {
  quotes: QuotesAppContent,
  clients: ClientsAppContent,
  analytics: AnalyticsAppContent,
  settings: SettingsAppContent,
};

// Default content when no children provided
function DefaultAppContent({ app }: { app: AppConfig }) {
  const Icon = iconMap[app.icon];

  // Check if there's a specific content component for this app
  const ContentComponent = appContentMap[app.id];
  if (ContentComponent) {
    return <ContentComponent />;
  }

  // Fallback for apps without specific content
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
      >
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-lg"
          style={{
            backgroundColor: app.color,
            boxShadow: `0 12px 40px ${app.color}40`,
          }}
        >
          {Icon && <Icon className="w-12 h-12 text-white" strokeWidth={1.5} />}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {app.name}
        </h2>
        <p className="text-gray-500 dark:text-white/60 mb-6">
          {app.description || "Fonctionnalité à venir"}
        </p>

        <motion.button
          className="px-6 py-3 rounded-xl font-semibold text-white shadow-lg"
          style={{
            backgroundColor: app.color,
            boxShadow: `0 4px 20px ${app.color}50`,
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Ouvrir dans le dashboard
        </motion.button>
      </motion.div>
    </div>
  );
}
