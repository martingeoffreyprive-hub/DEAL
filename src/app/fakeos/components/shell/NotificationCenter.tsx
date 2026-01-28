"use client";

import { useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { X, FileText, CheckCircle, DollarSign, Bell, Calendar, Sparkles } from "lucide-react";
import { useFakeOS } from "../../context";

interface Notification {
  id: string;
  app: string;
  appIcon: typeof FileText;
  appColor: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

// Demo notifications
const demoNotifications: Notification[] = [
  {
    id: "1",
    app: "Devis",
    appIcon: FileText,
    appColor: "#007AFF",
    title: "Devis signé !",
    message: "Dupont SPRL a accepté votre devis de 8 500 €",
    time: "Maintenant",
    read: false,
  },
  {
    id: "2",
    app: "Paiements",
    appIcon: DollarSign,
    appColor: "#34C759",
    title: "Paiement reçu",
    message: "Martin & Fils - 3 200 €",
    time: "Il y a 1h",
    read: false,
  },
  {
    id: "3",
    app: "Rappels",
    appIcon: Calendar,
    appColor: "#FF9500",
    title: "Devis expire bientôt",
    message: "QT-1038 expire dans 3 jours",
    time: "Il y a 2h",
    read: true,
  },
  {
    id: "4",
    app: "DEAL Pro",
    appIcon: Sparkles,
    appColor: "#AF52DE",
    title: "Nouveau record !",
    message: "Vous avez atteint 75% de taux de conversion ce mois-ci",
    time: "Hier",
    read: true,
  },
];

export function NotificationCenter() {
  const { isNotificationCenterOpen: isOpen, setIsNotificationCenterOpen } = useFakeOS();
  const onClose = useCallback(() => setIsNotificationCenterOpen(false), [setIsNotificationCenterOpen]);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (info.offset.y < -50 || info.velocity.y < -300) {
        onClose();
      }
    },
    [onClose]
  );

  const unreadCount = demoNotifications.filter((n) => !n.read).length;
  const currentTime = new Date();
  const formattedDate = currentTime.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

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

          {/* Notification Center Panel */}
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
            {/* Date Header */}
            <motion.div
              className="text-center mb-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <p className="text-white/60 text-sm font-medium capitalize">{formattedDate}</p>
            </motion.div>

            {/* Notifications Container */}
            <div className="space-y-3 max-h-[70vh] overflow-y-auto" style={{ scrollbarWidth: "none" }}>
              {demoNotifications.length === 0 ? (
                <motion.div
                  className="bg-[#1C1C1E]/95 backdrop-blur-2xl rounded-[20px] p-8 text-center border border-white/[0.08]"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Bell className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/40 font-medium">Aucune notification</p>
                </motion.div>
              ) : (
                demoNotifications.map((notification, index) => {
                  const Icon = notification.appIcon;
                  return (
                    <motion.div
                      key={notification.id}
                      className={`bg-[#1C1C1E]/95 backdrop-blur-2xl rounded-[20px] p-4 border border-white/[0.08] ${
                        !notification.read ? "bg-white/[0.02]" : ""
                      }`}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start gap-3">
                        {/* App Icon */}
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: notification.appColor }}
                        >
                          <Icon className="w-5 h-5 text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <span className="text-white/50 text-xs font-medium uppercase">
                              {notification.app}
                            </span>
                            <span className="text-white/30 text-xs">{notification.time}</span>
                          </div>
                          <p className="text-white font-semibold text-[15px] leading-tight">
                            {notification.title}
                          </p>
                          <p className="text-white/60 text-sm mt-0.5 leading-snug">
                            {notification.message}
                          </p>
                        </div>

                        {/* Unread indicator */}
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-[#007AFF] flex-shrink-0 mt-2" />
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}

              {/* Clear All Button */}
              {demoNotifications.length > 0 && (
                <motion.button
                  className="w-full py-3 text-center text-white/40 text-sm font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Effacer toutes les notifications
                </motion.button>
              )}
            </div>

            {/* Drag indicator */}
            <div className="mt-3 flex justify-center">
              <div className="w-10 h-1 rounded-full bg-white/30" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
