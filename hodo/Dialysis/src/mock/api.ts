// In-memory storage for mock data
let mockData = {
    patients: [
        {
            id: 'P001',
            name: 'John Doe',
            firstName: 'John',
            lastName: 'Doe',
            gender: 'Male',
            dateOfBirth: '1980-01-01',
            mobileNo: '1234567890',
            bloodGroup: 'A+',
            catheterInsertionDate: '2023-01-01',
            fistulaCreationDate: '2023-02-01',
            catheterDate: '2023-01-01',
            fistulaDate: '2023-02-01',
            isDeleted: 10
        },
        {
            id: 'P002',
            name: 'Jane Smith',
            firstName: 'Jane',
            lastName: 'Smith',
            gender: 'Female',
            dateOfBirth: '1990-05-15',
            mobileNo: '0987654321',
            bloodGroup: 'B-',
            catheterInsertionDate: '2023-03-01',
            fistulaCreationDate: '2023-04-01',
            catheterDate: '2023-03-01',
            fistulaDate: '2023-04-01',
            isDeleted: 10
        }
    ],
    appointments: [
        {
            id: 'A001',
            patientId: 'P001',
            patientName: 'John Doe',
            date: '2024-07-10',
            time: '09:00',
            dialysisUnit: 'Unit A',
            technician: 'Dr. Smith',
            admittingDoctor: 'Dr. Brown',
            status: 'Scheduled',
            remarks: 'First session',
            isDeleted: 10
        },
        {
            id: 'A002',
            patientId: 'P002',
            patientName: 'Jane Smith',
            date: '2024-07-11',
            time: '10:00',
            dialysisUnit: 'Unit B',
            technician: 'Dr. Wilson',
            admittingDoctor: 'Dr. Davis',
            status: 'Completed',
            remarks: 'Follow-up',
            isDeleted: 10
        }
    ],
    billing: [
        {
            id: 'B001',
            patientName: 'John Doe',
            sessionDate: '2024-07-10',
            sessionDuration: 4,
            totalAmount: 2000,
            status: 'PAID',
            description: 'Routine dialysis',
            isDeleted: 10
        },
        {
            id: 'B002',
            patientName: 'Jane Smith',
            sessionDate: '2024-07-11',
            sessionDuration: 3,
            totalAmount: 1800,
            status: 'PENDING',
            description: 'Dialysis with consultation',
            isDeleted: 10
        }
    ],
    history: [
        {
            id: 'H001',
            patientId: 'P001',
            patientName: 'John Doe',
            date: '2024-07-10',
            parameters: 'BP: 120/80, Weight: 70kg',
            amount: '2000',
            age: '44',
            gender: 'Male',
            notes: 'Stable',
            nursingNotes: 'No issues',
            isDeleted: 10
        },
        {
            id: 'H002',
            patientId: 'P002',
            patientName: 'Jane Smith',
            date: '2024-07-11',
            parameters: 'BP: 110/70, Weight: 60kg',
            amount: '1800',
            age: '34',
            gender: 'Female',
            notes: 'Mild cramps',
            nursingNotes: 'Observed for 30 min',
            isDeleted: 10
        }
    ]
}

// Helper functions for data persistence
const saveToStorage = (data: any) => {
    try {
        localStorage.setItem('mockData', JSON.stringify(data))
        return true
    } catch (error) {
        console.warn('Failed to save to localStorage:', error)
        return false
    }
}

const loadFromStorage = () => {
    try {
        const data = localStorage.getItem('mockData')
        return data ? JSON.parse(data) : null
    } catch (error) {
        console.warn('Failed to load from localStorage:', error)
        return null
    }
}

// Initialize data from localStorage if available
const initializeData = () => {
    const storedData = loadFromStorage()
    if (storedData) {
        mockData = storedData
        console.log('Loaded mock data from localStorage')
    } else {
        console.log('Using default mock data')
    }
}

// Initialize on module load
initializeData()

// Export mock data and functions for use in services
export { mockData, saveToStorage, loadFromStorage, initializeData } 