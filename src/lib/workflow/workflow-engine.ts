/**
 * Workflow Engine - MCP Integration
 * Moteur de workflow pour automatisation des devis
 */

import { createClient } from '@/lib/supabase/server';
import { createHITLRequest, HITL_ACTIONS } from '@/lib/rgpd/human-in-the-loop';

/**
 * Types de déclencheurs de workflow
 */
export const WORKFLOW_TRIGGERS = {
  EMAIL_RECEIVED: 'email_received',
  FORM_SUBMITTED: 'form_submitted',
  CHATBOT_REQUEST: 'chatbot_request',
  SMS_RECEIVED: 'sms_received',
  PHONE_CALL: 'phone_call',
  API_WEBHOOK: 'api_webhook',
  SCHEDULE: 'schedule',
  MANUAL: 'manual',
} as const;

export type WorkflowTrigger = typeof WORKFLOW_TRIGGERS[keyof typeof WORKFLOW_TRIGGERS];

/**
 * Types d'actions de workflow
 */
export const WORKFLOW_ACTIONS = {
  CREATE_QUOTE: 'create_quote',
  UPDATE_QUOTE: 'update_quote',
  SEND_EMAIL: 'send_email',
  SEND_SMS: 'send_sms',
  CREATE_TASK: 'create_task',
  NOTIFY_USER: 'notify_user',
  CALL_WEBHOOK: 'call_webhook',
  AI_PROCESS: 'ai_process',
  WAIT_APPROVAL: 'wait_approval',
  CONDITIONAL: 'conditional',
} as const;

export type WorkflowAction = typeof WORKFLOW_ACTIONS[keyof typeof WORKFLOW_ACTIONS];

/**
 * Configuration d'un workflow
 */
export interface WorkflowConfig {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  enabled: boolean;
  trigger: {
    type: WorkflowTrigger;
    config: Record<string, any>;
  };
  steps: WorkflowStep[];
  human_review: {
    enabled: boolean;
    required_for: WorkflowAction[];
    auto_approve_after_hours?: number;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Étape d'un workflow
 */
export interface WorkflowStep {
  id: string;
  order: number;
  action: WorkflowAction;
  config: Record<string, any>;
  conditions?: WorkflowCondition[];
  on_success?: string; // ID de l'étape suivante
  on_failure?: string; // ID de l'étape en cas d'échec
  human_review_required: boolean;
}

/**
 * Condition de workflow
 */
export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'regex';
  value: any;
}

/**
 * Exécution d'un workflow
 */
export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  user_id: string;
  status: 'pending' | 'running' | 'waiting_approval' | 'completed' | 'failed' | 'cancelled';
  trigger_data: Record<string, any>;
  current_step_id?: string;
  results: Record<string, any>;
  error?: string;
  started_at: string;
  completed_at?: string;
}

/**
 * Crée un nouveau workflow
 */
export async function createWorkflow(
  userId: string,
  config: Omit<WorkflowConfig, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<WorkflowConfig> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('workflows')
    .insert({
      user_id: userId,
      name: config.name,
      description: config.description,
      enabled: config.enabled,
      trigger_type: config.trigger.type,
      trigger_config: config.trigger.config,
      steps: config.steps,
      human_review: config.human_review,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create workflow: ${error.message}`);
  }

  return data;
}

/**
 * Démarre l'exécution d'un workflow
 */
export async function executeWorkflow(
  workflowId: string,
  triggerData: Record<string, any>
): Promise<WorkflowExecution> {
  const supabase = await createClient();

  // Récupérer le workflow
  const { data: workflow, error: workflowError } = await supabase
    .from('workflows')
    .select('*')
    .eq('id', workflowId)
    .eq('enabled', true)
    .single();

  if (workflowError || !workflow) {
    throw new Error('Workflow not found or disabled');
  }

  // Créer l'exécution
  const { data: execution, error: execError } = await supabase
    .from('workflow_executions')
    .insert({
      workflow_id: workflowId,
      user_id: workflow.user_id,
      status: 'running',
      trigger_data: triggerData,
      current_step_id: workflow.steps[0]?.id,
      results: {},
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (execError) {
    throw new Error(`Failed to start workflow: ${execError.message}`);
  }

  // Exécuter les étapes
  await processWorkflowSteps(execution, workflow);

  return execution;
}

/**
 * Traite les étapes du workflow
 */
async function processWorkflowSteps(
  execution: WorkflowExecution,
  workflow: WorkflowConfig
): Promise<void> {
  const supabase = await createClient();
  let currentStepIndex = 0;
  const results: Record<string, any> = { ...execution.results };

  while (currentStepIndex < workflow.steps.length) {
    const step = workflow.steps[currentStepIndex];

    // Vérifier si human review requis
    if (step.human_review_required ||
        (workflow.human_review.enabled &&
         workflow.human_review.required_for.includes(step.action))) {

      // Créer une demande HITL
      await createHITLRequest(
        HITL_ACTIONS.WORKFLOW_QUOTE_AUTO,
        workflow.user_id,
        'workflow_execution',
        execution.id,
        {
          workflow_name: workflow.name,
          step_id: step.id,
          step_action: step.action,
          trigger_data: execution.trigger_data,
        }
      );

      // Mettre à jour le statut
      await supabase
        .from('workflow_executions')
        .update({
          status: 'waiting_approval',
          current_step_id: step.id,
          results,
        })
        .eq('id', execution.id);

      return; // Arrêter et attendre l'approbation
    }

    // Vérifier les conditions
    if (step.conditions && !evaluateConditions(step.conditions, execution.trigger_data, results)) {
      currentStepIndex++;
      continue;
    }

    try {
      // Exécuter l'action
      const stepResult = await executeWorkflowAction(step, execution.trigger_data, results, workflow.user_id);
      results[step.id] = stepResult;

      // Mettre à jour l'exécution
      await supabase
        .from('workflow_executions')
        .update({
          current_step_id: step.id,
          results,
        })
        .eq('id', execution.id);

      // Déterminer l'étape suivante
      if (step.on_success) {
        currentStepIndex = workflow.steps.findIndex(s => s.id === step.on_success);
        if (currentStepIndex === -1) currentStepIndex = workflow.steps.length;
      } else {
        currentStepIndex++;
      }
    } catch (error: any) {
      results[step.id] = { error: error.message };

      if (step.on_failure) {
        currentStepIndex = workflow.steps.findIndex(s => s.id === step.on_failure);
        if (currentStepIndex === -1) break;
      } else {
        // Marquer comme échoué
        await supabase
          .from('workflow_executions')
          .update({
            status: 'failed',
            error: error.message,
            results,
            completed_at: new Date().toISOString(),
          })
          .eq('id', execution.id);
        return;
      }
    }
  }

  // Workflow terminé
  await supabase
    .from('workflow_executions')
    .update({
      status: 'completed',
      results,
      completed_at: new Date().toISOString(),
    })
    .eq('id', execution.id);
}

/**
 * Évalue les conditions d'une étape
 */
function evaluateConditions(
  conditions: WorkflowCondition[],
  triggerData: Record<string, any>,
  results: Record<string, any>
): boolean {
  const context = { ...triggerData, _results: results };

  return conditions.every(condition => {
    const value = getNestedValue(context, condition.field);

    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'not_equals':
        return value !== condition.value;
      case 'contains':
        return String(value).includes(condition.value);
      case 'greater_than':
        return Number(value) > Number(condition.value);
      case 'less_than':
        return Number(value) < Number(condition.value);
      case 'regex':
        return new RegExp(condition.value).test(String(value));
      default:
        return false;
    }
  });
}

/**
 * Récupère une valeur imbriquée
 */
function getNestedValue(obj: Record<string, any>, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Exécute une action de workflow
 */
async function executeWorkflowAction(
  step: WorkflowStep,
  triggerData: Record<string, any>,
  previousResults: Record<string, any>,
  userId: string
): Promise<any> {
  const supabase = await createClient();

  switch (step.action) {
    case WORKFLOW_ACTIONS.CREATE_QUOTE: {
      // Créer un devis automatiquement
      const quoteData = interpolateTemplate(step.config, triggerData, previousResults);

      const { data: quote, error } = await supabase
        .from('quotes')
        .insert({
          user_id: userId,
          status: 'draft',
          client_name: quoteData.client_name || triggerData.client_name,
          client_email: quoteData.client_email || triggerData.client_email,
          client_phone: quoteData.client_phone || triggerData.client_phone,
          notes: quoteData.notes || `Devis généré automatiquement depuis: ${triggerData.source || 'workflow'}`,
          subtotal: 0,
          tax_rate: 21,
          tax_amount: 0,
          total: 0,
          source: 'workflow',
          workflow_execution_id: triggerData._execution_id,
        })
        .select()
        .single();

      if (error) throw new Error(`Failed to create quote: ${error.message}`);
      return { quote_id: quote.id };
    }

    case WORKFLOW_ACTIONS.SEND_EMAIL: {
      // Envoyer un email (via service email)
      const emailData = interpolateTemplate(step.config, triggerData, previousResults);
      // TODO: Intégrer avec service email (SendGrid, Resend, etc.)
      console.log('Would send email:', emailData);
      return { sent: true, to: emailData.to };
    }

    case WORKFLOW_ACTIONS.NOTIFY_USER: {
      // Créer une notification
      const { data: notification } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'workflow',
          title: step.config.title || 'Notification Workflow',
          message: interpolateString(step.config.message, triggerData, previousResults),
          data: { workflow: true, trigger: triggerData },
        })
        .select()
        .single();

      return { notification_id: notification?.id };
    }

    case WORKFLOW_ACTIONS.AI_PROCESS: {
      // Traitement IA (extraction d'infos, classification, etc.)
      // TODO: Intégrer avec le module IA
      return { processed: true };
    }

    case WORKFLOW_ACTIONS.CALL_WEBHOOK: {
      // Appeler un webhook externe
      const response = await fetch(step.config.url, {
        method: step.config.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...step.config.headers,
        },
        body: JSON.stringify(interpolateTemplate(step.config.body, triggerData, previousResults)),
      });

      return {
        status: response.status,
        data: await response.json().catch(() => null),
      };
    }

    default:
      throw new Error(`Unknown action: ${step.action}`);
  }
}

/**
 * Interpole un template avec les données
 */
function interpolateTemplate(
  template: Record<string, any>,
  triggerData: Record<string, any>,
  results: Record<string, any>
): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(template)) {
    if (typeof value === 'string') {
      result[key] = interpolateString(value, triggerData, results);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = interpolateTemplate(value, triggerData, results);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Interpole une chaîne avec les données
 */
function interpolateString(
  str: string,
  triggerData: Record<string, any>,
  results: Record<string, any>
): string {
  return str.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
    const context = { ...triggerData, _results: results };
    return getNestedValue(context, path.trim()) ?? '';
  });
}

/**
 * Récupère les workflows d'un utilisateur
 */
export async function getUserWorkflows(userId: string): Promise<WorkflowConfig[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('workflows')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get workflows: ${error.message}`);
  }

  return data;
}

/**
 * Templates de workflow prédéfinis
 */
export const WORKFLOW_TEMPLATES = {
  email_to_quote: {
    name: 'Email vers Devis',
    description: 'Crée automatiquement un devis à partir d\'un email reçu',
    trigger: { type: WORKFLOW_TRIGGERS.EMAIL_RECEIVED, config: {} },
    steps: [
      {
        id: 'extract',
        order: 0,
        action: WORKFLOW_ACTIONS.AI_PROCESS,
        config: { task: 'extract_quote_info' },
        human_review_required: false,
      },
      {
        id: 'create',
        order: 1,
        action: WORKFLOW_ACTIONS.CREATE_QUOTE,
        config: {},
        human_review_required: true,
      },
      {
        id: 'notify',
        order: 2,
        action: WORKFLOW_ACTIONS.NOTIFY_USER,
        config: {
          title: 'Nouveau devis créé',
          message: 'Un devis a été créé automatiquement depuis un email de {{client_email}}',
        },
        human_review_required: false,
      },
    ],
    human_review: {
      enabled: true,
      required_for: [WORKFLOW_ACTIONS.CREATE_QUOTE, WORKFLOW_ACTIONS.SEND_EMAIL],
    },
  },

  form_to_quote: {
    name: 'Formulaire vers Devis',
    description: 'Crée un devis à partir d\'un formulaire web',
    trigger: { type: WORKFLOW_TRIGGERS.FORM_SUBMITTED, config: {} },
    steps: [
      {
        id: 'create',
        order: 0,
        action: WORKFLOW_ACTIONS.CREATE_QUOTE,
        config: {},
        human_review_required: false,
      },
      {
        id: 'email_confirm',
        order: 1,
        action: WORKFLOW_ACTIONS.SEND_EMAIL,
        config: {
          to: '{{client_email}}',
          subject: 'Demande de devis reçue',
          body: 'Merci pour votre demande. Nous vous contacterons rapidement.',
        },
        human_review_required: true,
      },
    ],
    human_review: {
      enabled: true,
      required_for: [WORKFLOW_ACTIONS.SEND_EMAIL],
    },
  },
};
