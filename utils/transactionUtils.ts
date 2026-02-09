
import { Transaction, TransactionType, PaymentMethod } from '../types';

export interface ProjectedValue {
  date: string;
  value: number;
  originalTransaction: Transaction;
  installmentIndex: number;
  isRecurring?: boolean;
}

export const projectTransaction = (
  t: Transaction,
  paymentMethods: PaymentMethod[]
): ProjectedValue[] => {
  const method = paymentMethods.find(pm => pm.id === t.paymentMethodId);
  const isCard = method?.name.toLowerCase().includes('cartão') || method?.name.toLowerCase().includes('crédito');
  const isInstallment = t.repeatType === 'PARCELADO' && (t.installments || 1) > 1;
  const isFixed = t.repeatType === 'FIXO';
  
  const projections: ProjectedValue[] = [];

  if (isFixed) {
    // Para lançamentos fixos, projetamos por 60 meses (5 anos)
    const numMonths = 60;
    for (let i = 0; i < numMonths; i++) {
      const baseDate = new Date(t.date);
      // Adiciona i meses mantendo o dia se possível
      baseDate.setMonth(baseDate.getMonth() + i);
      
      projections.push({
        date: baseDate.toISOString().split('T')[0],
        value: t.value,
        originalTransaction: t,
        installmentIndex: i + 1,
        isRecurring: true
      });
    }
  } else {
    // Lógica para Parcelados ou Únicos
    const numInstallments = isInstallment ? (t.installments || 1) : 1;
    const valPerInstallment = t.value / numInstallments;

    for (let i = 0; i < numInstallments; i++) {
      const baseDate = new Date(t.date);
      
      // Se for cartão, a primeira parcela já começa com +30 dias
      // Se for parcelado, cada parcela subsequente adiciona +30 dias
      const daysToAdd = (isCard ? 30 : 0) + (i * 30);
      baseDate.setDate(baseDate.getDate() + daysToAdd);

      projections.push({
        date: baseDate.toISOString().split('T')[0],
        value: valPerInstallment,
        originalTransaction: t,
        installmentIndex: i + 1
      });
    }
  }

  return projections;
};
