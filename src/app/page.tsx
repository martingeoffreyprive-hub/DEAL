import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Mic, Sparkles, Download } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">QuoteVoice</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Connexion</Button>
            </Link>
            <Link href="/register">
              <Button>Commencer</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Transformez vos notes vocales en{" "}
            <span className="text-primary">devis professionnels</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            QuoteVoice utilise l'intelligence artificielle pour analyser vos transcriptions
            et générer automatiquement des devis adaptés à votre secteur d'activité.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                <Sparkles className="h-5 w-5" />
                Essayer gratuitement
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                Se connecter
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mx-auto mt-24 max-w-5xl">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Mic className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Import simple</h3>
              <p className="text-gray-600">
                Collez directement votre transcription depuis Plaud Note Pro ou tout autre outil.
              </p>
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Analyse IA</h3>
              <p className="text-gray-600">
                Notre IA détecte automatiquement le secteur et génère un devis avec le bon vocabulaire.
              </p>
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Export PDF</h3>
              <p className="text-gray-600">
                Téléchargez un PDF professionnel avec votre logo et vos mentions légales.
              </p>
            </div>
          </div>
        </div>

        {/* Sectors */}
        <div className="mx-auto mt-24 max-w-3xl text-center">
          <h2 className="text-2xl font-bold">Adapté à votre métier</h2>
          <p className="mt-4 text-gray-600">
            QuoteVoice s'adapte automatiquement à votre secteur d'activité
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {[
              "BTP / Construction",
              "Services IT",
              "Conseil",
              "Artisanat",
              "Services à la personne",
            ].map((sector) => (
              <span
                key={sector}
                className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-primary"
              >
                {sector}
              </span>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} QuoteVoice. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
