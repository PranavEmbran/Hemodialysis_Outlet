import { billingApi } from '../../../api/billingApi';
import type { Billing } from '../../../types';
import type { BillingService } from '../billingService';

export class RealBillingService implements BillingService {
  async getAllBills(): Promise<Billing[]> {
    return await billingApi.getAllBills();
  }

  async addBill(bill: Omit<Billing, 'id'>): Promise<Billing> {
    return await billingApi.addBill(bill);
  }

  async deleteBill(id: number): Promise<boolean> {
    return await billingApi.deleteBill(id);
  }
} 