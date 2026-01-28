"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, X, Sparkles, Send, Volume2, Loader2 } from "lucide-react";
import { useFakeOS } from "../context";

const suggestions = [
  "Créer un devis pour Dupont SPRL",
  "Afficher mes devis en attente",
  "Quel est mon CA ce mois-ci ?",
  "Ajouter un nouveau client",
];

const waveformBars = 24;

export function AIAssistant() {
  const { isAIAssistantOpen, setIsAIAssistantOpen, isListening, setIsListening, osStyle } = useFakeOS();
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [waveform, setWaveform] = useState<number[]>(Array(waveformBars).fill(0.2));

  // Simulate waveform animation when listening
  useEffect(() => {
    if (!isListening) {
      setWaveform(Array(waveformBars).fill(0.2));
      return;
    }

    const interval = setInterval(() => {
      setWaveform(prev => prev.map(() => 0.2 + Math.random() * 0.8));
    }, 100);

    return () => clearInterval(interval);
  }, [isListening]);

  const handleMicClick = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(30);

    if (isListening) {
      setIsListening(false);
      // Simulate processing
      setIsProcessing(true);
      setTranscript("Créer un devis pour Martin & Fils, rénovation cuisine, 5000 euros");

      setTimeout(() => {
        setIsProcessing(false);
        setResponse("J'ai créé un brouillon de devis pour Martin & Fils d'un montant de 5 000 €. Voulez-vous que je l'ouvre pour vérification ?");
      }, 2000);
    } else {
      setIsListening(true);
      setTranscript("");
      setResponse("");
    }
  }, [isListening, setIsListening]);

  const handleSuggestionClick = (suggestion: string) => {
    if (navigator.vibrate) navigator.vibrate(15);
    setTranscript(suggestion);
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setResponse("Bien sûr ! Je prépare cela pour vous...");
    }, 1500);
  };

  const isIOS = osStyle === "ios";

  return (
    <AnimatePresence>
      {isAIAssistantOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[180]"
            style={{
              background: isIOS
                ? "rgba(0,0,0,0.5)"
                : "rgba(0,0,0,0.7)",
              backdropFilter: "blur(30px)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAIAssistantOpen(false)}
          />

          {/* Assistant Panel */}
          <motion.div
            className="fixed inset-x-0 bottom-0 z-[181]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div
              className={`mx-4 mb-4 overflow-hidden ${
                isIOS
                  ? "rounded-[32px] bg-[#1C1C1E]/95"
                  : "rounded-[28px] bg-[#1E1E2E]/98"
              } backdrop-blur-2xl border border-white/[0.1] shadow-2xl`}
              style={{
                paddingBottom: "max(env(safe-area-inset-bottom), 16px)",
                boxShadow: "0 -20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset"
              }}
            >
              {/* Header */}
              <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <motion.div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                      isIOS
                        ? "bg-gradient-to-br from-[#7B61FF] to-[#FF6B9D]"
                        : "bg-gradient-to-br from-[#8AB4F8] to-[#C58AF9]"
                    }`}
                    animate={{
                      scale: isListening ? [1, 1.1, 1] : 1,
                      rotate: isListening ? [0, 5, -5, 0] : 0
                    }}
                    transition={{ repeat: isListening ? Infinity : 0, duration: 2 }}
                  >
                    <Sparkles className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">Assistant DEAL</h3>
                    <p className="text-white/50 text-xs">
                      {isListening ? "À l'écoute..." : isProcessing ? "Réflexion..." : "Prêt à vous aider"}
                    </p>
                  </div>
                </div>
                <motion.button
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsAIAssistantOpen(false)}
                >
                  <X className="w-4 h-4 text-white/60" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="px-6 py-5 min-h-[200px]">
                {/* Waveform Visualization */}
                {isListening && (
                  <motion.div
                    className="flex items-center justify-center gap-[3px] h-16 mb-6"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    {waveform.map((height, i) => (
                      <motion.div
                        key={i}
                        className={`w-1 rounded-full ${
                          isIOS
                            ? "bg-gradient-to-t from-[#7B61FF] to-[#FF6B9D]"
                            : "bg-gradient-to-t from-[#8AB4F8] to-[#C58AF9]"
                        }`}
                        animate={{ height: `${height * 100}%` }}
                        transition={{ duration: 0.1 }}
                        style={{ minHeight: "8px", maxHeight: "64px" }}
                      />
                    ))}
                  </motion.div>
                )}

                {/* Transcript */}
                {transcript && (
                  <motion.div
                    className="mb-4 p-4 rounded-2xl bg-white/[0.06]"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <p className="text-white/50 text-xs mb-1">Vous avez dit :</p>
                    <p className="text-white font-medium">{transcript}</p>
                  </motion.div>
                )}

                {/* Processing Indicator */}
                {isProcessing && (
                  <motion.div
                    className="flex items-center justify-center gap-2 py-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Loader2 className="w-5 h-5 text-white/50 animate-spin" />
                    <span className="text-white/50 text-sm">Traitement en cours...</span>
                  </motion.div>
                )}

                {/* Response */}
                {response && !isProcessing && (
                  <motion.div
                    className={`p-4 rounded-2xl ${
                      isIOS
                        ? "bg-gradient-to-br from-[#7B61FF]/20 to-[#FF6B9D]/20 border border-[#7B61FF]/30"
                        : "bg-gradient-to-br from-[#8AB4F8]/20 to-[#C58AF9]/20 border border-[#8AB4F8]/30"
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isIOS
                          ? "bg-gradient-to-br from-[#7B61FF] to-[#FF6B9D]"
                          : "bg-gradient-to-br from-[#8AB4F8] to-[#C58AF9]"
                      }`}>
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-white/90 text-[15px] leading-relaxed flex-1">{response}</p>
                    </div>
                  </motion.div>
                )}

                {/* Suggestions */}
                {!isListening && !transcript && (
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <p className="text-white/40 text-xs mb-3">Suggestions :</p>
                    {suggestions.map((suggestion, i) => (
                      <motion.button
                        key={suggestion}
                        className="w-full p-3 rounded-xl bg-white/[0.06] text-left text-white/80 text-sm hover:bg-white/[0.1] transition-colors"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Microphone Button */}
              <div className="px-6 pb-4 flex justify-center">
                <motion.button
                  className={`relative w-16 h-16 rounded-full flex items-center justify-center ${
                    isListening
                      ? isIOS
                        ? "bg-gradient-to-br from-[#FF3B30] to-[#FF6B6B]"
                        : "bg-[#EA4335]"
                      : isIOS
                        ? "bg-gradient-to-br from-[#7B61FF] to-[#FF6B9D]"
                        : "bg-gradient-to-br from-[#8AB4F8] to-[#C58AF9]"
                  }`}
                  style={{
                    boxShadow: isListening
                      ? "0 8px 32px rgba(255,59,48,0.4)"
                      : isIOS
                        ? "0 8px 32px rgba(123,97,255,0.4)"
                        : "0 8px 32px rgba(138,180,248,0.4)"
                  }}
                  whileTap={{ scale: 0.9 }}
                  animate={isListening ? { scale: [1, 1.05, 1] } : {}}
                  transition={isListening ? { repeat: Infinity, duration: 1.5 } : {}}
                  onClick={handleMicClick}
                >
                  {/* Pulse rings when listening */}
                  {isListening && (
                    <>
                      <motion.div
                        className="absolute inset-0 rounded-full bg-white/20"
                        animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      />
                      <motion.div
                        className="absolute inset-0 rounded-full bg-white/20"
                        animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
                      />
                    </>
                  )}
                  {isListening ? (
                    <MicOff className="w-7 h-7 text-white relative z-10" />
                  ) : (
                    <Mic className="w-7 h-7 text-white relative z-10" />
                  )}
                </motion.button>
              </div>

              {/* Hint Text */}
              <p className="text-center text-white/30 text-xs pb-4">
                {isListening ? "Appuyez pour arrêter" : "Appuyez pour parler"}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
