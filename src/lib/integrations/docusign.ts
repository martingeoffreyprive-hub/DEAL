// DocuSign Integration
// E-Signature for quotes

import type {
  SignatureClient,
  SignatureRequest,
  SignatureResponse,
  IntegrationConnection,
} from './types';
import type { Quote, Profile } from '@/types/database';

// DocuSign API configuration
const DOCUSIGN_CONFIG = {
  authServer: process.env.DOCUSIGN_AUTH_SERVER || 'https://account-d.docusign.com',
  apiBase: process.env.DOCUSIGN_API_BASE || 'https://demo.docusign.net/restapi',
  integrationKey: process.env.DOCUSIGN_INTEGRATION_KEY || '',
  secretKey: process.env.DOCUSIGN_SECRET_KEY || '',
  accountId: process.env.DOCUSIGN_ACCOUNT_ID || '',
};

export class DocuSignClient implements SignatureClient {
  private accessToken: string | null = null;
  private connection: IntegrationConnection | null = null;

  constructor(connection?: IntegrationConnection) {
    if (connection) {
      this.connection = connection;
      this.accessToken = connection.access_token;
    }
  }

  async connect(credentials: { code: string; redirectUri: string }): Promise<IntegrationConnection> {
    // Exchange authorization code for access token
    const tokenResponse = await fetch(`${DOCUSIGN_CONFIG.authServer}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(
          `${DOCUSIGN_CONFIG.integrationKey}:${DOCUSIGN_CONFIG.secretKey}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: credentials.code,
        redirect_uri: credentials.redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to connect to DocuSign');
    }

    const tokenData = await tokenResponse.json();

    const connection: IntegrationConnection = {
      id: crypto.randomUUID(),
      user_id: '', // Will be set by the caller
      integration_id: 'docusign',
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
    // Revoke token if needed
    this.accessToken = null;
    this.connection = null;
  }

  async isConnected(): Promise<boolean> {
    if (!this.accessToken || !this.connection) return false;

    // Check if token is expired
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

    const tokenResponse = await fetch(`${DOCUSIGN_CONFIG.authServer}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(
          `${DOCUSIGN_CONFIG.integrationKey}:${DOCUSIGN_CONFIG.secretKey}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.connection.refresh_token,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to refresh DocuSign token');
    }

    const tokenData = await tokenResponse.json();
    this.accessToken = tokenData.access_token;

    if (this.connection) {
      this.connection.access_token = tokenData.access_token;
      this.connection.refresh_token = tokenData.refresh_token || this.connection.refresh_token;
      this.connection.expires_at = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();
    }
  }

  async sendForSignature(
    request: SignatureRequest,
    quote: Quote,
    profile: Profile
  ): Promise<SignatureResponse> {
    if (!this.accessToken) {
      return { success: false, error: 'Not connected to DocuSign' };
    }

    try {
      // Create envelope definition
      const envelopeDefinition = {
        emailSubject: `Devis ${quote.quote_number} - Signature requise`,
        emailBlurb: request.message || `Veuillez signer le devis ${quote.quote_number} de ${profile.company_name}.`,
        status: 'sent',
        recipients: {
          signers: [
            {
              email: request.signer_email,
              name: request.signer_name,
              recipientId: '1',
              routingOrder: '1',
              tabs: {
                signHereTabs: [
                  {
                    documentId: '1',
                    pageNumber: '1',
                    xPosition: '100',
                    yPosition: '700',
                  },
                ],
                dateSignedTabs: [
                  {
                    documentId: '1',
                    pageNumber: '1',
                    xPosition: '300',
                    yPosition: '700',
                  },
                ],
              },
            },
          ],
        },
        documents: [
          {
            documentId: '1',
            name: `Devis_${quote.quote_number}.pdf`,
            fileExtension: 'pdf',
            // Note: In production, you would generate the PDF and include it here
            // documentBase64: base64EncodedPdf,
          },
        ],
      };

      // For demo purposes, we'll return a mock response
      // In production, you would make the actual API call
      if (process.env.NODE_ENV === 'development') {
        return {
          success: true,
          envelope_id: `demo_${quote.id}_${Date.now()}`,
          status: 'sent',
        };
      }

      const response = await fetch(
        `${DOCUSIGN_CONFIG.apiBase}/v2.1/accounts/${DOCUSIGN_CONFIG.accountId}/envelopes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.accessToken}`,
          },
          body: JSON.stringify(envelopeDefinition),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to send envelope' };
      }

      const envelope = await response.json();

      return {
        success: true,
        envelope_id: envelope.envelopeId,
        status: 'sent',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getSignatureStatus(envelope_id: string): Promise<SignatureResponse> {
    if (!this.accessToken) {
      return { success: false, error: 'Not connected to DocuSign' };
    }

    // Demo mode
    if (process.env.NODE_ENV === 'development' && envelope_id.startsWith('demo_')) {
      return {
        success: true,
        envelope_id,
        status: 'sent',
      };
    }

    try {
      const response = await fetch(
        `${DOCUSIGN_CONFIG.apiBase}/v2.1/accounts/${DOCUSIGN_CONFIG.accountId}/envelopes/${envelope_id}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        return { success: false, error: 'Failed to get envelope status' };
      }

      const envelope = await response.json();

      return {
        success: true,
        envelope_id,
        status: envelope.status as SignatureResponse['status'],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async downloadSignedDocument(envelope_id: string): Promise<Buffer> {
    if (!this.accessToken) {
      throw new Error('Not connected to DocuSign');
    }

    const response = await fetch(
      `${DOCUSIGN_CONFIG.apiBase}/v2.1/accounts/${DOCUSIGN_CONFIG.accountId}/envelopes/${envelope_id}/documents/combined`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to download signed document');
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  async cancelSignatureRequest(envelope_id: string): Promise<void> {
    if (!this.accessToken) {
      throw new Error('Not connected to DocuSign');
    }

    const response = await fetch(
      `${DOCUSIGN_CONFIG.apiBase}/v2.1/accounts/${DOCUSIGN_CONFIG.accountId}/envelopes/${envelope_id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          status: 'voided',
          voidedReason: 'Cancelled by user',
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to cancel signature request');
    }
  }
}

// Helper to generate DocuSign OAuth URL
export function getDocuSignAuthUrl(redirectUri: string, state?: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    scope: 'signature',
    client_id: DOCUSIGN_CONFIG.integrationKey,
    redirect_uri: redirectUri,
    ...(state && { state }),
  });

  return `${DOCUSIGN_CONFIG.authServer}/oauth/auth?${params.toString()}`;
}
