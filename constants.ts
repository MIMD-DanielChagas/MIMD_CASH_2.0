
import { Category, PaymentMethod, Account, Origin } from './types';

export const INITIAL_INCOME_CATEGORIES: Category[] = [
  // Hospedagem
  { id: '1', name: 'Chalé UH 1', parentId: 'hospedagem' },
  { id: '2', name: 'Chalé UH 2', parentId: 'hospedagem' },
  { id: '3', name: 'Chalé UH 3', parentId: 'hospedagem' },
  { id: '6', name: 'Tenda Bali', parentId: 'hospedagem' },
  { id: '7', name: 'Tenda Mauí', parentId: 'hospedagem' },
  { id: '8', name: 'Tenda Pipa', parentId: 'hospedagem' },
  
  // Outras Receitas
  { id: '4', name: 'Frigobar', parentId: 'outras_receitas' },
  { id: '5', name: 'Comissão', parentId: 'outras_receitas' },
  { id: '9', name: 'Loja', parentId: 'outras_receitas' },
  { id: '10', name: 'Outras Receitas', parentId: 'outras_receitas' }
];

export const INITIAL_EXPENSE_CATEGORIES: Category[] = [
  { id: '1', name: 'Serviços e Assinaturas' },
  { id: '2', name: 'Aluguel' },
  { id: '3', name: 'Amenities' },
  { id: '4', name: 'Enxoval' },
  { id: '5', name: 'Estrutura Chalé' },
  { id: '6', name: 'Frigobar' },
  { id: '7', name: 'Manutenção' },
  { id: '8', name: 'Material de limpeza' },
  { id: '9', name: 'Pró-labore' },
  { id: '10', name: 'Salário' }
];

export const INITIAL_ACCOUNTS: Account[] = [
  { id: '1', name: 'Stone', balance: 0 },
  { id: '2', name: 'Inter', balance: 0 },
  { id: '3', name: 'Getnet', balance: 0 },
  { id: '4', name: 'Pessoal Daniel', balance: 0 },
  { id: '5', name: 'Pessoal Júlia', balance: 0 },
  { id: '6', name: 'Mercado Pago', balance: 0 },
  { id: '7', name: 'Vincent e Ana', balance: 0 },
  { id: '8', name: 'ASAS', balance: 0 },
  { id: '9', name: 'Caixinha', balance: 0 }
];

export const INITIAL_PAYMENT_METHODS: PaymentMethod[] = [
  { id: '1', name: 'Pix Inter', fee: 0 },
  { id: '2', name: 'Pix Stone', fee: 0.99 },
  { id: '3', name: 'Dinheiro', fee: 0 },
  { id: '4', name: 'Cartão Crédito Stone (1x)', fee: 2.96 },
  { id: '5', name: 'Cartão Crédito Stone (2x a 6x)', fee: 3.24 },
  { id: '6', name: 'Booking', fee: 16.00 },
  { id: '7', name: 'Boleto Inter', fee: 0 },
  { id: '8', name: 'Cartão Crédito Mercado Pago (1x)', fee: 3.03 }
];

export const INITIAL_ORIGINS: Origin[] = [
  { id: '1', name: 'Balcão', fee: 0 },
  { id: '2', name: 'Site', fee: 0 },
  { id: '3', name: 'Booking', fee: 16.00 },
  { id: '4', name: 'Expedia', fee: 16.00 }
];
