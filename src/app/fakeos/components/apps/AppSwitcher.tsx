"use client";

import { useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { X } from "lucide-react";
import { type AppConfig, iconMap } from "./AppRegistry";
import { useFakeOS, type RecentApp } from "../../context";

export function AppSwitcher() {
  const {
    isAppSwitcherOpen,
    setIsAppSwitcherOpen,
    recentApps,
    launchApp,
    closeRecentApp,
    clearRecentApps,
  } = useFakeOS();

  const onClose = useCallback(() => setIsAppSwitcherOpen(false), [setIsAppSwitcherOpen]);

  const onSelectApp = useCallback((app: AppConfig) => {
    // Create a dummy DOMRect for re-launching
    const dummyRect = new DOMRect(
      window.innerWidth / 2 - 30,
      window.innerHeight / 2 - 30,
      60,
      60
    );
    launchApp(app, dummyRect);
    setIsAppSwitcherOpen(false);
  }, [launchApp, setIsAppSwitcherOpen]);

  const handleCardDragEnd = useCallback(
    (appId: string, _: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      // Close app if swiped up fast enough
      if (info.offset.y < -100 || info.velocity.y < -500) {
        if (navigator.vibrate) navigator.vibrate(20);
        closeRecentApp(appId);
      }
    },
    [closeRecentApp]
  );

  return (
    <AnimatePresence>
      {isAppSwitcherOpen && (
        <motion.div
          className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Header */}
          <motion.div
            className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between"
            style={{ paddingTop: "max(env(safe-area-inset-top), 16px)" }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-white text-lg font-semibold">Apps récentes</h2>
            <motion.button
              className="px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium"
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                clearRecentApps();
              }}
            >
              Tout fermer
            </motion.button>
          </motion.div>

          {/* App Cards */}
          <div className="absolute inset-0 flex items-center justify-center overflow-x-auto px-8 pt-20 pb-24 snap-x snap-mandatory">
            {recentApps.length === 0 ? (
              <motion.div
                className="text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-white/60 text-lg">Aucune app récente</p>
                <p className="text-white/40 text-sm mt-2">
                  Lancez une app pour la voir ici
                </p>
              </motion.div>
            ) : (
              <div className="flex gap-4 min-w-max">
                {recentApps.map((recentApp, index) => (
                  <AppCard
                    key={recentApp.app.id}
                    recentApp={recentApp}
                    index={index}
                    onSelect={() => onSelectApp(recentApp.app)}
                    onClose={() => closeRecentApp(recentApp.app.id)}
                    onDragEnd={(e, info) =>
                      handleCardDragEnd(recentApp.app.id, e, info)
                    }
                  />
                ))}
              </div>
            )}
          </div>

          {/* Instructions */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 p-4 text-center"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 16px)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-white/50 text-sm">
              Glissez vers le haut pour fermer une app
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface AppCardProps {
  recentApp: RecentApp;
  index: number;
  onSelect: () => void;
  onClose: () => void;
  onDragEnd: (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
}

function AppCard({ recentApp, index, onSelect, onClose, onDragEnd }: AppCardProps) {
  const { app, previewData } = recentApp;
  const Icon = iconMap[app.icon] || iconMap.FileText;

  return (
    <motion.div
      className="relative w-64 snap-center"
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5, y: -200 }}
      transition={{ delay: index * 0.05 }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.3, bottom: 0 }}
      onDragEnd={onDragEnd}
      whileTap={{ scale: 0.98 }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Close button */}
      <motion.button
        className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full bg-gray-800 border-2 border-white/20 flex items-center justify-center shadow-lg"
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.stopPropagation();
          if (navigator.vibrate) navigator.vibrate(15);
          onClose();
        }}
      >
        <X className="w-4 h-4 text-white" />
      </motion.button>

      {/* App Preview Card */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-deal-navy-light shadow-2xl border border-white/10">
        {/* App Header */}
        <div
          className="p-4 flex items-center gap-3"
          style={{ backgroundColor: app.color }}
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white truncate">{app.name}</p>
            <p className="text-white/70 text-xs truncate">
              {previewData?.subtitle || app.description}
            </p>
          </div>
        </div>

        {/* Preview Content */}
        <div className="p-4 h-48 bg-gray-50 dark:bg-deal-navy">
          <AppPreviewContent app={app} previewData={previewData} />
        </div>
      </div>
    </motion.div>
  );
}

function AppPreviewContent({
  app,
  previewData,
}: {
  app: AppConfig;
  previewData?: RecentApp["previewData"];
}) {
  // Generate preview based on app type
  const previews: Record<string, React.ReactNode> = {
    quotes: (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-2 p-2 bg-white dark:bg-white/5 rounded-lg"
          >
            <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/30" />
            <div className="flex-1">
              <div className="h-2 bg-gray-200 dark:bg-white/20 rounded w-2/3" />
              <div className="h-1.5 bg-gray-100 dark:bg-white/10 rounded w-1/2 mt-1" />
            </div>
            <div className="h-4 w-12 bg-green-100 dark:bg-green-900/30 rounded" />
          </div>
        ))}
      </div>
    ),
    clients: (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-2 p-2 bg-white dark:bg-white/5 rounded-lg"
          >
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30" />
            <div className="flex-1">
              <div className="h-2 bg-gray-200 dark:bg-white/20 rounded w-1/2" />
              <div className="h-1.5 bg-gray-100 dark:bg-white/10 rounded w-1/3 mt-1" />
            </div>
          </div>
        ))}
      </div>
    ),
    analytics: (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="p-2 bg-white dark:bg-white/5 rounded-lg"
            >
              <div className="h-2 bg-gray-200 dark:bg-white/20 rounded w-1/2 mb-1" />
              <div className="h-4 bg-purple-100 dark:bg-purple-900/30 rounded w-2/3" />
            </div>
          ))}
        </div>
        <div className="h-16 bg-gradient-to-r from-purple-100 via-blue-100 to-green-100 dark:from-purple-900/30 dark:via-blue-900/30 dark:to-green-900/30 rounded-lg" />
      </div>
    ),
    invoices: (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-2 p-2 bg-white dark:bg-white/5 rounded-lg"
          >
            <div className="w-8 h-8 rounded bg-amber-100 dark:bg-amber-900/30" />
            <div className="flex-1">
              <div className="h-2 bg-gray-200 dark:bg-white/20 rounded w-2/3" />
              <div className="h-1.5 bg-gray-100 dark:bg-white/10 rounded w-1/2 mt-1" />
            </div>
            <div className="h-4 w-14 bg-amber-100 dark:bg-amber-900/30 rounded" />
          </div>
        ))}
      </div>
    ),
  };

  const Icon = iconMap[app.icon];

  return (
    previews[app.id] || (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center opacity-20"
          style={{ backgroundColor: app.color }}
        >
          {Icon && <Icon className="w-6 h-6 text-white" />}
        </div>
        <p className="text-gray-400 dark:text-white/30 text-xs mt-2">Aperçu</p>
      </div>
    )
  );
}
