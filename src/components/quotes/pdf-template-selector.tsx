"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Palette, Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type PDFTemplateId,
  type PDFTemplateConfig,
  getAllTemplates,
  getTemplate,
} from "@/lib/pdf-templates";
import { useSubscription } from "@/hooks/use-subscription";

interface PDFTemplateSelectorProps {
  selectedTemplate: PDFTemplateId;
  onSelectTemplate: (templateId: PDFTemplateId) => void;
}

export function PDFTemplateSelector({
  selectedTemplate,
  onSelectTemplate,
}: PDFTemplateSelectorProps) {
  const [open, setOpen] = useState(false);
  const templates = getAllTemplates();
  const currentTemplate = getTemplate(selectedTemplate);
  const { canUseProFeatures } = useSubscription();

  // Free templates
  const freeTemplates: PDFTemplateId[] = ["classic-pro", "minimal"];

  const isTemplateLocked = (templateId: PDFTemplateId) => {
    return !freeTemplates.includes(templateId) && !canUseProFeatures();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Palette className="h-4 w-4" />
          Template: {currentTemplate.name}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#C9A962]" />
            Choisir un template de devis
          </DialogTitle>
          <DialogDescription>
            Sélectionnez un design professionnel pour vos devis PDF
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {templates.map((template) => {
              const isSelected = selectedTemplate === template.id;
              const isLocked = isTemplateLocked(template.id);

              return (
                <motion.div
                  key={template.id}
                  whileHover={{ scale: isLocked ? 1 : 1.02 }}
                  whileTap={{ scale: isLocked ? 1 : 0.98 }}
                >
                  <Card
                    className={cn(
                      "cursor-pointer transition-all duration-200 overflow-hidden",
                      isSelected && "ring-2 ring-[#C9A962] border-[#C9A962]",
                      isLocked && "opacity-60 cursor-not-allowed"
                    )}
                    onClick={() => {
                      if (!isLocked) {
                        onSelectTemplate(template.id);
                        setOpen(false);
                      }
                    }}
                  >
                    {/* Template Preview */}
                    <div
                      className="h-32 relative"
                      style={{
                        background: `linear-gradient(135deg, ${template.colors.primary} 0%, ${template.colors.secondary} 100%)`,
                      }}
                    >
                      {/* Mock document preview */}
                      <div className="absolute inset-2 bg-white rounded shadow-lg p-2">
                        <div
                          className="h-2 w-16 rounded mb-2"
                          style={{ backgroundColor: template.colors.primary }}
                        />
                        <div className="space-y-1">
                          <div className="h-1 w-full bg-gray-200 rounded" />
                          <div className="h-1 w-3/4 bg-gray-200 rounded" />
                          <div className="h-1 w-1/2 bg-gray-200 rounded" />
                        </div>
                        <div className="mt-2 flex gap-1">
                          <div
                            className="h-4 w-12 rounded text-[6px] flex items-center justify-center text-white"
                            style={{ backgroundColor: template.colors.tableHeaderBg }}
                          >
                            Total
                          </div>
                          <div
                            className="h-4 w-8 rounded"
                            style={{ backgroundColor: template.colors.accent + "40" }}
                          />
                        </div>
                      </div>

                      {/* Locked overlay */}
                      {isLocked && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="bg-white rounded-full p-2">
                            <Lock className="h-5 w-5 text-gray-500" />
                          </div>
                        </div>
                      )}

                      {/* Selected check */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-[#C9A962] rounded-full p-1">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}

                      {/* Gold accent indicator */}
                      {template.features.showGoldAccent && (
                        <div
                          className="absolute bottom-0 left-0 right-0 h-1"
                          style={{ backgroundColor: "#C9A962" }}
                        />
                      )}
                    </div>

                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-sm">{template.name}</h4>
                        {isLocked && (
                          <Badge variant="secondary" className="text-xs">
                            Pro
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {template.description}
                      </p>

                      {/* Color swatches */}
                      <div className="flex gap-1 mt-2">
                        <div
                          className="w-4 h-4 rounded-full border border-gray-200"
                          style={{ backgroundColor: template.colors.primary }}
                          title="Couleur principale"
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-gray-200"
                          style={{ backgroundColor: template.colors.accent }}
                          title="Couleur d'accent"
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-gray-200"
                          style={{ backgroundColor: template.colors.tableHeaderBg }}
                          title="En-tête de tableau"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Pro upsell */}
        {!canUseProFeatures() && (
          <div className="mt-4 p-4 bg-gradient-to-r from-[#1E3A5F]/10 to-[#C9A962]/10 rounded-lg border border-[#C9A962]/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#C9A962]/20 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-[#C9A962]" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Débloquez tous les templates</p>
                <p className="text-xs text-muted-foreground">
                  Passez au plan Pro pour accéder aux 6 templates premium
                </p>
              </div>
              <Button size="sm" className="bg-[#C9A962] text-[#0D1B2A] hover:bg-[#C9A962]/90">
                Upgrade
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Compact inline selector for quick access
export function PDFTemplateInlineSelector({
  selectedTemplate,
  onSelectTemplate,
}: PDFTemplateSelectorProps) {
  const templates = getAllTemplates().slice(0, 3); // Show only first 3
  const { canUseProFeatures } = useSubscription();
  const freeTemplates: PDFTemplateId[] = ["classic-pro", "minimal"];

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Template:</span>
      <div className="flex gap-1">
        {templates.map((template) => {
          const isSelected = selectedTemplate === template.id;
          const isLocked = !freeTemplates.includes(template.id) && !canUseProFeatures();

          return (
            <button
              key={template.id}
              className={cn(
                "w-8 h-8 rounded-lg border-2 transition-all relative overflow-hidden",
                isSelected
                  ? "border-[#C9A962] ring-2 ring-[#C9A962]/30"
                  : "border-gray-200 hover:border-gray-300",
                isLocked && "opacity-50 cursor-not-allowed"
              )}
              style={{
                background: `linear-gradient(135deg, ${template.colors.primary} 0%, ${template.colors.secondary} 100%)`,
              }}
              onClick={() => !isLocked && onSelectTemplate(template.id)}
              disabled={isLocked}
              title={template.name}
            >
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}
              {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Lock className="h-3 w-3 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
