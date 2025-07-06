// File-based persistence utility for mock data
// This uses a simple approach to persist data to mockData.json

interface MockData {
    patients: any[];
    appointments: any[];
    billing: any[];
    history: any[];
    staff: {
        technicians: string[];
        doctors: string[];
        units: string[];
    };
}

// In-memory cache of the file data
let fileDataCache: MockData | null = null;

// Helper function to get the current file data
const getFileData = async (): Promise<MockData> => {
    if (fileDataCache) {
        return fileDataCache;
    }

    try {
        // First, check if we have backup data in localStorage (prioritize user changes)
        const backupData = localStorage.getItem('mockData_backup');
        if (backupData) {
            try {
                const parsedBackup = JSON.parse(backupData);
                console.log('📝 Using localStorage backup data (user changes)');

                // Ensure staff data exists in the backup
                if (!parsedBackup.staff) {
                    console.log('📝 Adding missing staff data to localStorage backup');
                    parsedBackup.staff = {
                        technicians: [
                            "Dr. Sarah Johnson",
                            "Dr. Michael Chen",
                            "Dr. Emily Rodriguez",
                            "Dr. David Thompson",
                            "Dr. Lisa Wang"
                        ],
                        doctors: [
                            "Dr. Robert Smith",
                            "Dr. Jennifer Brown",
                            "Dr. William Davis",
                            "Dr. Maria Garcia",
                            "Dr. James Wilson"
                        ],
                        units: [
                            "Unit A - Main Dialysis",
                            "Unit B - Emergency",
                            "Unit C - Pediatric",
                            "Unit D - Intensive Care",
                            "Unit E - Outpatient"
                        ]
                    };
                    // Update the localStorage backup with the complete data
                    localStorage.setItem('mockData_backup', JSON.stringify(parsedBackup, null, 2));
                }

                fileDataCache = parsedBackup;
                return parsedBackup;
            } catch (error) {
                console.warn('Failed to parse localStorage backup, falling back to file');
            }
        }

        // Fallback to static file if no backup exists
        console.log('📝 Loading from static mockData.json file');
        const response = await fetch('/src/mock/mockData.json');
        if (!response.ok) {
            throw new Error('Failed to load mockData.json');
        }

        const data = await response.json();
        fileDataCache = data;
        return data;
    } catch (error) {
        console.error('Error loading mockData.json:', error);
        // Return default data if file can't be loaded
        return {
            patients: [],
            appointments: [],
            billing: [],
            history: [],
            staff: {
                technicians: [],
                doctors: [],
                units: []
            }
        };
    }
};

// Helper function to save data back to the file
const saveToFile = async (data: MockData): Promise<boolean> => {
    try {
        // Update the cache
        fileDataCache = data;

        // Save to localStorage as backup
        localStorage.setItem('mockData_backup', JSON.stringify(data, null, 2));

        // Provide instructions for manual file update
        console.log('📝 Mock data updated! To persist changes to mockData.json:');
        console.log('');
        console.log('Option 1: Use the Node.js script:');
        console.log('  node scripts/updateMockData.js');
        console.log('');
        console.log('Option 2: Manually update src/mock/mockData.json with:');
        console.log(JSON.stringify(data, null, 2));
        console.log('');
        console.log('Option 3: Copy from localStorage backup:');
        console.log('  localStorage.getItem("mockData_backup")');

        return true;
    } catch (error) {
        console.error('Error saving to file:', error);
        return false;
    }
};

// Export functions for use in services
export const filePersistence = {
    // Get all data from file
    async getData(): Promise<MockData> {
        return await getFileData();
    },

    // Get specific resource data
    async getResourceData(resource: keyof MockData): Promise<any[]> {
        const data = await getFileData();
        return data[resource] || [];
    },

    // Save data to file
    async saveData(data: MockData): Promise<boolean> {
        return await saveToFile(data);
    },

    // Add item to a resource
    async addItem(resource: keyof MockData, item: any): Promise<boolean> {
        const data = await getFileData();
        data[resource].push(item);
        return await saveToFile(data);
    },

    // Update item in a resource
    async updateItem(resource: keyof MockData, id: string, updates: any): Promise<boolean> {
        const data = await getFileData();
        const index = data[resource].findIndex((item: any) => item.id === id);

        if (index !== -1) {
            data[resource][index] = { ...data[resource][index], ...updates };
            return await saveToFile(data);
        }

        return false;
    },

    // Delete item from a resource (soft delete)
    async deleteItem(resource: keyof MockData, id: string): Promise<boolean> {
        const data = await getFileData();
        const index = data[resource].findIndex((item: any) => item.id === id);

        if (index !== -1) {
            data[resource][index] = {
                ...data[resource][index],
                isDeleted: 0,
                deletedAt: new Date().toISOString()
            };
            return await saveToFile(data);
        }

        return false;
    },

    // Clear cache (useful for testing)
    clearCache(): void {
        fileDataCache = null;
    },

    // Get backup data from localStorage
    getBackupData(): MockData | null {
        try {
            const backup = localStorage.getItem('mockData_backup');
            return backup ? JSON.parse(backup) : null;
        } catch {
            return null;
        }
    },

    // Check if backup data exists
    hasBackupData(): boolean {
        return localStorage.getItem('mockData_backup') !== null;
    },

    // Export current data for manual file update
    exportForFile(): string {
        const backup = this.getBackupData();
        if (backup) {
            return JSON.stringify(backup, null, 2);
        }
        return '';
    },

    // Instructions for manual file update
    getUpdateInstructions(): string {
        return `
📝 To update mockData.json with current changes:

1. Copy this data:
${this.exportForFile() || 'No data available'}

2. Replace the contents of src/mock/mockData.json with the data above

3. Or use the Node.js script:
   node scripts/updateMockData.js
    `;
    }
}; 