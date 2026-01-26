// QuickBooks Integration
// Accounting and invoicing with QuickBooks Online

import type {
  AccountingClient,
  AccountingInvoice,
  AccountingInvoiceResponse,
  CRMContact,
  IntegrationConnection,
} from './types';

// QuickBooks API configuration
const QUICKBOOKS_CONFIG = {
  authServer: 'https://appcenter.intuit.com/connect/oauth2',
  apiBase: process.env.QUICKBOOKS_SANDBOX === 'true'
    ? 'https://sandbox-quickbooks.api.intuit.com'
    : 'https://quickbooks.api.intuit.com',
  clientId: process.env.QUICKBOOKS_CLIENT_ID || '',
  clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET || '',
  realmId: process.env.QUICKBOOKS_REALM_ID || '',
};

export class QuickBooksClient implements AccountingClient {
  private accessToken: string | null = null;
  private connection: IntegrationConnection | null = null;
  private realmId: string = '';

  constructor(connection?: IntegrationConnection) {
    if (connection) {
      this.connection = connection;
      this.accessToken = connection.access_token;
      this.realmId = (connection.metadata as any)?.realmId || QUICKBOOKS_CONFIG.realmId;
    }
  }

  async connect(credentials: { code: string; redirectUri: string; realmId: string }): Promise<IntegrationConnection> {
    const tokenResponse = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'Authorization': `Basic ${Buffer.from(
          `${QUICKBOOKS_CONFIG.clientId}:${QUICKBOOKS_CONFIG.clientSecret}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: credentials.code,
        redirect_uri: credentials.redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to connect to QuickBooks');
    }

    const tokenData = await tokenResponse.json();

    const connection: IntegrationConnection = {
      id: crypto.randomUUID(),
      user_id: '',
      integration_id: 'quickbooks',
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
      metadata: { realmId: credentials.realmId },
      connected_at: new Date().toISOString(),
    };

    this.connection = connection;
    this.accessToken = tokenData.access_token;
    this.realmId = credentials.realmId;

    return connection;
  }

  async disconnect(connection_id: string): Promise<void> {
    if (this.accessToken) {
      // Revoke token
      await fetch('https://developer.api.intuit.com/v2/oauth2/tokens/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(
            `${QUICKBOOKS_CONFIG.clientId}:${QUICKBOOKS_CONFIG.clientSecret}`
          ).toString('base64')}`,
        },
        body: new URLSearchParams({
          token: this.accessToken,
        }),
      });
    }

    this.accessToken = null;
    this.connection = null;
  }

  async isConnected(): Promise<boolean> {
    if (!this.accessToken || !this.connection) return false;

    if (this.connection.expires_at) {
      const expiresAt = new Date(this.connection.expires_at);
      if (expiresAt < new Date()) {
        return false;
      }
    }

    return true;
  }

  async refreshToken(): Promise<void> {
    if (!this.connection?.refresh_token) {
      throw new Error('No refresh token available');
    }

    const tokenResponse = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'Authorization': `Basic ${Buffer.from(
          `${QUICKBOOKS_CONFIG.clientId}:${QUICKBOOKS_CONFIG.clientSecret}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.connection.refresh_token,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to refresh QuickBooks token');
    }

    const tokenData = await tokenResponse.json();
    this.accessToken = tokenData.access_token;

    if (this.connection) {
      this.connection.access_token = tokenData.access_token;
      this.connection.refresh_token = tokenData.refresh_token || this.connection.refresh_token;
      this.connection.expires_at = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();
    }
  }

  async createInvoice(invoice: AccountingInvoice): Promise<AccountingInvoiceResponse> {
    if (!this.accessToken) {
      return { success: false, error: 'Not connected to QuickBooks' };
    }

    // Demo mode
    if (process.env.NODE_ENV === 'development') {
      return {
        success: true,
        invoice_id: `demo_invoice_${Date.now()}`,
        invoice_number: `INV-${Date.now()}`,
      };
    }

    try {
      // First, ensure customer exists or create one
      const customerResult = await this.syncCustomer({
        email: invoice.customer_email,
        first_name: invoice.customer_name.split(' ')[0],
        last_name: invoice.customer_name.split(' ').slice(1).join(' '),
      });

      // Prepare invoice data
      const invoiceData = {
        CustomerRef: {
          value: customerResult.customer_id,
        },
        Line: invoice.line_items.map((item, index) => ({
          Amount: item.amount,
          DetailType: 'SalesItemLineDetail',
          SalesItemLineDetail: {
            ItemRef: { value: '1' }, // Default item, should be configured
            Qty: item.quantity,
            UnitPrice: item.unit_price,
          },
          Description: item.description,
          LineNum: index + 1,
        })),
        TxnTaxDetail: {
          TotalTax: invoice.tax_amount,
        },
        DueDate: invoice.due_date,
        CustomerMemo: { value: invoice.notes || '' },
      };

      const response = await fetch(
        `${QUICKBOOKS_CONFIG.apiBase}/v3/company/${this.realmId}/invoice`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${this.accessToken}`,
          },
          body: JSON.stringify(invoiceData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.Fault?.Error?.[0]?.Message || 'Failed to create invoice' };
      }

      const data = await response.json();

      return {
        success: true,
        invoice_id: data.Invoice.Id,
        invoice_number: data.Invoice.DocNumber,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getInvoice(invoice_id: string): Promise<AccountingInvoice | null> {
    if (!this.accessToken) return null;

    try {
      const response = await fetch(
        `${QUICKBOOKS_CONFIG.apiBase}/v3/company/${this.realmId}/invoice/${invoice_id}`,
        {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) return null;

      const data = await response.json();
      const invoice = data.Invoice;

      return {
        quote_id: '', // Not stored in QuickBooks
        customer_id: invoice.CustomerRef?.value,
        customer_name: invoice.CustomerRef?.name || '',
        customer_email: '', // Would need to fetch customer details
        line_items: invoice.Line?.filter((line: any) => line.DetailType === 'SalesItemLineDetail')
          .map((line: any) => ({
            description: line.Description || '',
            quantity: line.SalesItemLineDetail?.Qty || 0,
            unit_price: line.SalesItemLineDetail?.UnitPrice || 0,
            amount: line.Amount || 0,
          })) || [],
        subtotal: invoice.TotalAmt - (invoice.TxnTaxDetail?.TotalTax || 0),
        tax_rate: 0, // Would need to calculate
        tax_amount: invoice.TxnTaxDetail?.TotalTax || 0,
        total: invoice.TotalAmt,
        due_date: invoice.DueDate,
        notes: invoice.CustomerMemo?.value,
      };
    } catch {
      return null;
    }
  }

  async syncCustomer(contact: CRMContact): Promise<{ customer_id: string }> {
    if (!this.accessToken) {
      throw new Error('Not connected to QuickBooks');
    }

    // Demo mode
    if (process.env.NODE_ENV === 'development') {
      return { customer_id: `demo_customer_${Date.now()}` };
    }

    try {
      // Search for existing customer by email
      const searchResponse = await fetch(
        `${QUICKBOOKS_CONFIG.apiBase}/v3/company/${this.realmId}/query?query=` +
        encodeURIComponent(`SELECT * FROM Customer WHERE PrimaryEmailAddr = '${contact.email}'`),
        {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      const searchData = await searchResponse.json();

      if (searchData.QueryResponse?.Customer?.length > 0) {
        return { customer_id: searchData.QueryResponse.Customer[0].Id };
      }

      // Create new customer
      const customerData = {
        DisplayName: contact.company || `${contact.first_name || ''} ${contact.last_name || ''}`.trim(),
        PrimaryEmailAddr: { Address: contact.email },
        GivenName: contact.first_name,
        FamilyName: contact.last_name,
        CompanyName: contact.company,
        PrimaryPhone: contact.phone ? { FreeFormNumber: contact.phone } : undefined,
        BillAddr: contact.address ? {
          Line1: contact.address,
          City: contact.city,
          PostalCode: contact.postal_code,
          Country: contact.country,
        } : undefined,
      };

      const createResponse = await fetch(
        `${QUICKBOOKS_CONFIG.apiBase}/v3/company/${this.realmId}/customer`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${this.accessToken}`,
          },
          body: JSON.stringify(customerData),
        }
      );

      if (!createResponse.ok) {
        throw new Error('Failed to create customer');
      }

      const createData = await createResponse.json();
      return { customer_id: createData.Customer.Id };
    } catch (error) {
      throw error;
    }
  }
}

// Helper to generate QuickBooks OAuth URL
export function getQuickBooksAuthUrl(redirectUri: string, state?: string): string {
  const scopes = 'com.intuit.quickbooks.accounting';

  const params = new URLSearchParams({
    client_id: QUICKBOOKS_CONFIG.clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes,
    ...(state && { state }),
  });

  return `${QUICKBOOKS_CONFIG.authServer}?${params.toString()}`;
}
