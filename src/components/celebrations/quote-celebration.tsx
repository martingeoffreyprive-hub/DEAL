"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { PartyPopper, Trophy, Star, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocaleContext } from "@/contexts/locale-context";

interface Confetti {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  delay: number;
}

interface QuoteCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  quoteAmount?: number;
  clientName?: string;
  isFirstQuote?: boolean;
  milestoneReached?: "10" | "25" | "50" | "100" | null;
}

const CONFETTI_COLORS = [
  "#E85A5A", // DEAL Coral
  "#252B4A", // DEAL Navy
  "#FFD700", // Gold
  "#10B981", // Green success
  "#8B5CF6", // Purple
  "#F97316", // Orange
];

const CELEBRATION_MESSAGES = {
  default: {
    title: "Devis accepté !",
    subtitle: "Félicitations, votre client a signé",
  },
  firstQuote: {
    title: "Premier devis signé !",
    subtitle: "C'est le début d'une belle aventure",
  },
  milestone10: {
    title: "10 devis signés !",
    subtitle: "Vous êtes sur la bonne voie",
  },
  milestone25: {
    title: "25 devis signés !",
    subtitle: "Impressionnant ! Continuez comme ça",
  },
  milestone50: {
    title: "50 devis signés !",
    subtitle: "Vous êtes un pro de DEAL",
  },
  milestone100: {
    title: "100 devis signés !",
    subtitle: "Légende ! Vous êtes un expert",
  },
};

export function QuoteCelebration({
  isOpen,
  onClose,
  quoteAmount,
  clientName,
  isFirstQuote = false,
  milestoneReached = null,
}: QuoteCelebrationProps) {
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const [mounted, setMounted] = useState(false);
  const { formatCurrency } = useLocaleContext();

  // Generate confetti particles
  const generateConfetti = useCallback(() => {
    const particles: Confetti[] = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 20,
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        delay: Math.random() * 0.5,
      });
    }
    setConfetti(particles);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      generateConfetti();
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 200]);
      }
    }
  }, [isOpen, generateConfetti]);

  // Get celebration message
  const getMessage = () => {
    if (isFirstQuote) return CELEBRATION_MESSAGES.firstQuote;
    if (milestoneReached === "10") return CELEBRATION_MESSAGES.milestone10;
    if (milestoneReached === "25") return CELEBRATION_MESSAGES.milestone25;
    if (milestoneReached === "50") return CELEBRATION_MESSAGES.milestone50;
    if (milestoneReached === "100") return CELEBRATION_MESSAGES.milestone100;
    return CELEBRATION_MESSAGES.default;
  };

  const message = getMessage();
  const isMilestone = isFirstQuote || milestoneReached;

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Confetti Layer */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {confetti.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute w-3 h-3"
                style={{
                  left: `${particle.x}%`,
                  backgroundColor: particle.color,
                  borderRadius: Math.random() > 0.5 ? "50%" : "0",
                }}
                initial={{
                  y: `${particle.y}vh`,
                  rotate: 0,
                  scale: particle.scale,
                }}
                animate={{
                  y: "110vh",
                  rotate: particle.rotation + 720,
                  x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  delay: particle.delay,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>

          {/* Celebration Card */}
          <motion.div
            className="relative z-10 w-full max-w-md mx-4"
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
              {/* Header with gradient */}
              <div className="relative bg-gradient-to-br from-[#E85A5A] to-[#D14949] p-8 text-white text-center">
                {/* Animated stars background */}
                <div className="absolute inset-0 overflow-hidden">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute"
                      style={{
                        left: `${20 + i * 15}%`,
                        top: `${20 + (i % 3) * 20}%`,
                      }}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0.8, 0.3],
                        rotate: [0, 180, 360],
                      }}
                      transition={{
                        duration: 2,
                        delay: i * 0.2,
                        repeat: Infinity,
                      }}
                    >
                      <Star className="w-4 h-4 fill-white/30 text-white/30" />
                    </motion.div>
                  ))}
                </div>

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Icon */}
                <motion.div
                  className="relative mx-auto w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-4"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  {isMilestone ? (
                    <Trophy className="w-10 h-10 text-yellow-300" />
                  ) : (
                    <PartyPopper className="w-10 h-10" />
                  )}
                </motion.div>

                {/* Title */}
                <motion.h2
                  className="text-2xl font-bold mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {message.title}
                </motion.h2>
                <motion.p
                  className="text-white/80"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {message.subtitle}
                </motion.p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Amount */}
                {quoteAmount && (
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <p className="text-sm text-muted-foreground mb-1">Montant du devis</p>
                    <p className="text-4xl font-bold text-[#E85A5A]">
                      {formatCurrency(quoteAmount)}
                    </p>
                  </motion.div>
                )}

                {/* Client name */}
                {clientName && (
                  <motion.div
                    className="text-center py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <p className="text-sm text-muted-foreground">Client</p>
                    <p className="font-semibold text-lg">{clientName}</p>
                  </motion.div>
                )}

                {/* Milestone badge */}
                {isMilestone && (
                  <motion.div
                    className="flex items-center justify-center gap-2 py-2"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, type: "spring" }}
                  >
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                      {isFirstQuote ? "Premier succès !" : `Milestone ${milestoneReached} atteint !`}
                    </span>
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                  </motion.div>
                )}

                {/* Action button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Button
                    onClick={onClose}
                    className="w-full bg-[#252B4A] hover:bg-[#1a1f35] text-white"
                    size="lg"
                  >
                    Continuer
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

// Hook to trigger celebration
export function useCelebration() {
  const [celebrationState, setCelebrationState] = useState<{
    isOpen: boolean;
    quoteAmount?: number;
    clientName?: string;
    isFirstQuote?: boolean;
    milestoneReached?: "10" | "25" | "50" | "100" | null;
  }>({
    isOpen: false,
  });

  const celebrate = useCallback((options: Omit<typeof celebrationState, "isOpen">) => {
    setCelebrationState({
      isOpen: true,
      ...options,
    });
  }, []);

  const closeCelebration = useCallback(() => {
    setCelebrationState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    ...celebrationState,
    celebrate,
    closeCelebration,
  };
}
