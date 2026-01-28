"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

export type UIMode = "classic" | "fakeos";

interface UIModeContextType {
  mode: UIMode;
  setMode: (mode: UIMode) => void;
  toggleMode: () => void;
  isLoaded: boolean;
}

const UIModeContext = createContext<UIModeContextType | null>(null);

const STORAGE_KEY = "deal-ui-mode";

export function UIModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<UIMode>("classic");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved preference on mount
  useEffect(() => {
    const savedMode = localStorage.getItem(STORAGE_KEY) as UIMode | null;
    if (savedMode && (savedMode === "classic" || savedMode === "fakeos")) {
      setModeState(savedMode);
    }
    setIsLoaded(true);
  }, []);

  // Check URL parameter for mode override
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlMode = params.get("ui") as UIMode | null;
      if (urlMode && (urlMode === "classic" || urlMode === "fakeos")) {
        setModeState(urlMode);
        // Don't save URL override to localStorage
      }
    }
  }, []);

  const setMode = useCallback((newMode: UIMode) => {
    setModeState(newMode);
    localStorage.setItem(STORAGE_KEY, newMode);

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === "classic" ? "fakeos" : "classic");
  }, [mode, setMode]);

  return (
    <UIModeContext.Provider value={{ mode, setMode, toggleMode, isLoaded }}>
      {children}
    </UIModeContext.Provider>
  );
}

export function useUIMode() {
  const context = useContext(UIModeContext);
  if (!context) {
    throw new Error("useUIMode must be used within UIModeProvider");
  }
  return context;
}

// Helper hook to check if we're in Fake OS mode
export function useFakeOSMode() {
  const { mode, isLoaded } = useUIMode();
  return { isFakeOS: mode === "fakeos", isLoaded };
}
