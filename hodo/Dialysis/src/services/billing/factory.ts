import { MockBillingService } from './mock';
import { RealBillingService } from './real';
import type { BillingService } from './billingService';

class BillingServiceFactory {
  private static instance: BillingService | null = null;

  static getService(): BillingService {
    if (!BillingServiceFactory.instance) {
      const mode = import.meta.env.VITE_DATA_MODE || 'real';
      
      switch (mode) {
        case 'mock':
          console.log('Using Mock Billing Service');
          BillingServiceFactory.instance = new MockBillingService();
          break;
        case 'real':
        default:
          console.log('Using Real Billing Service');
          BillingServiceFactory.instance = new RealBillingService();
          break;
      }
    }
    
    return BillingServiceFactory.instance;
  }

  // Method to reset the instance (useful for testing or mode switching)
  static reset(): void {
    BillingServiceFactory.instance = null;
  }
}

export const billingServiceFactory = BillingServiceFactory; 