"use client";

import { useState, useCallback, useEffect, ReactNode } from "react";
import { AnimatePresence } from "framer-motion";
import { type AppConfig } from "./components/apps/AppRegistry";
import { FakeOSContext, type RecentApp, type OSStyle } from "./context";

const OS_STYLE_KEY = "deal-os-style";

// Provider
export default function FakeOSLayout({ children }: { children: ReactNode }) {
  // App state
  const [activeApp, setActiveApp] = useState<AppConfig | null>(null);
  const [iconRect, setIconRect] = useState<DOMRect | null>(null);
  const [isAppOpen, setIsAppOpen] = useState(false);
  const [recentApps, setRecentApps] = useState<RecentApp[]>([]);

  // UI state
  const [isLocked, setIsLocked] = useState(true); // Start locked
  const [isControlCenterOpen, setIsControlCenterOpen] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [isAppSwitcherOpen, setIsAppSwitcherOpen] = useState(false);

  // AI Assistant state
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // OS Style preference
  const [osStyle, setOSStyleState] = useState<OSStyle>("ios");

  // Load OS style preference
  useEffect(() => {
    const saved = localStorage.getItem(OS_STYLE_KEY) as OSStyle | null;
    if (saved && (saved === "ios" || saved === "android")) {
      setOSStyleState(saved);
    }
  }, []);

  const setOSStyle = useCallback((style: OSStyle) => {
    setOSStyleState(style);
    localStorage.setItem(OS_STYLE_KEY, style);
    if (navigator.vibrate) navigator.vibrate(20);
  }, []);

  const launchApp = useCallback((app: AppConfig, rect: DOMRect) => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }

    // Close any open panels
    setIsControlCenterOpen(false);
    setIsNotificationCenterOpen(false);
    setIsAppSwitcherOpen(false);
    setIsAIAssistantOpen(false);

    setIconRect(rect);
    setActiveApp(app);
    setIsAppOpen(true);

    // Add to recent apps (at the beginning, max 5)
    setRecentApps((prev) => {
      const filtered = prev.filter((ra) => ra.app.id !== app.id);
      return [{ app, timestamp: Date.now() }, ...filtered].slice(0, 5);
    });
  }, []);

  const closeApp = useCallback(() => {
    setIsAppOpen(false);
    // Delay clearing active app for exit animation
    setTimeout(() => {
      setActiveApp(null);
      setIconRect(null);
    }, 300);
  }, []);

  const closeRecentApp = useCallback((appId: string) => {
    setRecentApps((prev) => prev.filter((ra) => ra.app.id !== appId));
    // If closing the active app, close it
    if (activeApp?.id === appId) {
      closeApp();
    }
  }, [activeApp, closeApp]);

  const clearRecentApps = useCallback(() => {
    setRecentApps([]);
    if (isAppOpen) {
      closeApp();
    }
  }, [isAppOpen, closeApp]);

  return (
    <FakeOSContext.Provider
      value={{
        activeApp,
        launchApp,
        closeApp,
        iconRect,
        isAppOpen,
        recentApps,
        closeRecentApp,
        clearRecentApps,
        isLocked,
        setIsLocked,
        isControlCenterOpen,
        setIsControlCenterOpen,
        isNotificationCenterOpen,
        setIsNotificationCenterOpen,
        isAppSwitcherOpen,
        setIsAppSwitcherOpen,
        isAIAssistantOpen,
        setIsAIAssistantOpen,
        isListening,
        setIsListening,
        osStyle,
        setOSStyle,
      }}
    >
      <div
        className="fixed inset-0 overflow-hidden select-none"
        style={{
          touchAction: "manipulation",
          WebkitUserSelect: "none",
          userSelect: "none",
          backgroundColor: "#000",
        }}
      >
        {/* Content */}
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
      </div>
    </FakeOSContext.Provider>
  );
}
