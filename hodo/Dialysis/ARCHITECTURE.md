# DialysisApp - Scalable Data Loading and API Layer Architecture

## Overview

This document describes the scalable data loading and API layer architecture implemented in the DialysisApp frontend. The architecture supports multiple data sources (mock, real, and future production) with seamless switching and excellent user experience.

## Architecture Goals

- **Frontend-only development** using static mock JSON or localStorage
- **Integration with Express + lowdb backend** for realistic data simulation
- **Future MSSQL backend support** without frontend changes
- **No UI flickering** or empty states during data loading
- **Consistent API contracts** across all data sources

## Environment Configuration

### Environment Variables

```bash
# .env file in hodo/Dialysis/
VITE_DATA_MODE=mock    # Uses static mockData.json
VITE_DATA_MODE=real    # Uses Express + lowdb backend
VITE_DATA_MODE=prod    # Future: MSSQL backend
```

### Data Sources

| Mode | Data Source | Description |
|------|-------------|-------------|
| `mock` | `/public/mockData.json` | Static JSON file served by Vite |
| `real` | `http://localhost:5000/api/*` | Express + lowdb backend |
| `prod` | `https://api.production.com/*` | Future MSSQL backend |

## File Structure

```
hodo/Dialysis/
├── public/
│   └── mockData.json              # Static mock data
├── src/
│   ├── hooks/
│   │   └── useDataLoader.ts       # Data loading hooks
│   ├── services/
│   │   ├── patient/
│   │   │   ├── factory.ts         # Service factory
│   │   │   ├── patientService.ts  # Service interface
│   │   │   ├── mock/
│   │   │   │   └── index.ts       # localStorage mock
│   │   │   └── real/
│   │   │       └── index.ts       # API calls
│   │   ├── billing/
│   │   │   ├── factory.ts
│   │   │   ├── billingService.ts
│   │   │   ├── mock/
│   │   │   │   └── index.ts
│   │   │   └── real/
│   │   │       └── index.ts
│   │   └── ... (other services)
│   ├── utils/
│   │   └── loadData.ts            # Static data loading
│   ├── types/
│   │   └── index.ts               # TypeScript interfaces
│   └── pages/
│       ├── Billing.tsx            # Original implementation
│       └── BillingEnhanced.tsx    # Enhanced with new hooks
```

## Core Components

### 1. Data Loading Utilities (`utils/loadData.ts`)

Provides functions for loading data from different sources:

```typescript
// Load single resource
const data = await loadData('patients');

// Load with caching
const data = await loadDataWithCache('billing', 'dialysis_billing');

// Load all resources
const allData = await loadAllData();
```

### 2. Data Loading Hooks (`hooks/useDataLoader.ts`)

React hooks for seamless data loading with caching:

```typescript
// Basic usage
const { data, loading, error, refresh } = useDataLoader({
  resource: 'billing',
  cacheKey: 'dialysis_billing'
});

// Load by ID
const { item, loading, error } = useDataLoaderById('patients', '123');

// Load multiple resources
const { data, loading, error } = useMultiDataLoader(['patients', 'billing']);
```

### 3. Service Factory Pattern

Each resource has a factory that selects the appropriate service:

```typescript
// Service interface
export interface PatientService {
  getAllPatients(): Promise<Patient[]>;
  getPatientById(id: string): Promise<Patient>;
  addPatient(patient: Omit<Patient, 'id'>): Promise<Patient>;
  // ... other methods
}

// Factory usage
const patientService = patientServiceFactory.getService();
const patients = await patientService.getAllPatients();
```

### 4. Mock Services

Mock services use localStorage for persistence:

```typescript
export class MockPatientService implements PatientService {
  async getAllPatients(): Promise<Patient[]> {
    // Load from static data first
    const staticData = await loadDataWithCache('patients', STORAGE_KEY);
    if (staticData.length > 0) return staticData;
    
    // Fallback to localStorage
    const stored = getPatientsFromStorage();
    if (stored.length > 0) return stored;
    
    // Default mock data
    return getDefaultMockPatients();
  }
}
```

## Usage Examples

### Component Implementation

```typescript
// Enhanced Billing Component
const BillingEnhanced: React.FC = () => {
  const { data: bills, loading, error, refresh } = useDataLoader({
    resource: 'billing',
    cacheKey: 'dialysis_billing'
  });

  const billingService = billingServiceFactory.getService();

  const handleAddBill = async (billData: any) => {
    await billingService.addBill(billData);
    await refresh(); // Refresh data
  };

  if (loading && bills.length === 0) {
    return <LoadingSpinner />;
  }

  if (error && bills.length === 0) {
    return <ErrorMessage error={error} onRetry={refresh} />;
  }

  return (
    <div>
      {/* Render bills data */}
    </div>
  );
};
```

### Service Implementation

```typescript
// Real service implementation
export class RealPatientService implements PatientService {
  async getAllPatients(): Promise<Patient[]> {
    return await patientsApi.getAllPatients();
  }
}

// Mock service implementation
export class MockPatientService implements PatientService {
  async getAllPatients(): Promise<Patient[]> {
    return await loadDataWithCache('patients', 'dialysis_patients');
  }
}
```

## Data Flow

### 1. Initial Load
1. Component mounts
2. `useDataLoader` hook initializes
3. Checks localStorage cache first
4. If no cache, loads from static file or API
5. Updates component state with data
6. Caches data in localStorage

### 2. Data Updates
1. User performs action (add/edit/delete)
2. Service method called
3. Data updated in backend/mock storage
4. Component refreshes data
5. UI updates with new data

### 3. Mode Switching
1. Environment variable changes
2. Factory selects appropriate service
3. Components continue working unchanged
4. Data source switches transparently

## Benefits

### 1. Developer Experience
- **Frontend-only development** with static mock data
- **Consistent API contracts** across all implementations
- **Type safety** with TypeScript interfaces
- **Easy testing** with mock services

### 2. User Experience
- **No loading flicker** with localStorage caching
- **Offline capability** with cached data
- **Fast initial load** from cache
- **Consistent behavior** across modes

### 3. Scalability
- **Easy backend switching** via environment variables
- **Future-proof** for MSSQL migration
- **Modular architecture** for new features
- **Performance optimization** with caching

## Migration Guide

### From Original Implementation

1. **Replace direct API calls** with service factory:
   ```typescript
   // Before
   const response = await fetch('/api/patients');
   const patients = await response.json();
   
   // After
   const patientService = patientServiceFactory.getService();
   const patients = await patientService.getAllPatients();
   ```

2. **Replace useState + useEffect** with useDataLoader:
   ```typescript
   // Before
   const [patients, setPatients] = useState([]);
   const [loading, setLoading] = useState(true);
   
   useEffect(() => {
     fetchPatients();
   }, []);
   
   // After
   const { data: patients, loading, error, refresh } = useDataLoader({
     resource: 'patients'
   });
   ```

3. **Add error handling** and loading states:
   ```typescript
   if (loading && patients.length === 0) {
     return <LoadingSpinner />;
   }
   
   if (error && patients.length === 0) {
     return <ErrorMessage error={error} onRetry={refresh} />;
   }
   ```

### Adding New Resources

1. **Create service interface**:
   ```typescript
   // services/newResource/newResourceService.ts
   export interface NewResourceService {
     getAll(): Promise<NewResource[]>;
     getById(id: string): Promise<NewResource>;
     add(item: Omit<NewResource, 'id'>): Promise<NewResource>;
     update(id: string, item: Partial<NewResource>): Promise<NewResource>;
     delete(id: string): Promise<boolean>;
   }
   ```

2. **Create mock implementation**:
   ```typescript
   // services/newResource/mock/index.ts
   export class MockNewResourceService implements NewResourceService {
     async getAll(): Promise<NewResource[]> {
       return await loadDataWithCache('newResource', 'dialysis_newResource');
     }
     // ... other methods
   }
   ```

3. **Create real implementation**:
   ```typescript
   // services/newResource/real/index.ts
   export class RealNewResourceService implements NewResourceService {
     async getAll(): Promise<NewResource[]> {
       return await newResourceApi.getAll();
     }
     // ... other methods
   }
   ```

4. **Create factory**:
   ```typescript
   // services/newResource/factory.ts
   export const newResourceServiceFactory = {
     getService(): NewResourceService {
       const mode = import.meta.env.VITE_DATA_MODE || 'real';
       return mode === 'mock' ? new MockNewResourceService() : new RealNewResourceService();
     }
   };
   ```

## Testing

### Unit Testing
```typescript
// Test service factory
describe('PatientServiceFactory', () => {
  it('should return mock service when VITE_DATA_MODE=mock', () => {
    // Test implementation
  });
});

// Test data loading hooks
describe('useDataLoader', () => {
  it('should load data with caching', () => {
    // Test implementation
  });
});
```

### Integration Testing
```typescript
// Test component with different modes
describe('BillingEnhanced', () => {
  it('should work with mock data', () => {
    // Test with VITE_DATA_MODE=mock
  });
  
  it('should work with real data', () => {
    // Test with VITE_DATA_MODE=real
  });
});
```

## Performance Considerations

### Caching Strategy
- **localStorage caching** for fast initial loads
- **Cache invalidation** on data updates
- **Fallback mechanisms** for offline scenarios

### Loading Optimization
- **Progressive loading** with cached data first
- **Background refresh** for fresh data
- **Error boundaries** for graceful failures

### Memory Management
- **Automatic cache cleanup** for old data
- **Lazy loading** for large datasets
- **Efficient re-renders** with React hooks

## Future Enhancements

### 1. Advanced Caching
- **Redis integration** for shared caching
- **Cache warming** strategies
- **Intelligent cache invalidation**

### 2. Real-time Updates
- **WebSocket integration** for live data
- **Optimistic updates** for better UX
- **Conflict resolution** for concurrent edits

### 3. Offline Support
- **Service Worker** for offline functionality
- **Sync mechanisms** for data consistency
- **Conflict resolution** for offline changes

### 4. Performance Monitoring
- **Data loading metrics** collection
- **Cache hit/miss ratios** tracking
- **User experience monitoring**

## Conclusion

This architecture provides a robust foundation for the DialysisApp with excellent developer and user experience. The factory pattern ensures consistent behavior across different data sources, while the caching mechanisms provide fast, responsive interfaces. The modular design makes it easy to add new features and migrate to different backends in the future. 