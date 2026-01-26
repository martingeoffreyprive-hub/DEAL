// HubSpot CRM Integration
// Sync contacts and deals with HubSpot

import type {
  CRMClient,
  CRMContact,
  CRMDeal,
  CRMSyncResult,
  IntegrationConnection,
} from './types';

// HubSpot API configuration
const HUBSPOT_CONFIG = {
  apiBase: 'https://api.hubapi.com',
  clientId: process.env.HUBSPOT_CLIENT_ID || '',
  clientSecret: process.env.HUBSPOT_CLIENT_SECRET || '',
};

export class HubSpotClient implements CRMClient {
  private accessToken: string | null = null;
  private connection: IntegrationConnection | null = null;

  constructor(connection?: IntegrationConnection) {
    if (connection) {
      this.connection = connection;
      this.accessToken = connection.access_token;
    }
  }

  async connect(credentials: { code: string; redirectUri: string }): Promise<IntegrationConnection> {
    const tokenResponse = await fetch('https://api.hubapi.com/oauth/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: HUBSPOT_CONFIG.clientId,
        client_secret: HUBSPOT_CONFIG.clientSecret,
        redirect_uri: credentials.redirectUri,
        code: credentials.code,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to connect to HubSpot');
    }

    const tokenData = await tokenResponse.json();

    const connection: IntegrationConnection = {
      id: crypto.randomUUID(),
      user_id: '',
      integration_id: 'hubspot',
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
      connected_at: new Date().toISOString(),
    };

    this.connection = connection;
    this.accessToken = tokenData.access_token;

    return connection;
  }

  async disconnect(connection_id: string): Promise<void> {
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

    const tokenResponse = await fetch('https://api.hubapi.com/oauth/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: HUBSPOT_CONFIG.clientId,
        client_secret: HUBSPOT_CONFIG.clientSecret,
        refresh_token: this.connection.refresh_token,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to refresh HubSpot token');
    }

    const tokenData = await tokenResponse.json();
    this.accessToken = tokenData.access_token;

    if (this.connection) {
      this.connection.access_token = tokenData.access_token;
      this.connection.refresh_token = tokenData.refresh_token || this.connection.refresh_token;
      this.connection.expires_at = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();
    }
  }

  async syncContact(contact: CRMContact): Promise<CRMSyncResult> {
    if (!this.accessToken) {
      return { success: false, error: 'Not connected to HubSpot' };
    }

    // Demo mode
    if (process.env.NODE_ENV === 'development') {
      return {
        success: true,
        contact_id: `demo_contact_${Date.now()}`,
      };
    }

    try {
      // First, search for existing contact by email
      const searchResponse = await fetch(
        `${HUBSPOT_CONFIG.apiBase}/crm/v3/objects/contacts/search`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.accessToken}`,
          },
          body: JSON.stringify({
            filterGroups: [
              {
                filters: [
                  {
                    propertyName: 'email',
                    operator: 'EQ',
                    value: contact.email,
                  },
                ],
              },
            ],
          }),
        }
      );

      const searchData = await searchResponse.json();

      // Prepare contact properties
      const properties = {
        email: contact.email,
        firstname: contact.first_name || '',
        lastname: contact.last_name || '',
        company: contact.company || '',
        phone: contact.phone || '',
        address: contact.address || '',
        city: contact.city || '',
        zip: contact.postal_code || '',
        country: contact.country || '',
      };

      let contactId: string;

      if (searchData.results?.length > 0) {
        // Update existing contact
        contactId = searchData.results[0].id;
        await fetch(
          `${HUBSPOT_CONFIG.apiBase}/crm/v3/objects/contacts/${contactId}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.accessToken}`,
            },
            body: JSON.stringify({ properties }),
          }
        );
      } else {
        // Create new contact
        const createResponse = await fetch(
          `${HUBSPOT_CONFIG.apiBase}/crm/v3/objects/contacts`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.accessToken}`,
            },
            body: JSON.stringify({ properties }),
          }
        );

        if (!createResponse.ok) {
          const error = await createResponse.json();
          return { success: false, error: error.message || 'Failed to create contact' };
        }

        const createData = await createResponse.json();
        contactId = createData.id;
      }

      return { success: true, contact_id: contactId };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async syncDeal(deal: CRMDeal): Promise<CRMSyncResult> {
    if (!this.accessToken) {
      return { success: false, error: 'Not connected to HubSpot' };
    }

    // Demo mode
    if (process.env.NODE_ENV === 'development') {
      return {
        success: true,
        deal_id: `demo_deal_${Date.now()}`,
      };
    }

    try {
      const properties = {
        dealname: deal.name,
        amount: deal.amount.toString(),
        dealstage: this.mapDealStage(deal.stage),
        closedate: deal.close_date || undefined,
        pipeline: 'default',
      };

      if (deal.id) {
        // Update existing deal
        const response = await fetch(
          `${HUBSPOT_CONFIG.apiBase}/crm/v3/objects/deals/${deal.id}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.accessToken}`,
            },
            body: JSON.stringify({ properties }),
          }
        );

        if (!response.ok) {
          return { success: false, error: 'Failed to update deal' };
        }

        return { success: true, deal_id: deal.id };
      } else {
        // Create new deal
        const response = await fetch(
          `${HUBSPOT_CONFIG.apiBase}/crm/v3/objects/deals`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.accessToken}`,
            },
            body: JSON.stringify({ properties }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          return { success: false, error: error.message || 'Failed to create deal' };
        }

        const data = await response.json();

        // Associate deal with contact if contact_id is provided
        if (deal.contact_id) {
          await fetch(
            `${HUBSPOT_CONFIG.apiBase}/crm/v3/objects/deals/${data.id}/associations/contacts/${deal.contact_id}/deal_to_contact`,
            {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${this.accessToken}`,
              },
            }
          );
        }

        return { success: true, deal_id: data.id };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getContact(id: string): Promise<CRMContact | null> {
    if (!this.accessToken) return null;

    try {
      const response = await fetch(
        `${HUBSPOT_CONFIG.apiBase}/crm/v3/objects/contacts/${id}?properties=email,firstname,lastname,company,phone,address,city,zip,country`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) return null;

      const data = await response.json();
      return {
        id: data.id,
        email: data.properties.email,
        first_name: data.properties.firstname,
        last_name: data.properties.lastname,
        company: data.properties.company,
        phone: data.properties.phone,
        address: data.properties.address,
        city: data.properties.city,
        postal_code: data.properties.zip,
        country: data.properties.country,
      };
    } catch {
      return null;
    }
  }

  async getDeal(id: string): Promise<CRMDeal | null> {
    if (!this.accessToken) return null;

    try {
      const response = await fetch(
        `${HUBSPOT_CONFIG.apiBase}/crm/v3/objects/deals/${id}?properties=dealname,amount,dealstage,closedate`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) return null;

      const data = await response.json();
      return {
        id: data.id,
        name: data.properties.dealname,
        amount: parseFloat(data.properties.amount) || 0,
        stage: data.properties.dealstage,
        close_date: data.properties.closedate,
      };
    } catch {
      return null;
    }
  }

  async searchContacts(query: string): Promise<CRMContact[]> {
    if (!this.accessToken) return [];

    try {
      const response = await fetch(
        `${HUBSPOT_CONFIG.apiBase}/crm/v3/objects/contacts/search`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.accessToken}`,
          },
          body: JSON.stringify({
            query,
            properties: ['email', 'firstname', 'lastname', 'company', 'phone'],
            limit: 10,
          }),
        }
      );

      if (!response.ok) return [];

      const data = await response.json();
      return data.results.map((result: any) => ({
        id: result.id,
        email: result.properties.email,
        first_name: result.properties.firstname,
        last_name: result.properties.lastname,
        company: result.properties.company,
        phone: result.properties.phone,
      }));
    } catch {
      return [];
    }
  }

  private mapDealStage(stage: string): string {
    // Map QuoteVoice status to HubSpot deal stages
    const stageMap: Record<string, string> = {
      draft: 'appointmentscheduled',
      sent: 'qualifiedtobuy',
      accepted: 'presentationscheduled',
      rejected: 'closedlost',
      finalized: 'closedwon',
    };
    return stageMap[stage] || 'appointmentscheduled';
  }
}

// Helper to generate HubSpot OAuth URL
export function getHubSpotAuthUrl(redirectUri: string, state?: string): string {
  const scopes = [
    'crm.objects.contacts.read',
    'crm.objects.contacts.write',
    'crm.objects.deals.read',
    'crm.objects.deals.write',
  ].join(' ');

  const params = new URLSearchParams({
    client_id: HUBSPOT_CONFIG.clientId,
    redirect_uri: redirectUri,
    scope: scopes,
    ...(state && { state }),
  });

  return `https://app.hubspot.com/oauth/authorize?${params.toString()}`;
}
