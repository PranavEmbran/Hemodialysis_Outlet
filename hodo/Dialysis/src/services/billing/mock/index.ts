import type { Billing } from '../../../types';
import type { BillingService } from '../billingService';
import { filePersistence } from '../../../utils/filePersistence';

// Generate a unique ID
const generateId = (): number => {
  return Date.now();
};

export class MockBillingService implements BillingService {
  async getAllBills(): Promise<Billing[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      // Get bills from file persistence
      const bills = await filePersistence.getResourceData('billing');
      // Return only active bills (not soft-deleted)
      const activeBills = bills.filter((bill: Billing) => bill.isDeleted !== 0);
      console.log(`MockBillingService: Returning ${activeBills.length} active bills`);
      return activeBills;
    } catch (error) {
      console.error('MockBillingService: Error loading bills:', error);
      throw error;
    }
  }

  async addBill(bill: Omit<Billing, 'id'>): Promise<Billing> {
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
      const newBill: Billing = {
        ...bill,
        id: generateId(),
        isDeleted: 10, // Ensure new bills are active
      };

      // Add to file persistence
      await filePersistence.addItem('billing', newBill);

      console.log(`MockBillingService: Added new bill with ID ${newBill.id}`);
      return newBill;
    } catch (error) {
      console.error('MockBillingService: Error adding bill:', error);
      throw error;
    }
  }

  async updateBill(id: string | number, billData: Partial<Billing>): Promise<Billing> {
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
      const bills = await filePersistence.getResourceData('billing');
      const billIndex = bills.findIndex((b: Billing) => b.id === Number(id));

      if (billIndex === -1) {
        console.warn(`MockBillingService: Cannot update - Bill with ID ${id} not found`);
        throw new Error(`Bill with ID ${id} not found`);
      }

      const updatedBill = {
        ...bills[billIndex],
        ...billData,
        id: Number(id), // Ensure ID remains the same
      };

      // Update in file persistence
      await filePersistence.updateItem('billing', String(id), updatedBill);

      console.log(`MockBillingService: Updated bill with ID ${id}`);
      return updatedBill;
    } catch (error) {
      console.error(`MockBillingService: Error updating bill ${id}:`, error);
      throw error;
    }
  }

  async deleteBill(id: number): Promise<boolean> {
    return await this.softDeleteBill(id);
  }

  async softDeleteBill(id: string | number): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      // Soft delete in file persistence
      await filePersistence.deleteItem('billing', String(id));

      console.log(`MockBillingService: Soft deleted bill with ID ${id}`);
      return true;
    } catch (error) {
      console.error(`MockBillingService: Error deleting bill ${id}:`, error);
      throw error;
    }
  }

  // Helper method to reset the service (useful for testing)
  static reset(): void {
    filePersistence.clearCache();
    console.log('MockBillingService: Reset completed - cleared cache');
  }
} 