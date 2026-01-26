"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DealLogo, DealIconD } from "@/components/brand";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0D1B2A] via-[#1E3A5F] to-[#0D1B2A]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6 px-4"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="flex justify-center"
        >
          <div className="relative">
            <DealIconD size="2xl" variant="white" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[#C9A962] text-3xl font-bold">?</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <h1 className="text-6xl font-bold tracking-tight text-white">404</h1>
          <h2 className="text-xl font-semibold text-[#C9A962]">
            Page non trouvée
          </h2>
          <p className="text-gray-400 max-w-md mx-auto">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button asChild className="bg-[#C9A962] text-[#0D1B2A] hover:bg-[#C9A962]/90">
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Tableau de bord
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-white/30 text-white hover:bg-white/10">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'accueil
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
