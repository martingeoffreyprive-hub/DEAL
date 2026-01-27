"use client";

/**
 * Quote Request Widget - Widget pour sites clients
 * Intégrable sur site web, boutique en ligne
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FileText,
  Send,
  Check,
  Loader2,
  X,
  MessageSquare,
  User,
  Mail,
  Phone,
  Home,
  AlertCircle,
} from "lucide-react";

interface WidgetConfig {
  companyName: string;
  companyLogo?: string;
  primaryColor?: string;
  workTypes?: string[];
  requirePhone?: boolean;
  requireAddress?: boolean;
  gdprText?: string;
  successMessage?: string;
  apiEndpoint: string;
  apiKey: string;
}

interface QuoteRequestWidgetProps {
  config: WidgetConfig;
  onSubmit?: (data: any) => Promise<void>;
  className?: string;
}

// Question de vérification humaine
const HUMAN_VERIFICATION_QUESTIONS = [
  { question: "Quelle pièce est concernée par vos travaux ?", placeholder: "Ex: cuisine, salle de bain, salon..." },
  { question: "Avez-vous un délai particulier ?", placeholder: "Ex: dans 2 mois, urgent, flexible..." },
  { question: "Budget approximatif envisagé ?", placeholder: "Ex: 5000€, entre 2000 et 3000€..." },
];

export function QuoteRequestWidget({ config, onSubmit, className }: QuoteRequestWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    workType: "",
    description: "",
    humanVerification: "",
    gdprConsent: false,
  });

  const verificationQuestion = HUMAN_VERIFICATION_QUESTIONS[
    Math.floor(Math.random() * HUMAN_VERIFICATION_QUESTIONS.length)
  ];

  const primaryColor = config.primaryColor || "#1E3A5F";

  const updateForm = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateStep = (stepNum: number): boolean => {
    switch (stepNum) {
      case 1:
        if (!formData.name.trim()) {
          setError("Veuillez entrer votre nom");
          return false;
        }
        if (!formData.email.trim() || !formData.email.includes("@")) {
          setError("Veuillez entrer un email valide");
          return false;
        }
        if (config.requirePhone && !formData.phone.trim()) {
          setError("Veuillez entrer votre numéro de téléphone");
          return false;
        }
        return true;
      case 2:
        if (!formData.description.trim() || formData.description.length < 20) {
          setError("Décrivez vos travaux (minimum 20 caractères)");
          return false;
        }
        return true;
      case 3:
        if (!formData.humanVerification.trim()) {
          setError("Veuillez répondre à la question de vérification");
          return false;
        }
        if (!formData.gdprConsent) {
          setError("Veuillez accepter le traitement de vos données");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Appeler l'API DEAL
      const response = await fetch(config.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": config.apiKey,
        },
        body: JSON.stringify({
          ...formData,
          source: "widget",
          company: config.companyName,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi de la demande");
      }

      // Callback personnalisé si fourni
      if (onSubmit) {
        await onSubmit(formData);
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetWidget = () => {
    setIsOpen(false);
    setStep(1);
    setIsSuccess(false);
    setError(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      workType: "",
      description: "",
      humanVerification: "",
      gdprConsent: false,
    });
  };

  return (
    <div className={className}>
      {/* Trigger Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-xl flex items-center justify-center z-50"
            style={{ backgroundColor: primaryColor }}
          >
            <FileText className="h-7 w-7 text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Widget Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-6 right-6 w-[380px] max-h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            {/* Header */}
            <div
              className="p-4 text-white flex items-center justify-between"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="flex items-center gap-3">
                {config.companyLogo ? (
                  <img
                    src={config.companyLogo}
                    alt={config.companyName}
                    className="h-8 w-8 rounded"
                  />
                ) : (
                  <div className="h-8 w-8 rounded bg-white/20 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                )}
                <div>
                  <div className="font-semibold text-sm">{config.companyName}</div>
                  <div className="text-xs text-white/80">Demande de devis</div>
                </div>
              </div>
              <button
                onClick={resetWidget}
                className="h-8 w-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto max-h-[450px]">
              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div
                    className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: `${primaryColor}20` }}
                  >
                    <Check className="h-8 w-8" style={{ color: primaryColor }} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Demande envoyée !</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {config.successMessage ||
                      "Nous avons bien reçu votre demande de devis. Nous vous recontacterons dans les plus brefs délais."}
                  </p>
                  <Button onClick={resetWidget} variant="outline" size="sm">
                    Fermer
                  </Button>
                </motion.div>
              ) : (
                <>
                  {/* Progress */}
                  <div className="flex gap-2 mb-4">
                    {[1, 2, 3].map((s) => (
                      <div
                        key={s}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          s <= step ? "bg-primary" : "bg-gray-200"
                        }`}
                        style={{ backgroundColor: s <= step ? primaryColor : undefined }}
                      />
                    ))}
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>
                  )}

                  {/* Step 1: Contact Info */}
                  {step === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <div>
                        <Label className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Nom complet *
                        </Label>
                        <Input
                          value={formData.name}
                          onChange={(e) => updateForm("name", e.target.value)}
                          placeholder="Jean Dupont"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email *
                        </Label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => updateForm("email", e.target.value)}
                          placeholder="jean@exemple.be"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Téléphone {config.requirePhone && "*"}
                        </Label>
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => updateForm("phone", e.target.value)}
                          placeholder="+32 xxx xx xx xx"
                          className="mt-1"
                        />
                      </div>
                      {config.requireAddress && (
                        <div>
                          <Label className="flex items-center gap-2">
                            <Home className="h-4 w-4" />
                            Adresse des travaux *
                          </Label>
                          <Input
                            value={formData.address}
                            onChange={(e) => updateForm("address", e.target.value)}
                            placeholder="Rue, code postal, ville"
                            className="mt-1"
                          />
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 2: Work Description */}
                  {step === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      {config.workTypes && config.workTypes.length > 0 && (
                        <div>
                          <Label>Type de travaux</Label>
                          <Select
                            value={formData.workType}
                            onValueChange={(value) => updateForm("workType", value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Sélectionner..." />
                            </SelectTrigger>
                            <SelectContent>
                              {config.workTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <div>
                        <Label>Décrivez vos travaux *</Label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => updateForm("description", e.target.value)}
                          placeholder="Décrivez les travaux souhaités, les dimensions, l'état actuel..."
                          className="mt-1 min-h-[120px]"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Minimum 20 caractères ({formData.description.length}/20)
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Verification & GDPR */}
                  {step === 3 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      {/* Human verification question */}
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <Label className="text-blue-700">{verificationQuestion.question}</Label>
                        <Input
                          value={formData.humanVerification}
                          onChange={(e) => updateForm("humanVerification", e.target.value)}
                          placeholder={verificationQuestion.placeholder}
                          className="mt-2 bg-white"
                        />
                      </div>

                      {/* GDPR Consent */}
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="gdpr"
                          checked={formData.gdprConsent}
                          onCheckedChange={(checked) =>
                            updateForm("gdprConsent", checked)
                          }
                          className="mt-1"
                        />
                        <Label htmlFor="gdpr" className="text-sm text-gray-600 cursor-pointer">
                          {config.gdprText ||
                            "J'accepte que mes données soient traitées pour répondre à ma demande de devis, conformément au RGPD."}
                        </Label>
                      </div>
                    </motion.div>
                  )}

                  {/* Navigation */}
                  <div className="flex gap-3 mt-6">
                    {step > 1 && (
                      <Button variant="outline" onClick={prevStep} className="flex-1">
                        Retour
                      </Button>
                    )}
                    {step < 3 ? (
                      <Button
                        onClick={nextStep}
                        className="flex-1"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Continuer
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-1"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Envoi...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Envoyer
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-gray-50 text-center text-xs text-gray-500 border-t">
              Propulsé par{" "}
              <a
                href="https://deal.be"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium"
                style={{ color: primaryColor }}
              >
                DEAL
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Code d'intégration pour le widget
 */
export function generateWidgetEmbedCode(config: {
  apiKey: string;
  companyName: string;
  primaryColor?: string;
}): string {
  return `<!-- Widget DEAL Quote Request -->
<script>
  (function() {
    var d = document, s = d.createElement('script');
    s.src = 'https://deal.be/widget/quote-request.js';
    s.async = true;
    s.onload = function() {
      DealWidget.init({
        apiKey: '${config.apiKey}',
        companyName: '${config.companyName}',
        primaryColor: '${config.primaryColor || '#1E3A5F'}',
      });
    };
    d.body.appendChild(s);
  })();
</script>
<!-- End Widget DEAL -->`;
}
