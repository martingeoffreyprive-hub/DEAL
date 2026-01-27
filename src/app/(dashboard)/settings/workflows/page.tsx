"use client";

/**
 * Settings - Workflows Page
 * Gestion des workflows automatisés
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InteractiveTooltip } from "@/components/ui/interactive-tooltip";
import {
  Workflow,
  Plus,
  Play,
  Pause,
  Trash2,
  Settings,
  Mail,
  MessageSquare,
  Phone,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
} from "lucide-react";

// Types
interface WorkflowConfig {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  trigger_type: string;
  steps: any[];
  human_review: {
    enabled: boolean;
    required_for: string[];
  };
  created_at: string;
}

// Trigger icons
const TRIGGER_ICONS: Record<string, any> = {
  email_received: Mail,
  form_submitted: MessageSquare,
  sms_received: Phone,
  api_webhook: Zap,
};

// Templates de workflow
const WORKFLOW_TEMPLATES = [
  {
    id: "email_to_quote",
    name: "Email vers Devis",
    description: "Crée un devis automatiquement à partir d'un email reçu",
    trigger: "email_received",
    icon: Mail,
  },
  {
    id: "form_to_quote",
    name: "Formulaire vers Devis",
    description: "Crée un devis depuis le widget de votre site",
    trigger: "form_submitted",
    icon: MessageSquare,
  },
  {
    id: "sms_to_notification",
    name: "SMS vers Notification",
    description: "Notifie lors de la réception d'un SMS",
    trigger: "sms_received",
    icon: Phone,
  },
];

export default function WorkflowsSettingsPage() {
  const [workflows, setWorkflows] = useState<WorkflowConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [newWorkflowName, setNewWorkflowName] = useState("");

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const response = await fetch("/api/workflows");
      const data = await response.json();
      setWorkflows(data.workflows || []);
    } catch (error) {
      console.error("Failed to fetch workflows:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWorkflow = async (id: string, enabled: boolean) => {
    try {
      await fetch("/api/workflows", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, enabled }),
      });
      setWorkflows(prev =>
        prev.map(w => (w.id === id ? { ...w, enabled } : w))
      );
    } catch (error) {
      console.error("Failed to toggle workflow:", error);
    }
  };

  const deleteWorkflow = async (id: string) => {
    if (!confirm("Supprimer ce workflow ?")) return;

    try {
      await fetch(`/api/workflows?id=${id}`, { method: "DELETE" });
      setWorkflows(prev => prev.filter(w => w.id !== id));
    } catch (error) {
      console.error("Failed to delete workflow:", error);
    }
  };

  const createWorkflow = async () => {
    if (!selectedTemplate || !newWorkflowName) return;

    const template = WORKFLOW_TEMPLATES.find(t => t.id === selectedTemplate);
    if (!template) return;

    try {
      const response = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newWorkflowName,
          description: template.description,
          trigger: { type: template.trigger, config: {} },
          steps: [
            {
              id: "step_1",
              order: 0,
              action: "create_quote",
              config: {},
              human_review_required: true,
            },
            {
              id: "step_2",
              order: 1,
              action: "notify_user",
              config: {
                title: "Nouveau devis créé",
                message: "Un devis a été généré automatiquement",
              },
              human_review_required: false,
            },
          ],
          human_review: {
            enabled: true,
            required_for: ["create_quote", "send_email"],
          },
        }),
      });

      const data = await response.json();
      if (data.workflow) {
        setWorkflows(prev => [data.workflow, ...prev]);
        setShowCreateDialog(false);
        setSelectedTemplate(null);
        setNewWorkflowName("");
      }
    } catch (error) {
      console.error("Failed to create workflow:", error);
    }
  };

  return (
    <>
      <div className="container max-w-4xl py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Workflow className="h-8 w-8 text-[#C9A962]" />
                Workflows
              </h1>
              <p className="text-muted-foreground mt-2">
                Automatisez la création de devis depuis vos emails, formulaires et plus
              </p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-[#1E3A5F]">
                  <Plus className="h-4 w-4" />
                  Nouveau workflow
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Créer un workflow</DialogTitle>
                  <DialogDescription>
                    Choisissez un modèle pour commencer
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {/* Templates */}
                  <div className="grid gap-3">
                    {WORKFLOW_TEMPLATES.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template.id)}
                        className={`flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all ${
                          selectedTemplate === template.id
                            ? "border-[#C9A962] bg-[#C9A962]/10"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="h-10 w-10 rounded-lg bg-[#1E3A5F]/10 flex items-center justify-center flex-shrink-0">
                          <template.icon className="h-5 w-5 text-[#1E3A5F]" />
                        </div>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {template.description}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Name input */}
                  {selectedTemplate && (
                    <div className="space-y-2 pt-4 border-t">
                      <Label htmlFor="workflow-name">Nom du workflow</Label>
                      <Input
                        id="workflow-name"
                        value={newWorkflowName}
                        onChange={(e) => setNewWorkflowName(e.target.value)}
                        placeholder="Ex: Devis automatique site web"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={createWorkflow}
                    disabled={!selectedTemplate || !newWorkflowName}
                    className="bg-[#1E3A5F]"
                  >
                    Créer le workflow
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Info card */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-700">Contrôle humain activé</p>
                <p className="text-blue-600">
                  Tous les devis générés automatiquement nécessitent votre validation
                  avant d'être envoyés. Vous pouvez personnaliser ce comportement dans
                  les paramètres de chaque workflow.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Workflows list */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="h-24" />
                </Card>
              ))}
            </div>
          ) : workflows.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Workflow className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-medium text-lg mb-2">Aucun workflow</h3>
                <p className="text-muted-foreground mb-4">
                  Créez votre premier workflow pour automatiser la génération de devis
                </p>
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-[#1E3A5F]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un workflow
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {workflows.map((workflow, index) => {
                const TriggerIcon = TRIGGER_ICONS[workflow.trigger_type] || Zap;
                return (
                  <motion.div
                    key={workflow.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          {/* Icon */}
                          <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                            workflow.enabled ? "bg-green-100" : "bg-gray-100"
                          }`}>
                            <TriggerIcon className={`h-6 w-6 ${
                              workflow.enabled ? "text-green-600" : "text-gray-400"
                            }`} />
                          </div>

                          {/* Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{workflow.name}</h3>
                              {workflow.enabled ? (
                                <Badge variant="default" className="bg-green-500">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Actif
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  <Pause className="h-3 w-3 mr-1" />
                                  Inactif
                                </Badge>
                              )}
                              {workflow.human_review.enabled && (
                                <InteractiveTooltip
                                  content={{
                                    title: "Contrôle humain",
                                    description: "Ce workflow nécessite votre validation",
                                    type: "info",
                                  }}
                                >
                                  <Badge variant="outline" className="cursor-help">
                                    <Users className="h-3 w-3 mr-1" />
                                    HITL
                                  </Badge>
                                </InteractiveTooltip>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {workflow.description || `Déclenché par ${workflow.trigger_type}`}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3" />
                              Créé le {new Date(workflow.created_at).toLocaleDateString("fr-BE")}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={workflow.enabled}
                              onCheckedChange={(checked) =>
                                toggleWorkflow(workflow.id, checked)
                              }
                            />
                            <Button variant="ghost" size="icon">
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteWorkflow(workflow.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}
