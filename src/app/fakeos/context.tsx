"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { type AppConfig } from "./components/apps/AppRegistry";

// Re-export AppConfig for backward compatibility
export type { AppConfig } from "./components/apps/AppRegistry";

// OS Style preference
export type OSStyle = "ios" | "android";

// Recent app type for app switcher
export interface RecentApp {
  app: AppConfig;
  timestamp: number;
  previewData?: {
    title?: string;
    subtitle?: string;
  };
}

export interface FakeOSContextType {
  // App state
  activeApp: AppConfig | null;
  launchApp: (app: AppConfig, iconRect: DOMRect) => void;
  closeApp: () => void;
  iconRect: DOMRect | null;
  isAppOpen: boolean;

  // Recent apps
  recentApps: RecentApp[];
  closeRecentApp: (appId: string) => void;
  clearRecentApps: () => void;

  // UI state
  isLocked: boolean;
  setIsLocked: (locked: boolean) => void;
  isControlCenterOpen: boolean;
  setIsControlCenterOpen: (open: boolean) => void;
  isNotificationCenterOpen: boolean;
  setIsNotificationCenterOpen: (open: boolean) => void;
  isAppSwitcherOpen: boolean;
  setIsAppSwitcherOpen: (open: boolean) => void;

  // AI Assistant
  isAIAssistantOpen: boolean;
  setIsAIAssistantOpen: (open: boolean) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;

  // OS Style preference
  osStyle: OSStyle;
  setOSStyle: (style: OSStyle) => void;
}

// Context
export const FakeOSContext = createContext<FakeOSContextType | null>(null);

export function useFakeOS() {
  const context = useContext(FakeOSContext);
  if (!context) {
    throw new Error("useFakeOS must be used within FakeOSProvider");
  }
  return context;
}
