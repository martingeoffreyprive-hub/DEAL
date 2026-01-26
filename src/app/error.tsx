"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DealLogo, DealIconD } from "@/components/brand";
import { motion } from "framer-motion";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0D1B2A] via-[#1E3A5F] to-[#0D1B2A]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6 px-4"
      >
        {/* Logo with Error Icon */}
        <motion.div
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="flex justify-center"
        >
          <div className="relative">
            <DealIconD size="2xl" variant="white" />
            <div className="absolute -bottom-2 -right-2 p-2 rounded-full bg-red-500/20">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Une erreur s'est produite
          </h1>
          <p className="text-gray-400 max-w-md mx-auto">
            Nous sommes désolés, quelque chose s'est mal passé. Veuillez réessayer
            ou contacter le support si le problème persiste.
          </p>
          {error.digest && (
            <p className="text-xs text-gray-500 font-mono mt-4 p-2 rounded bg-white/5">
              Code erreur: {error.digest}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            onClick={reset}
            className="bg-[#C9A962] text-[#0D1B2A] hover:bg-[#C9A962]/90"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Réessayer
          </Button>
          <Button asChild variant="outline" className="border-white/30 text-white hover:bg-white/10">
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Tableau de bord
            </Link>
          </Button>
        </motion.div>

        {/* Footer Logo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.5 }}
          className="pt-12"
        >
          <DealLogo type="wordmark" size="xs" variant="white" />
        </motion.div>
      </motion.div>
    </div>
  );
}
