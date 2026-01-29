"use client";

/**
 * Public API Documentation Page
 * Sprint 19 — Story 11-3
 * Interactive API reference for DEAL public API v1
 */

import { useState } from "react";
import { Code, Key, Zap, Shield, Copy, Check, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

// ============================================================================
// API Endpoints Reference
// ============================================================================

interface APIEndpoint {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  description: string;
  auth: "api_key" | "bearer" | "none";
  category: string;
  parameters?: { name: string; type: string; required: boolean; description: string }[];
  responseExample: string;
}

const API_ENDPOINTS: APIEndpoint[] = [
  {
    method: "GET",
    path: "/api/v1/quotes",
    description: "Liste tous les devis de l'utilisateur authentifié",
    auth: "api_key",
    category: "Devis",
    parameters: [
      { name: "page", type: "number", required: false, description: "Numéro de page (défaut: 1)" },
      { name: "limit", type: "number", required: false, description: "Résultats par page (défaut: 20, max: 100)" },
      { name: "status", type: "string", required: false, description: "Filtrer par statut (draft, sent, accepted, rejected)" },
    ],
    responseExample: JSON.stringify({ data: [{ id: "uuid", quote_number: "DEV-2026-0001", status: "draft", total: 1500.00, client_name: "Jean Dupont" }], pagination: { page: 1, limit: 20, total: 42 } }, null, 2),
  },
  {
    method: "POST",
    path: "/api/v1/quotes",
    description: "Crée un nouveau devis",
    auth: "api_key",
    category: "Devis",
    parameters: [
      { name: "client_name", type: "string", required: true, description: "Nom du client" },
      { name: "description", type: "string", required: true, description: "Description des travaux" },
      { name: "items", type: "array", required: true, description: "Lignes du devis" },
    ],
    responseExample: JSON.stringify({ data: { id: "uuid", quote_number: "DEV-2026-0042", status: "draft" } }, null, 2),
  },
  {
    method: "GET",
    path: "/api/v1/quotes/:id",
    description: "Récupère un devis par son ID",
    auth: "api_key",
    category: "Devis",
    responseExample: JSON.stringify({ data: { id: "uuid", quote_number: "DEV-2026-0001", status: "draft", items: [], total: 0 } }, null, 2),
  },
  {
    method: "POST",
    path: "/api/ai-assistant",
    description: "Génère un devis via l'assistant IA",
    auth: "bearer",
    category: "IA",
    parameters: [
      { name: "action", type: "string", required: true, description: "Type d'action (audit, optimize, generate)" },
      { name: "sector", type: "string", required: true, description: "Secteur d'activité" },
      { name: "transcription", type: "string", required: true, description: "Description des travaux" },
    ],
    responseExample: JSON.stringify({ data: { items: [], suggestions: [], cached: false } }, null, 2),
  },
  {
    method: "GET",
    path: "/api/health",
    description: "Vérifie l'état de santé des services",
    auth: "none",
    category: "Système",
    responseExample: JSON.stringify({ status: "up", timestamp: "2026-01-29T00:00:00Z", checks: { supabase: { status: "up" }, redis: { status: "up" } } }, null, 2),
  },
];

const RATE_LIMITS = [
  { tier: "Général", limit: "100 req/min", description: "Endpoints standards" },
  { tier: "IA", limit: "5 req/min", description: "Génération IA" },
  { tier: "Auth", limit: "5 req/15min", description: "Authentification" },
  { tier: "API v1", limit: "100 req/min", description: "API publique" },
];

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-green-100 text-green-800",
  POST: "bg-blue-100 text-blue-800",
  PUT: "bg-amber-100 text-amber-800",
  DELETE: "bg-red-100 text-red-800",
  PATCH: "bg-purple-100 text-purple-800",
};

// ============================================================================
// Components
// ============================================================================

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="p-1 hover:bg-gray-200 rounded"
    >
      {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3 text-gray-400" />}
    </button>
  );
}

function EndpointCard({ endpoint }: { endpoint: APIEndpoint }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${METHOD_COLORS[endpoint.method]}`}>
            {endpoint.method}
          </span>
          <code className="text-sm font-mono">{endpoint.path}</code>
          <span className="text-sm text-gray-500 ml-auto">{endpoint.description}</span>
        </div>
        {expanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 space-y-3">
            {endpoint.parameters && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Paramètres</h4>
                <div className="space-y-1">
                  {endpoint.parameters.map((p) => (
                    <div key={p.name} className="flex items-center gap-2 text-sm">
                      <code className="text-xs bg-gray-100 px-1 rounded">{p.name}</code>
                      <span className="text-gray-400 text-xs">{p.type}</span>
                      {p.required && <span className="text-red-500 text-xs">requis</span>}
                      <span className="text-gray-500 text-xs">— {p.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs font-semibold text-gray-500 uppercase">Réponse</h4>
                <CopyButton text={endpoint.responseExample} />
              </div>
              <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">{endpoint.responseExample}</pre>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Page
// ============================================================================

export default function APIDocsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const categories = Array.from(new Set(API_ENDPOINTS.map((e) => e.category)));

  const filtered = searchQuery
    ? API_ENDPOINTS.filter((e) =>
        e.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : API_ENDPOINTS;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-[#0D1B2A]">DEAL API Reference</h1>
          <p className="text-gray-600">Documentation de l&apos;API publique DEAL v1</p>
        </div>

        {/* Quick Start */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Key className="h-5 w-5" /> Authentification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">Ajoutez votre clé API dans le header Authorization :</p>
            <pre className="bg-gray-900 text-green-400 p-3 rounded text-sm">
{`curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://app.dealofficialapp.com/api/v1/quotes`}
            </pre>
          </CardContent>
        </Card>

        {/* Rate Limits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Rate Limiting</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {RATE_LIMITS.map((rl) => (
                <div key={rl.tier} className="text-center p-3 bg-gray-50 rounded">
                  <p className="font-mono font-bold text-[#0D1B2A]">{rl.limit}</p>
                  <p className="text-xs text-gray-500">{rl.tier}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un endpoint..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>

        {/* Endpoints by category */}
        {categories.map((cat) => {
          const endpoints = filtered.filter((e) => e.category === cat);
          if (endpoints.length === 0) return null;
          return (
            <div key={cat}>
              <h2 className="text-lg font-semibold text-[#0D1B2A] mb-3">{cat}</h2>
              <div className="space-y-2">
                {endpoints.map((ep) => (
                  <EndpointCard key={`${ep.method}-${ep.path}`} endpoint={ep} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
