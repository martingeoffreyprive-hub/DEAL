"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { useFakeOS } from "./context";
import { LockScreen, ControlCenter, NotificationCenter } from "./components/shell";
import { AIAssistant } from "./components/AIAssistant";
import { AppWindow } from "./components/apps/AppWindow";
import { AppSwitcher } from "./components/apps/AppSwitcher";
import {
  Search, Mic, Plus, ChevronRight, TrendingUp,
  FileText, Users, BarChart3, Settings, Receipt,
  Clock, CheckCircle, Send, Sparkles, Zap,
  ArrowUpRight, Calendar, Euro, Bell, Apple, Smartphone,
  MessageSquare, PlusCircle, Home, Star, Target,
  Wallet, Calculator, Briefcase, Phone, Mail,
  CreditCard, Percent, Activity, Award, ChevronUp,
  Grid3X3
} from "lucide-react";

// Demo data simulating real dashboard
const dashboardData = {
  userName: "Jean",
  stats: {
    monthlyRevenue: 12450,
    totalQuotes: 24,
    pendingQuotes: 3,
    acceptedQuotes: 18,
    conversionRate: 75,
    avgQuoteValue: 2890,
    weeklyTarget: 15000,
    weeklyAchieved: 9800,
  },
  recentQuotes: [
    { id: "QT-1042", client: "Dupont SPRL", amount: 8500, status: "pending", date: "Aujourd'hui", progress: 75 },
    { id: "QT-1041", client: "Martin & Fils", amount: 3200, status: "accepted", date: "Hier", progress: 100 },
    { id: "QT-1040", client: "Bernard SA", amount: 2100, status: "sent", date: "Il y a 2j", progress: 50 },
  ],
  quickInsights: [
    { label: "Meilleur jour", value: "Mardi", trend: "+23%" },
    { label: "Panier moyen", value: "2 890 €", trend: "+8%" },
    { label: "Temps réponse", value: "2.4h", trend: "-15%" },
  ],
};

// Get greeting based on time
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bonjour";
  if (hour < 18) return "Bon après-midi";
  return "Bonsoir";
}

export default function FakeOSHomePage() {
  const {
    launchApp,
    setIsControlCenterOpen,
    setIsNotificationCenterOpen,
    setIsAIAssistantOpen,
    osStyle,
    setOSStyle,
    isLocked,
    isAppOpen,
    isAppSwitcherOpen,
  } = useFakeOS();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchFocused, setSearchFocused] = useState(false);
  const [showAllApps, setShowAllApps] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollY = useMotionValue(0);

  const isIOS = osStyle === "ios";

  // Scroll tracking
  const headerScale = useTransform(scrollY, [0, 100], [1, 0.9]);
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.7]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    scrollY.set((e.target as HTMLDivElement).scrollTop);
  }, [scrollY]);

  const formattedTime = currentTime.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedDate = currentTime.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const handleAppClick = useCallback((appId: string, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
    launchApp({
      id: appId,
      name: appId,
      icon: "FileText",
      color: "#E85A5A",
      href: `/${appId}`,
      category: "main",
    }, rect);
  }, [launchApp]);

  // Premium app definitions with iOS/Android specific gradients
  const premiumApps = [
    {
      id: "new-quote",
      name: "Nouveau",
      gradient: isIOS ? "from-[#FF6B6B] to-[#EE5A5A]" : "from-[#F44336] to-[#E91E63]",
      icon: PlusCircle,
      badge: null,
    },
    {
      id: "quotes",
      name: "Devis",
      gradient: isIOS ? "from-[#007AFF] to-[#5AC8FA]" : "from-[#2196F3] to-[#03A9F4]",
      icon: FileText,
      badge: 3,
    },
    {
      id: "clients",
      name: "Clients",
      gradient: isIOS ? "from-[#34C759] to-[#30D158]" : "from-[#4CAF50] to-[#8BC34A]",
      icon: Users,
      badge: null,
    },
    {
      id: "invoices",
      name: "Factures",
      gradient: isIOS ? "from-[#FF9500] to-[#FFCC00]" : "from-[#FF9800] to-[#FFC107]",
      icon: Receipt,
      badge: 2,
    },
    {
      id: "analytics",
      name: "Stats",
      gradient: isIOS ? "from-[#AF52DE] to-[#5856D6]" : "from-[#9C27B0] to-[#673AB7]",
      icon: BarChart3,
      badge: null,
    },
    {
      id: "settings",
      name: "Réglages",
      gradient: isIOS ? "from-[#8E8E93] to-[#636366]" : "from-[#607D8B] to-[#455A64]",
      icon: Settings,
      badge: null,
    },
  ];

  // Additional apps
  const secondaryApps = [
    { id: "wallet", name: "Paiements", gradient: isIOS ? "from-[#FF2D55] to-[#FF375F]" : "from-[#E91E63] to-[#AD1457]", icon: Wallet },
    { id: "calculator", name: "Calcul", gradient: isIOS ? "from-[#636366] to-[#48484A]" : "from-[#424242] to-[#212121]", icon: Calculator },
    { id: "calendar", name: "Agenda", gradient: isIOS ? "from-[#FF3B30] to-[#FF453A]" : "from-[#f44336] to-[#d32f2f]", icon: Calendar },
    { id: "contacts", name: "Contacts", gradient: isIOS ? "from-[#5856D6] to-[#AF52DE]" : "from-[#3F51B5] to-[#7C4DFF]", icon: Phone },
  ];

  // Progress percentage for weekly target
  const targetProgress = (dashboardData.stats.weeklyAchieved / dashboardData.stats.weeklyTarget) * 100;

  return (
    <div className="relative h-full flex flex-col overflow-hidden bg-black">
      {/* Lock Screen */}
      <LockScreen />

      {/* App Window */}
      <AppWindow />

      {/* App Switcher */}
      <AppSwitcher />

      {/* Premium Animated Wallpaper */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: isIOS
              ? "linear-gradient(180deg, #000000 0%, #0a0a1f 30%, #111133 70%, #0f0f2d 100%)"
              : "linear-gradient(180deg, #0a0a0a 0%, #151520 30%, #1a1a2e 70%, #0f0f1a 100%)"
          }}
        />

        {/* Animated noise texture */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Gradient Orbs - iOS style */}
        {isIOS && (
          <>
            <motion.div
              className="absolute w-[800px] h-[800px] rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(0,122,255,0.35) 0%, rgba(0,122,255,0.1) 40%, transparent 70%)",
                top: "-300px",
                right: "-300px",
                filter: "blur(60px)",
              }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.4, 0.3],
                rotate: [0, 10, 0],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute w-[600px] h-[600px] rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(175,82,222,0.35) 0%, rgba(175,82,222,0.1) 40%, transparent 70%)",
                bottom: "-200px",
                left: "-200px",
                filter: "blur(60px)",
              }}
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.25, 0.35, 0.25],
                rotate: [0, -10, 0],
              }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 3 }}
            />
            <motion.div
              className="absolute w-[400px] h-[400px] rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(52,199,89,0.2) 0%, transparent 60%)",
                top: "40%",
                left: "50%",
                transform: "translateX(-50%)",
                filter: "blur(80px)",
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.15, 0.25, 0.15],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 5 }}
            />
          </>
        )}

        {/* Gradient Orbs - Android style */}
        {!isIOS && (
          <>
            <motion.div
              className="absolute w-[700px] h-[700px] rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(139,92,246,0.4) 0%, rgba(139,92,246,0.1) 40%, transparent 65%)",
                top: "-250px",
                right: "-250px",
                filter: "blur(80px)",
              }}
              animate={{
                scale: [1, 1.15, 1],
                rotate: [0, 15, 0],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute w-[500px] h-[500px] rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(244,114,182,0.35) 0%, rgba(244,114,182,0.1) 40%, transparent 65%)",
                bottom: "-150px",
                left: "-150px",
                filter: "blur(70px)",
              }}
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, -15, 0],
              }}
              transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 4 }}
            />
            <motion.div
              className="absolute w-[350px] h-[350px] rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(56,189,248,0.25) 0%, transparent 60%)",
                top: "50%",
                right: "20%",
                filter: "blur(60px)",
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />
          </>
        )}
      </div>

      {/* Status Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-50 px-6 pt-3 pb-2 flex items-center justify-between"
        style={{ paddingTop: "max(env(safe-area-inset-top), 12px)" }}
      >
        <motion.button
          className="flex items-center gap-2"
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (navigator.vibrate) navigator.vibrate(15);
            setIsNotificationCenterOpen(true);
          }}
        >
          <span className="text-white font-semibold text-[15px]">{formattedTime}</span>
          <div className="relative">
            <Bell className="w-4 h-4 text-white/70" />
            <motion.span
              className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.button>

        {/* Dynamic Island / Notch */}
        {isIOS ? (
          <motion.div
            className="px-5 py-1.5 bg-black rounded-[20px] flex items-center gap-2 border border-white/[0.05]"
            whileTap={{ scale: 0.97 }}
            style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}
          >
            <motion.div
              className="w-2.5 h-2.5 rounded-full bg-green-500"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-white/70 text-xs font-semibold">Pro</span>
          </motion.div>
        ) : (
          <motion.div
            className="px-3 py-1 bg-white/[0.08] rounded-full border border-white/[0.05]"
            whileTap={{ scale: 0.97 }}
          >
            <span className="text-white/60 text-xs font-medium tracking-wide">DEAL Pro</span>
          </motion.div>
        )}

        <motion.button
          className="flex items-center gap-2"
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (navigator.vibrate) navigator.vibrate(15);
            setIsControlCenterOpen(true);
          }}
        >
          <div className="flex items-end gap-[2px]">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-[3px] bg-white rounded-sm" style={{ height: `${i * 3}px` }} />
            ))}
          </div>
          <div className="flex items-center">
            <div className="w-6 h-3 rounded-sm border border-white/80 p-[2px]">
              <motion.div
                className="h-full bg-green-400 rounded-[1px]"
                initial={{ width: "0%" }}
                animate={{ width: "75%" }}
                transition={{ delay: 0.5, duration: 1 }}
              />
            </div>
            <div className="w-[2px] h-1.5 bg-white/80 rounded-r-sm ml-[1px]" />
          </div>
        </motion.button>
      </motion.div>

      {/* Main Content */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden px-5 pb-36 scroll-smooth"
        style={{ scrollbarWidth: "none" }}
        onScroll={handleScroll}
      >
        {/* Date & Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4 mb-5"
          style={{ scale: headerScale, opacity: headerOpacity }}
        >
          <p className="text-white/50 text-sm font-medium capitalize">{formattedDate}</p>
          <h1 className="text-white text-3xl font-bold mt-1 flex items-center gap-2">
            {getGreeting()}, {dashboardData.userName}
            <motion.span
              animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
              transition={{ duration: 2, delay: 1, repeat: Infinity, repeatDelay: 5 }}
            >
              👋
            </motion.span>
          </h1>
        </motion.div>

        {/* OS Style Switcher - Minimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="mb-4"
        >
          <div className={`p-1 rounded-2xl ${isIOS ? "bg-white/[0.06]" : "bg-white/[0.04]"} backdrop-blur-xl border border-white/[0.04]`}>
            <div className="flex">
              <motion.button
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition-all ${
                  isIOS ? "bg-white/[0.12] text-white shadow-lg" : "text-white/40"
                }`}
                onClick={() => {
                  if (navigator.vibrate) navigator.vibrate(20);
                  setOSStyle("ios");
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Apple className="w-4 h-4" />
                <span className="text-sm font-medium">iOS</span>
              </motion.button>
              <motion.button
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition-all ${
                  !isIOS ? "bg-white/[0.12] text-white shadow-lg" : "text-white/40"
                }`}
                onClick={() => {
                  if (navigator.vibrate) navigator.vibrate(20);
                  setOSStyle("android");
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Smartphone className="w-4 h-4" />
                <span className="text-sm font-medium">Android</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Revenue + Target Widget - Premium Glass Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-4"
        >
          <div
            className={`relative overflow-hidden p-5 backdrop-blur-2xl border border-white/[0.06] ${
              isIOS ? "rounded-[28px] bg-white/[0.08]" : "rounded-3xl bg-white/[0.06]"
            }`}
            style={{
              boxShadow: isIOS
                ? "0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)"
                : "0 8px 32px rgba(0,0,0,0.3)"
            }}
          >
            {/* Background accent */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#E85A5A]/20 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-2xl" />

            <div className="relative">
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isIOS ? "bg-white/[0.1]" : "bg-white/[0.08]"}`}>
                      <Euro className="w-4 h-4 text-white/70" />
                    </div>
                    <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">
                      Chiffre d'affaires
                    </p>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <motion.span
                      className="text-white text-4xl font-bold tracking-tight"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {dashboardData.stats.monthlyRevenue.toLocaleString("fr-FR")}
                    </motion.span>
                    <span className="text-white/40 text-xl font-light">€</span>
                  </div>
                </div>
                <motion.div
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 rounded-full border border-green-500/20"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-green-400 text-xs font-bold">+18%</span>
                </motion.div>
              </div>

              {/* Weekly Target Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/50 text-xs font-medium">Objectif semaine</span>
                  <span className="text-white/70 text-xs font-semibold">
                    {dashboardData.stats.weeklyAchieved.toLocaleString()} / {dashboardData.stats.weeklyTarget.toLocaleString()} €
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.08] overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      isIOS
                        ? "bg-gradient-to-r from-[#007AFF] to-[#5AC8FA]"
                        : "bg-gradient-to-r from-[#8AB4F8] to-[#C58AF9]"
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${targetProgress}%` }}
                    transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Mini chart */}
              <div className="flex items-end gap-1 h-12">
                {[35, 50, 45, 65, 55, 80, 70, 90, 85, 100, 95, 75].map((h, i) => (
                  <motion.div
                    key={i}
                    className={`flex-1 rounded-t-sm ${
                      i === 11
                        ? isIOS
                          ? "bg-[#007AFF]"
                          : "bg-[#8AB4F8]"
                        : isIOS
                          ? "bg-gradient-to-t from-[#007AFF]/30 to-[#007AFF]/60"
                          : "bg-gradient-to-t from-[#8AB4F8]/30 to-[#8AB4F8]/60"
                    }`}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 0.4 + i * 0.03, duration: 0.4 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-2.5 mb-4"
        >
          {[
            { icon: Target, label: "Conversion", value: `${dashboardData.stats.conversionRate}%`, color: isIOS ? "#34C759" : "#34A853" },
            { icon: Clock, label: "En attente", value: dashboardData.stats.pendingQuotes.toString(), color: isIOS ? "#FF9500" : "#FBBC04" },
            { icon: CheckCircle, label: "Acceptés", value: dashboardData.stats.acceptedQuotes.toString(), color: isIOS ? "#007AFF" : "#4285F4" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className={`relative overflow-hidden p-3.5 backdrop-blur-xl border border-white/[0.04] ${
                isIOS ? "rounded-2xl bg-white/[0.07]" : "rounded-xl bg-white/[0.05]"
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 + i * 0.05 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: stat.color }} />
              <stat.icon className="w-4 h-4 mb-1.5" style={{ color: stat.color }} />
              <p className="text-white text-xl font-bold leading-tight">{stat.value}</p>
              <p className="text-white/40 text-[10px] font-medium mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* AI Assistant Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-4"
        >
          <motion.button
            className={`w-full relative overflow-hidden p-4 backdrop-blur-2xl border border-white/[0.08] ${
              isIOS
                ? "rounded-[24px] bg-gradient-to-br from-[#5856D6]/20 to-[#AF52DE]/20"
                : "rounded-3xl bg-gradient-to-br from-[#8AB4F8]/15 to-[#C58AF9]/15"
            }`}
            style={{
              boxShadow: isIOS
                ? "0 8px 32px rgba(88,86,214,0.2), inset 0 1px 0 rgba(255,255,255,0.03)"
                : "0 8px 32px rgba(138,180,248,0.15)"
            }}
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate([15, 30, 15]);
              setIsAIAssistantOpen(true);
            }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            />

            <div className="relative flex items-center gap-4">
              <motion.div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  isIOS
                    ? "bg-gradient-to-br from-[#5856D6] to-[#AF52DE]"
                    : "bg-gradient-to-br from-[#8AB4F8] to-[#C58AF9]"
                }`}
                style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}
                animate={{ rotate: [0, 3, -3, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
              <div className="flex-1 text-left">
                <h3 className="text-white font-bold text-base">Assistant IA</h3>
                <p className="text-white/50 text-xs">« Créer un devis pour... »</p>
              </div>
              <motion.div
                className="w-10 h-10 rounded-full bg-white/[0.08] flex items-center justify-center border border-white/[0.05]"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Mic className="w-5 h-5 text-white/70" />
              </motion.div>
            </div>
          </motion.button>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-4"
        >
          <motion.div
            className={`relative backdrop-blur-xl border transition-all duration-300 ${
              searchFocused
                ? isIOS
                  ? "bg-white/[0.14] border-[#007AFF]/40 shadow-lg shadow-[#007AFF]/10"
                  : "bg-white/[0.1] border-[#8AB4F8]/40 shadow-lg shadow-[#8AB4F8]/10"
                : "bg-white/[0.06] border-white/[0.04]"
            } ${isIOS ? "rounded-2xl" : "rounded-xl"}`}
          >
            <div className="flex items-center px-4 py-3 gap-3">
              <Search className={`w-5 h-5 transition-colors ${searchFocused ? (isIOS ? "text-[#007AFF]" : "text-[#8AB4F8]") : "text-white/40"}`} />
              <input
                type="text"
                placeholder="Rechercher devis, clients..."
                className="flex-1 bg-transparent text-white placeholder-white/40 text-[15px] outline-none"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Quick Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.33 }}
          className="mb-5"
        >
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {dashboardData.quickInsights.map((insight, i) => (
              <motion.div
                key={insight.label}
                className={`flex-shrink-0 px-4 py-2.5 backdrop-blur-xl border border-white/[0.04] ${
                  isIOS ? "rounded-2xl bg-white/[0.06]" : "rounded-xl bg-white/[0.04]"
                }`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.05 }}
              >
                <p className="text-white/40 text-[10px] font-medium">{insight.label}</p>
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold text-sm">{insight.value}</span>
                  <span className={`text-[10px] font-bold ${insight.trend.startsWith("+") ? "text-green-400" : "text-amber-400"}`}>
                    {insight.trend}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Quotes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-5"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-bold text-base">Devis récents</h2>
            <motion.button
              className="flex items-center gap-1 text-white/50 text-sm"
              whileTap={{ scale: 0.95 }}
            >
              Voir tout <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>

          <div className="space-y-2">
            {dashboardData.recentQuotes.map((quote, i) => (
              <motion.div
                key={quote.id}
                className={`flex items-center gap-3 p-3.5 backdrop-blur-xl border border-white/[0.03] ${
                  isIOS ? "rounded-2xl bg-white/[0.06]" : "rounded-xl bg-white/[0.04]"
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  quote.status === "accepted" ? "bg-green-500/20" :
                  quote.status === "pending" ? "bg-amber-500/20" : "bg-blue-500/20"
                }`}>
                  {quote.status === "accepted" ? <CheckCircle className="w-5 h-5 text-green-400" /> :
                   quote.status === "pending" ? <Clock className="w-5 h-5 text-amber-400" /> :
                   <Send className="w-5 h-5 text-blue-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{quote.client}</p>
                  <p className="text-white/40 text-xs">{quote.id} • {quote.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-sm">{quote.amount.toLocaleString("fr-FR")} €</p>
                  {/* Mini progress bar */}
                  <div className="w-12 h-1 rounded-full bg-white/[0.1] mt-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        quote.status === "accepted" ? "bg-green-500" :
                        quote.status === "pending" ? "bg-amber-500" : "bg-blue-500"
                      }`}
                      style={{ width: `${quote.progress}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* App Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mb-5"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-bold text-base">Applications</h2>
            <motion.button
              className="flex items-center gap-1 text-white/50 text-xs"
              onClick={() => setShowAllApps(!showAllApps)}
              whileTap={{ scale: 0.95 }}
            >
              {showAllApps ? "Moins" : "Plus"} <ChevronUp className={`w-3.5 h-3.5 transition-transform ${showAllApps ? "" : "rotate-180"}`} />
            </motion.button>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {premiumApps.map((app, i) => (
              <motion.button
                key={app.id}
                className="flex flex-col items-center gap-1.5"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.03, type: "spring", stiffness: 400 }}
                whileTap={{ scale: 0.85 }}
                onClick={(e) => handleAppClick(app.id, e)}
              >
                <div className="relative">
                  <div
                    className={`w-[60px] h-[60px] bg-gradient-to-br ${app.gradient} flex items-center justify-center ${
                      isIOS ? "rounded-[15px]" : "rounded-2xl"
                    }`}
                    style={{
                      boxShadow: "0 8px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)"
                    }}
                  >
                    <app.icon className="w-7 h-7 text-white" strokeWidth={1.8} />
                  </div>
                  {app.badge && (
                    <motion.div
                      className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center border-2 border-black ${
                        isIOS ? "bg-red-500 rounded-full" : "bg-[#EA4335] rounded-[4px]"
                      }`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.7 + i * 0.03, type: "spring" }}
                    >
                      <span className="text-white text-[10px] font-bold">{app.badge}</span>
                    </motion.div>
                  )}
                </div>
                <span className="text-white/70 text-[11px] font-medium">{app.name}</span>
              </motion.button>
            ))}
          </div>

          {/* Secondary Apps */}
          <AnimatePresence>
            {showAllApps && (
              <motion.div
                className="grid grid-cols-4 gap-4 mt-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                {secondaryApps.map((app, i) => (
                  <motion.button
                    key={app.id}
                    className="flex flex-col items-center gap-1.5"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    whileTap={{ scale: 0.85 }}
                    onClick={(e) => handleAppClick(app.id, e)}
                  >
                    <div
                      className={`w-[60px] h-[60px] bg-gradient-to-br ${app.gradient} flex items-center justify-center ${
                        isIOS ? "rounded-[15px]" : "rounded-2xl"
                      }`}
                      style={{
                        boxShadow: "0 8px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)"
                      }}
                    >
                      <app.icon className="w-7 h-7 text-white" strokeWidth={1.8} />
                    </div>
                    <span className="text-white/70 text-[11px] font-medium">{app.name}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Bottom Dock */}
      <div
        className="absolute bottom-0 left-0 right-0 px-4 pb-2 pt-8 pointer-events-none"
        style={{
          paddingBottom: "max(env(safe-area-inset-bottom), 8px)",
          background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 50%, transparent 100%)"
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`pointer-events-auto flex items-center justify-around py-2.5 px-4 backdrop-blur-2xl border border-white/[0.06] ${
            isIOS
              ? "rounded-[26px] bg-white/[0.1]"
              : "rounded-3xl bg-white/[0.08]"
          }`}
          style={{ boxShadow: "0 -4px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)" }}
        >
          {[
            { icon: Home, label: "Accueil", active: true },
            { icon: FileText, label: "Devis", active: false },
            { icon: Plus, label: "Créer", accent: true },
            { icon: BarChart3, label: "Stats", active: false },
            { icon: Grid3X3, label: "Plus", active: false },
          ].map((item) => (
            <motion.button
              key={item.label}
              className="flex flex-col items-center gap-0.5 px-2"
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(10);
              }}
            >
              {item.accent ? (
                <div
                  className={`w-12 h-12 -mt-7 rounded-full flex items-center justify-center ${
                    isIOS
                      ? "bg-gradient-to-br from-[#007AFF] to-[#5AC8FA]"
                      : "bg-gradient-to-br from-[#8AB4F8] to-[#C58AF9]"
                  }`}
                  style={{
                    boxShadow: isIOS
                      ? "0 8px 20px rgba(0,122,255,0.4)"
                      : "0 8px 20px rgba(138,180,248,0.4)"
                  }}
                >
                  <item.icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
              ) : (
                <>
                  <item.icon
                    className={`w-6 h-6 ${
                      item.active
                        ? isIOS ? "text-[#007AFF]" : "text-[#8AB4F8]"
                        : "text-white/40"
                    }`}
                    strokeWidth={item.active ? 2 : 1.5}
                  />
                  <span className={`text-[10px] font-medium ${
                    item.active
                      ? isIOS ? "text-[#007AFF]" : "text-[#8AB4F8]"
                      : "text-white/40"
                  }`}>
                    {item.label}
                  </span>
                </>
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* Home Indicator */}
        <div className="mt-2 flex justify-center">
          <div className={`w-32 h-1 rounded-full ${isIOS ? "bg-white/30" : "bg-white/20"}`} />
        </div>
      </div>

      {/* Control Center */}
      <ControlCenter />

      {/* Notification Center */}
      <NotificationCenter />

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  );
}
