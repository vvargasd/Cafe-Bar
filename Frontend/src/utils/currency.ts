// Formato único de moneda para toda la app: pesos colombianos, sin decimales
const copFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export const formatCOP = (amount: number): string => copFormatter.format(amount);
