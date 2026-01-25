import { describe, it, expect } from 'vitest';
import {
  generateEPCPayload,
  generateEPCQRCode,
  isValidEPCData,
  formatIBAN,
  type EPCQRData,
} from '../pdf/epc-qr';

describe('EPC QR Code Generator', () => {
  describe('generateEPCPayload', () => {
    it('should generate correct EPC payload format', () => {
      const data: EPCQRData = {
        beneficiaryName: 'Mon Entreprise SPRL',
        iban: 'BE68 5390 0754 7034',
        bic: 'GKCCBEBB',
        amount: 1234.56,
        currency: 'EUR',
        remittanceInfo: 'Devis DEV-2026-001',
      };

      const payload = generateEPCPayload(data);
      const lines = payload.split('\n');

      expect(lines[0]).toBe('BCD');
      expect(lines[1]).toBe('002');
      expect(lines[2]).toBe('1');
      expect(lines[3]).toBe('SCT');
      expect(lines[4]).toBe('GKCCBEBB');
      expect(lines[5]).toBe('Mon Entreprise SPRL');
      expect(lines[6]).toBe('BE68539007547034');
      expect(lines[7]).toBe('EUR1234.56');
      expect(lines[10]).toBe('Devis DEV-2026-001');
    });

    it('should handle missing BIC', () => {
      const data: EPCQRData = {
        beneficiaryName: 'Test Company',
        iban: 'FR7630006000011234567890189',
        amount: 100,
        currency: 'EUR',
      };

      const payload = generateEPCPayload(data);
      const lines = payload.split('\n');

      expect(lines[4]).toBe(''); // BIC should be empty
    });

    it('should truncate long beneficiary names', () => {
      const data: EPCQRData = {
        beneficiaryName: 'A'.repeat(100), // 100 chars
        iban: 'BE68539007547034',
        amount: 50,
        currency: 'EUR',
      };

      const payload = generateEPCPayload(data);
      const lines = payload.split('\n');

      expect(lines[5].length).toBe(70); // Max 70 chars
    });

    it('should handle CHF currency', () => {
      const data: EPCQRData = {
        beneficiaryName: 'Swiss Company SA',
        iban: 'CH5604835012345678009',
        amount: 500.25,
        currency: 'CHF',
      };

      const payload = generateEPCPayload(data);
      const lines = payload.split('\n');

      expect(lines[7]).toBe('CHF500.25');
    });
  });

  describe('generateEPCQRCode', () => {
    it('should generate a data URL', async () => {
      const data: EPCQRData = {
        beneficiaryName: 'Test',
        iban: 'BE68539007547034',
        amount: 100,
        currency: 'EUR',
      };

      const dataUrl = await generateEPCQRCode(data);

      expect(dataUrl).toMatch(/^data:image\/png;base64,/);
    });

    it('should respect size option', async () => {
      const data: EPCQRData = {
        beneficiaryName: 'Test',
        iban: 'BE68539007547034',
        amount: 100,
        currency: 'EUR',
      };

      const smallQR = await generateEPCQRCode(data, { size: 100 });
      const largeQR = await generateEPCQRCode(data, { size: 200 });

      // Larger QR should have more data
      expect(largeQR.length).toBeGreaterThan(smallQR.length);
    });
  });

  describe('isValidEPCData', () => {
    it('should validate complete data', () => {
      const data: EPCQRData = {
        beneficiaryName: 'Test',
        iban: 'BE68539007547034',
        amount: 100,
        currency: 'EUR',
      };

      expect(isValidEPCData(data)).toBe(true);
    });

    it('should reject empty beneficiary name', () => {
      expect(isValidEPCData({
        beneficiaryName: '',
        iban: 'BE68539007547034',
        amount: 100,
        currency: 'EUR',
      })).toBe(false);
    });

    it('should reject short IBAN', () => {
      expect(isValidEPCData({
        beneficiaryName: 'Test',
        iban: 'BE123',
        amount: 100,
        currency: 'EUR',
      })).toBe(false);
    });

    it('should reject zero amount', () => {
      expect(isValidEPCData({
        beneficiaryName: 'Test',
        iban: 'BE68539007547034',
        amount: 0,
        currency: 'EUR',
      })).toBe(false);
    });

    it('should reject negative amount', () => {
      expect(isValidEPCData({
        beneficiaryName: 'Test',
        iban: 'BE68539007547034',
        amount: -100,
        currency: 'EUR',
      })).toBe(false);
    });

    it('should reject invalid currency', () => {
      expect(isValidEPCData({
        beneficiaryName: 'Test',
        iban: 'BE68539007547034',
        amount: 100,
        currency: 'USD' as any,
      })).toBe(false);
    });
  });

  describe('formatIBAN', () => {
    it('should format IBAN with spaces', () => {
      expect(formatIBAN('BE68539007547034')).toBe('BE68 5390 0754 7034');
    });

    it('should handle already spaced IBAN', () => {
      expect(formatIBAN('BE68 5390 0754 7034')).toBe('BE68 5390 0754 7034');
    });

    it('should uppercase the IBAN', () => {
      expect(formatIBAN('be68539007547034')).toBe('BE68 5390 0754 7034');
    });

    it('should handle Swiss IBAN', () => {
      expect(formatIBAN('CH5604835012345678009')).toBe('CH56 0483 5012 3456 7800 9');
    });
  });
});
