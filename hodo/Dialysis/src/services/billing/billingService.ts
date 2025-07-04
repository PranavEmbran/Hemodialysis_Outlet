import type { Billing } from '../../types';
 
export interface BillingService {
  getAllBills(): Promise<Billing[]>;
  addBill(bill: Omit<Billing, 'id'>): Promise<Billing>;
  updateBill(id: string | number, billData: Partial<Billing>): Promise<Billing>;
  deleteBill(id: number): Promise<boolean>;
  softDeleteBill(id: string | number): Promise<boolean>;
} 