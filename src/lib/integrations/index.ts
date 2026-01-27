// Third-party Integrations Hub
// Enterprise-grade integrations for DEAL

export * from './types';
export * from './docusign';
export * from './hubspot';
export * from './quickbooks';

// Integration registry
export const AVAILABLE_INTEGRATIONS = {
  // E-Signature
  docusign: {
    id: 'docusign',
    name: 'DocuSign',
    category: 'signature',
    description: 'Signature électronique des devis',
    logo: '/integrations/docusign.svg',
    enabled: true,
  },
  hellosign: {
    id: 'hellosign',
    name: 'HelloSign',
    category: 'signature',
    description: 'Signature électronique par Dropbox',
    logo: '/integrations/hellosign.svg',
    enabled: false,
  },

  // CRM
  hubspot: {
    id: 'hubspot',
    name: 'HubSpot',
    category: 'crm',
    description: 'Synchronisation des contacts et deals',
    logo: '/integrations/hubspot.svg',
    enabled: true,
  },
  salesforce: {
    id: 'salesforce',
    name: 'Salesforce',
    category: 'crm',
    description: 'CRM entreprise leader',
    logo: '/integrations/salesforce.svg',
    enabled: false,
  },
  pipedrive: {
    id: 'pipedrive',
    name: 'Pipedrive',
    category: 'crm',
    description: 'CRM pour équipes commerciales',
    logo: '/integrations/pipedrive.svg',
    enabled: false,
  },

  // Comptabilité
  quickbooks: {
    id: 'quickbooks',
    name: 'QuickBooks',
    category: 'accounting',
    description: 'Comptabilité et facturation',
    logo: '/integrations/quickbooks.svg',
    enabled: true,
  },
  xero: {
    id: 'xero',
    name: 'Xero',
    category: 'accounting',
    description: 'Comptabilité cloud',
    logo: '/integrations/xero.svg',
    enabled: false,
  },
  sage: {
    id: 'sage',
    name: 'Sage',
    category: 'accounting',
    description: 'Solutions de gestion',
    logo: '/integrations/sage.svg',
    enabled: false,
  },

  // Communication
  slack: {
    id: 'slack',
    name: 'Slack',
    category: 'communication',
    description: 'Notifications et alertes',
    logo: '/integrations/slack.svg',
    enabled: false,
  },
  teams: {
    id: 'teams',
    name: 'Microsoft Teams',
    category: 'communication',
    description: 'Notifications Microsoft Teams',
    logo: '/integrations/teams.svg',
    enabled: false,
  },
} as const;

export type IntegrationId = keyof typeof AVAILABLE_INTEGRATIONS;
export type IntegrationCategory = 'signature' | 'crm' | 'accounting' | 'communication';

export function getIntegrationsByCategory(category: IntegrationCategory) {
  return Object.values(AVAILABLE_INTEGRATIONS).filter(
    (integration) => integration.category === category
  );
}

export function getEnabledIntegrations() {
  return Object.values(AVAILABLE_INTEGRATIONS).filter(
    (integration) => integration.enabled
  );
}
