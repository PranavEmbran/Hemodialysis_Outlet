import type { Billing } from '../../types';
 
export interface BillingService {
  getAllBills(): Promise<Billing[]>;
  addBill(bill: Omit<Billing, 'id'>): Promise<Billing>;
  deleteBill(id: number): Promise<boolean>;
} 