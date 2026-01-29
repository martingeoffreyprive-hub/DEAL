"use client";

/**
 * Feedback Widget — Beta User Feedback Loop
 * Sprint 17 — Story 9-5
 *
 * In-app feedback form with NPS survey, bug reports, and feature requests.
 */

import { useState } from "react";
import { MessageSquare, Bug, Lightbulb, Star, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// Types
// ============================================================================

export type FeedbackType = "general" | "bug" | "feature" | "nps";

export interface FeedbackData {
  type: FeedbackType;
  message: string;
  npsScore?: number;
  email?: string;
  page?: string;
  userAgent?: string;
  timestamp: string;
}

// ============================================================================
// NPS Survey Component
// ============================================================================

function NPSSurvey({
  score,
  onScoreChange,
}: {
  score: number | null;
  onScoreChange: (score: number) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">
        Recommanderiez-vous DEAL à un collègue ?
      </p>
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <button
            key={n}
            onClick={() => onScoreChange(n)}
            className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
              score === n
                ? "bg-[#C9A962] text-[#0D1B2A]"
                : "bg-gray-100 hover:bg-gray-200 text-gray-600"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-400">
        <span>Pas du tout</span>
        <span>Absolument</span>
      </div>
    </div>
  );
}

// ============================================================================
// Feedback Widget
// ============================================================================

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("general");
  const [message, setMessage] = useState("");
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const feedbackTypes = [
    { value: "general" as const, label: "Feedback", icon: MessageSquare },
    { value: "bug" as const, label: "Bug", icon: Bug },
    { value: "feature" as const, label: "Idée", icon: Lightbulb },
    { value: "nps" as const, label: "Note", icon: Star },
  ];

  async function handleSubmit() {
    if (!message.trim() && type !== "nps") return;
    if (type === "nps" && npsScore === null) return;

    setIsSubmitting(true);

    const feedback: FeedbackData = {
      type,
      message: message.trim(),
      npsScore: type === "nps" ? npsScore ?? undefined : undefined,
      page: typeof window !== "undefined" ? window.location.pathname : undefined,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      timestamp: new Date().toISOString(),
    };

    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedback),
      });
    } catch {
      // Silent fail — feedback should never block UX
    }

    setSubmitted(true);
    setIsSubmitting(false);

    setTimeout(() => {
      setIsOpen(false);
      setSubmitted(false);
      setMessage("");
      setNpsScore(null);
      setType("general");
    }, 2000);
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-[#0D1B2A] text-white shadow-lg hover:bg-[#1E3A5F] transition-colors"
        aria-label="Donner un feedback"
      >
        <MessageSquare className="h-5 w-5" />
      </button>

      {/* Feedback panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-6 z-50 w-80 bg-white rounded-xl shadow-2xl border overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-[#0D1B2A] text-white">
              <h3 className="font-semibold text-sm">Votre avis compte</h3>
              <button onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>

            {submitted ? (
              <div className="p-6 text-center">
                <div className="text-3xl mb-2">🎉</div>
                <p className="font-medium">Merci pour votre feedback !</p>
                <p className="text-sm text-gray-500 mt-1">
                  Votre retour nous aide à améliorer DEAL.
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {/* Type selector */}
                <div className="flex gap-2">
                  {feedbackTypes.map((ft) => (
                    <button
                      key={ft.value}
                      onClick={() => setType(ft.value)}
                      className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition-colors ${
                        type === ft.value
                          ? "bg-[#C9A962]/10 text-[#0D1B2A] border border-[#C9A962]"
                          : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      <ft.icon className="h-4 w-4" />
                      {ft.label}
                    </button>
                  ))}
                </div>

                {/* NPS Survey */}
                {type === "nps" && (
                  <NPSSurvey score={npsScore} onScoreChange={setNpsScore} />
                )}

                {/* Message textarea */}
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    type === "bug"
                      ? "Décrivez le problème rencontré..."
                      : type === "feature"
                        ? "Décrivez la fonctionnalité souhaitée..."
                        : type === "nps"
                          ? "Un commentaire ? (optionnel)"
                          : "Partagez votre feedback..."
                  }
                  className="w-full h-24 p-3 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#C9A962]"
                />

                {/* Submit */}
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || (!message.trim() && type !== "nps") || (type === "nps" && npsScore === null)}
                  className="w-full bg-[#C9A962] text-[#0D1B2A] hover:bg-[#C9A962]/90"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Envoi..." : "Envoyer"}
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
