import type { Billing } from '../../../types';
import type { BillingService } from '../billingService';

const STORAGE_KEY = 'dialysis_billing';

// Helper function to get bills from localStorage
const getBillsFromStorage = (): Billing[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading bills from localStorage:', error);
    return [];
  }
};

// Helper function to save bills to localStorage
const saveBillsToStorage = (bills: Billing[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
  } catch (error) {
    console.error('Error saving bills to localStorage:', error);
  }
};

// Generate a unique ID
const generateId = (): number => {
  return Date.now();
};

export class MockBillingService implements BillingService {
  async getAllBills(): Promise<Billing[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const bills = getBillsFromStorage();
    
    // Filter out soft-deleted records (isDeleted = 0)
    const activeBills = bills.filter(bill => bill.isDeleted !== 0);
    
    // If no bills exist, initialize with some mock data
    if (activeBills.length === 0) {
      const mockBills: Billing[] = [
        {
          id: 1,
          patientId: '1',
          patientName: 'John Doe',
          date: '2024-01-15',
          amount: 1500,
          description: 'Dialysis session',
          status: 'Paid',
          sessionDate: '2024-01-15',
          sessionDuration: 4,
          totalAmount: 1500,
          isDeleted: 10,
        },
        {
          id: 2,
          patientId: '2',
          patientName: 'Jane Smith',
          date: '2024-01-16',
          amount: 1800,
          description: 'Dialysis session with medication',
          status: 'Pending',
          sessionDate: '2024-01-16',
          sessionDuration: 4,
          totalAmount: 1800,
          isDeleted: 10,
        },
        {
          id: 3,
          patientId: '3',
          patientName: 'Michael Johnson',
          date: '2024-01-17',
          amount: 1200,
          description: 'Standard dialysis session',
          status: 'Paid',
          sessionDate: '2024-01-17',
          sessionDuration: 3,
          totalAmount: 1200,
          isDeleted: 10,
        }
      ];
      
      saveBillsToStorage(mockBills);
      return mockBills;
    }
    
    return activeBills;
  }

  async addBill(bill: Omit<Billing, 'id'>): Promise<Billing> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const bills = getBillsFromStorage();
    const newBill: Billing = {
      ...bill,
      id: generateId(),
      isDeleted: 10,
    };
    
    bills.push(newBill);
    saveBillsToStorage(bills);
    
    return newBill;
  }

  async updateBill(id: string | number, billData: Partial<Billing>): Promise<Billing> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const bills = getBillsFromStorage();
    const billIndex = bills.findIndex(b => b.id === id);
    
    if (billIndex === -1) {
      throw new Error(`Bill with ID ${id} not found`);
    }
    
    // Update the bill with new data
    bills[billIndex] = {
      ...bills[billIndex],
      ...billData,
    };
    
    saveBillsToStorage(bills);
    
    return bills[billIndex];
  }

  async deleteBill(id: number): Promise<boolean> {
    return await this.softDeleteBill(id);
  }

  async softDeleteBill(id: string | number): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const bills = getBillsFromStorage();
    const billIndex = bills.findIndex(b => b.id === id);
    
    if (billIndex === -1) {
      throw new Error(`Bill with ID ${id} not found`);
    }
    
    // Soft delete - mark as deleted instead of removing
    bills[billIndex] = {
      ...bills[billIndex],
      isDeleted: 0,
      deletedAt: new Date().toISOString()
    };
    
    saveBillsToStorage(bills);
    
    return true;
  }
} 