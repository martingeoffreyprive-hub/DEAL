// Integration Types
import type { Quote, Profile } from '@/types/database';

// Base integration interface
export interface Integration {
  id: string;
  name: string;
  category: 'signature' | 'crm' | 'accounting' | 'communication';
  description: string;
  logo: string;
  enabled: boolean;
}

// Integration connection status
export interface IntegrationConnection {
  id: string;
  user_id: string;
  integration_id: string;
  access_token: string;
  refresh_token?: string;
  expires_at?: string;
  metadata?: Record<string, unknown>;
  connected_at: string;
  last_sync_at?: string;
}

// E-Signature types
export interface SignatureRequest {
  quote_id: string;
  signer_email: string;
  signer_name: string;
  message?: string;
  expires_days?: number;
}

export interface SignatureResponse {
  success: boolean;
  envelope_id?: string;
  signing_url?: string;
  status?: 'sent' | 'delivered' | 'completed' | 'declined' | 'voided';
  error?: string;
}

export interface SignatureWebhookEvent {
  event_type: 'envelope-sent' | 'envelope-delivered' | 'envelope-completed' | 'envelope-declined';
  envelope_id: string;
  quote_id: string;
  timestamp: string;
  signer_email?: string;
}

// CRM types
export interface CRMContact {
  id?: string;
  email: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  custom_properties?: Record<string, unknown>;
}

export interface CRMDeal {
  id?: string;
  name: string;
  amount: number;
  stage: string;
  contact_id?: string;
  quote_id?: string;
  close_date?: string;
  custom_properties?: Record<string, unknown>;
}

export interface CRMSyncResult {
  success: boolean;
  contact_id?: string;
  deal_id?: string;
  error?: string;
}

// Accounting types
export interface AccountingInvoice {
  quote_id: string;
  customer_id?: string;
  customer_name: string;
  customer_email: string;
  line_items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
  }>;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  due_date?: string;
  notes?: string;
}

export interface AccountingInvoiceResponse {
  success: boolean;
  invoice_id?: string;
  invoice_number?: string;
  invoice_url?: string;
  error?: string;
}

// Generic integration client interface
export interface IntegrationClient<T = unknown> {
  connect(credentials: T): Promise<IntegrationConnection>;
  disconnect(connection_id: string): Promise<void>;
  isConnected(): Promise<boolean>;
  refreshToken?(): Promise<void>;
}

// E-Signature client interface
export interface SignatureClient extends IntegrationClient {
  sendForSignature(request: SignatureRequest, quote: Quote, profile: Profile): Promise<SignatureResponse>;
  getSignatureStatus(envelope_id: string): Promise<SignatureResponse>;
  downloadSignedDocument(envelope_id: string): Promise<Buffer>;
  cancelSignatureRequest(envelope_id: string): Promise<void>;
}

// CRM client interface
export interface CRMClient extends IntegrationClient {
  syncContact(contact: CRMContact): Promise<CRMSyncResult>;
  syncDeal(deal: CRMDeal): Promise<CRMSyncResult>;
  getContact(id: string): Promise<CRMContact | null>;
  getDeal(id: string): Promise<CRMDeal | null>;
  searchContacts(query: string): Promise<CRMContact[]>;
}

// Accounting client interface
export interface AccountingClient extends IntegrationClient {
  createInvoice(invoice: AccountingInvoice): Promise<AccountingInvoiceResponse>;
  getInvoice(invoice_id: string): Promise<AccountingInvoice | null>;
  syncCustomer(contact: CRMContact): Promise<{ customer_id: string }>;
}
