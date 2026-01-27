import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0D1B2A] via-[#1E3A5F] to-[#0D1B2A]">
      <div className="text-center space-y-6 px-4">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="h-24 w-24 rounded-full bg-[#1E3A5F] border-2 border-[#C9A962] flex items-center justify-center">
            <span className="text-[#C9A962] text-4xl font-bold">?</span>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-bold tracking-tight text-white">404</h1>
          <h2 className="text-xl font-semibold text-[#C9A962]">
            Page non trouvée
          </h2>
          <p className="text-gray-400 max-w-md mx-auto">
            La page que vous recherchez n&apos;existe pas ou a été déplacée.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-[#C9A962] text-[#0D1B2A] hover:bg-[#C9A962]/90">
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Tableau de bord
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-white/30 text-white hover:bg-white/10">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l&apos;accueil
            </Link>
          </Button>
        </div>

        {/* Footer */}
        <div className="pt-12 opacity-50">
          <p className="text-white text-sm">DEAL</p>
        </div>
      </div>
    </div>
  );
}
