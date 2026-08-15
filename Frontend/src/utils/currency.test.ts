import { describe, expect, it } from 'vitest';
import { formatCOP } from './currency';

describe('formatCOP', () => {
  it('formatea sin decimales', () => {
    expect(formatCOP(3000)).not.toMatch(/,\d{2}$/);
  });

  it('incluye el monto formateado con separador de miles', () => {
    expect(formatCOP(12500)).toContain('12.500');
  });

  it('formatea $0 correctamente', () => {
    expect(formatCOP(0)).toContain('0');
  });
});
