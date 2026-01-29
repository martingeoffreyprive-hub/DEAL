/**
 * Sprint 18: Localization NL/DE — Epic 10 Tests
 * Stories: 10.1 (i18n Framework), 10.2 (Dutch), 10.3 (German)
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// ============================================================================
// Story 10.1: i18n Framework Setup
// ============================================================================
describe('Story 10.1: i18n Framework Setup', () => {
  it('should have locale packs directory', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'lib', 'locale-packs', 'index.ts')
    )).toBe(true);
  });

  it('should have types with 5 locale codes', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'lib', 'locale-packs', 'types.ts'),
      'utf-8'
    );
    expect(src).toContain('fr-BE');
    expect(src).toContain('fr-FR');
    expect(src).toContain('fr-CH');
    expect(src).toContain('nl-BE');
    expect(src).toContain('de-BE');
  });

  it('should have LocalePack interface with all sections', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'lib', 'locale-packs', 'types.ts'),
      'utf-8'
    );
    expect(src).toContain('LocalePack');
    expect(src).toContain('TaxConfig');
    expect(src).toContain('CurrencyConfig');
    expect(src).toContain('LegalMentions');
    expect(src).toContain('VocabularyOverrides');
    expect(src).toContain('ComplianceRequirements');
  });

  it('should register all 5 locale packs', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'lib', 'locale-packs', 'index.ts'),
      'utf-8'
    );
    expect(src).toContain("'fr-BE': frBE");
    expect(src).toContain("'nl-BE': nlBE");
    expect(src).toContain("'de-BE': deBE");
  });

  it('should have locale detection function', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'lib', 'locale-packs', 'index.ts'),
      'utf-8'
    );
    expect(src).toContain('detectLocale');
    expect(src).toContain('vatNumber');
    expect(src).toContain('browserLocale');
  });

  it('should detect nl and de browser locales', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'lib', 'locale-packs', 'index.ts'),
      'utf-8'
    );
    expect(src).toContain("'nl-BE'");
    expect(src).toContain("'de-BE'");
    expect(src).toContain("startsWith('nl')");
    expect(src).toContain("startsWith('de')");
  });

  it('should have LocaleContext provider', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'contexts', 'locale-context.tsx')
    )).toBe(true);
  });

  it('should have locale selector component', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'components', 'locale', 'locale-selector.tsx')
    )).toBe(true);
  });

  it('should have compliance validation', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'lib', 'locale-packs', 'index.ts'),
      'utf-8'
    );
    expect(src).toContain('validateCompliance');
  });

  it('should have currency and date formatting helpers', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'lib', 'locale-packs', 'types.ts'),
      'utf-8'
    );
    expect(src).toContain('formatLocaleCurrency');
    expect(src).toContain('formatLocaleDate');
  });
});

// ============================================================================
// Story 10.2: Dutch Translation (nl-BE)
// ============================================================================
describe('Story 10.2: Dutch Translation', () => {
  let nlSrc: string;

  it('should have nl-be.ts locale pack', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'lib', 'locale-packs', 'nl-be.ts')
    )).toBe(true);
  });

  it('should have Dutch tax labels (BTW)', () => {
    nlSrc = fs.readFileSync(
      path.join(process.cwd(), 'src', 'lib', 'locale-packs', 'nl-be.ts'),
      'utf-8'
    );
    expect(nlSrc).toContain('BTW');
    expect(nlSrc).toContain('Vrijgesteld');
    expect(nlSrc).toContain('Superverlaagd');
  });

  it('should have Dutch vocabulary', () => {
    expect(nlSrc).toContain("quote: 'Offerte'");
    expect(nlSrc).toContain("invoice: 'Factuur'");
    expect(nlSrc).toContain("client: 'Klant'");
  });

  it('should have Dutch legal mentions', () => {
    expect(nlSrc).toContain('geldig gedurende 30 dagen');
    expect(nlSrc).toContain('Betaling binnen 30 dagen');
    expect(nlSrc).toContain('AVG');
  });

  it('should have Belgian-specific Dutch terms (KBO, RSZ)', () => {
    expect(nlSrc).toContain('KBO-nummer');
    expect(nlSrc).toContain('RSZ');
  });

  it('should have Dutch compliance rules', () => {
    expect(nlSrc).toContain('Belgische BTW-nummer');
    expect(nlSrc).toContain('BE0');
  });

  it('should have Belgium flag and name', () => {
    expect(nlSrc).toContain('Nederlands (België)');
    expect(nlSrc).toContain('🇧🇪');
  });
});

// ============================================================================
// Story 10.3: German Translation (de-BE)
// ============================================================================
describe('Story 10.3: German Translation', () => {
  let deSrc: string;

  it('should have de-be.ts locale pack', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'lib', 'locale-packs', 'de-be.ts')
    )).toBe(true);
  });

  it('should have German tax labels (MwSt.)', () => {
    deSrc = fs.readFileSync(
      path.join(process.cwd(), 'src', 'lib', 'locale-packs', 'de-be.ts'),
      'utf-8'
    );
    expect(deSrc).toContain('MwSt.');
    expect(deSrc).toContain('Befreit');
    expect(deSrc).toContain('Ermäßigt');
  });

  it('should have German vocabulary', () => {
    expect(deSrc).toContain("quote: 'Angebot'");
    expect(deSrc).toContain("invoice: 'Rechnung'");
    expect(deSrc).toContain("client: 'Kunde'");
  });

  it('should have German legal mentions', () => {
    expect(deSrc).toContain('30 Tage ab Ausstellungsdatum');
    expect(deSrc).toContain('Zahlung innerhalb von 30 Tagen');
    expect(deSrc).toContain('DSGVO');
  });

  it('should have Belgian-specific German terms (ZDU, LSS)', () => {
    expect(deSrc).toContain('ZDU-Nummer');
    expect(deSrc).toContain('LSS');
  });

  it('should have German compliance rules', () => {
    expect(deSrc).toContain('belgische MwSt.-Nummer');
    expect(deSrc).toContain('BE0');
  });

  it('should have Belgium flag and Ostbelgien context', () => {
    expect(deSrc).toContain('Deutsch (Belgien)');
    expect(deSrc).toContain('🇧🇪');
  });
});
