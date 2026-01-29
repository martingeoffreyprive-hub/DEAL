"use client";

import { useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

export type VoiceState = "idle" | "listening" | "speaking";

interface VoiceVisualizerProps {
    state: VoiceState;
    barCount?: number;
    className?: string;
}

export function VoiceVisualizer({ state, barCount = 40, className }: VoiceVisualizerProps) {
    const barsRef = useRef<HTMLDivElement[]>([]);
    const frameRef = useRef<number>();

  const animate = useCallback(() => {
        const now = Date.now();
        barsRef.current.forEach((bar, i) => {
                if (!bar) return;
                let h: number;
                switch (state) {
                  case "idle":
                              h = 3 + Math.sin(now * 0.002 + i * 0.3) * 3;
                              break;
                  case "listening":
                              h = 4 + Math.random() * 36;
                              break;
                  case "speaking":
                              h = 6 + Math.sin(now * 0.005 + i * 0.4) * 18 + Math.random() * 8;
                              break;
                }
                bar.style.height = `${h}px`;
        });
        frameRef.current = requestAnimationFrame(animate);
  }, [state]);

  useEffect(() => {
        frameRef.current = requestAnimationFrame(animate);
        return () => {
                if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
  }, [animate]);

  const barColorClass = {
        idle: "bg-muted-foreground/30",
        listening: "bg-gradient-to-t from-red-500 to-orange-400",
        speaking: "bg-gradient-to-t from-blue-500 to-purple-500",
  }[state];

  const label = {
        idle: "COPILOTE EN VEILLE",
        listening: "ECOUTE EN COURS...",
        speaking: "DEAL REPOND...",
  }[state];

  return (
        <div className={cn("flex flex-col items-center gap-2 py-4 px-5 border-t border-border/50", className)}>
                <div className="w-full h-[60px] flex items-center justify-center gap-[3px]">
                  {Array.from({ length: barCount }).map((_, i) => (
                    <div
                                  key={i}
                                  ref={(el) => { if (el) barsRef.current[i] = el; }}
                                  className={cn("w-[3px] rounded-full transition-[height] duration-100", barColorClass)}
                                  style={{ height: "4px" }}
                                />
                  ))}
                </div>div>
              <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                {label}
              </span>span>
        </div>div>
      );
}</div>
