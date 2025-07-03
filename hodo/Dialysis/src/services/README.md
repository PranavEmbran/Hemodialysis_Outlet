# Service Layer Architecture

This directory contains the refactored service layer that supports dynamic switching between mock and real data sources using a factory pattern.

## Structure

```
src/services/
├── patient/
│   ├── patientService.ts          # Interface definition
│   ├── factory.ts                 # Factory for switching implementations
│   ├── mock/
│   │   └── index.ts              # localStorage-based mock implementation
│   └── real/
│       └── index.ts              # HTTP-based real implementation
├── billing/
│   ├── billingService.ts
│   ├── factory.ts
│   ├── mock/
│   │   └── index.ts
│   └── real/
│       └── index.ts
├── history/
│   ├── historyService.ts
│   ├── factory.ts
│   ├── mock/
│   │   └── index.ts
│   └── real/
│       └── index.ts
└── schedule/
    ├── scheduleService.ts
    ├── factory.ts
    ├── mock/
    │   └── index.ts
    └── real/
        └── index.ts
```

## Usage

### In Components

Instead of importing APIs directly:

```typescript
// ❌ Old way
import { patientsApi } from '../api/patientsApi';
const patients = await patientsApi.getAllPatients();

// ✅ New way
import { patientServiceFactory } from '../services/patient/factory';
const patientService = patientServiceFactory.getService();
const patients = await patientService.getAllPatients();
```

### Environment Configuration

Set the `VITE_DATA_MODE` environment variable to control which implementation is used:

```bash
# For mock data (localStorage, no backend)
VITE_DATA_MODE=mock

# For real data (Express + lowdb backend)
VITE_DATA_MODE=real

# For production (MSSQL backend - future)
VITE_DATA_MODE=prod
```

**Important:** All Vite environment variables must be prefixed with `VITE_` to be accessible in the frontend.

### API URL Configuration

You can also configure the API URL using `VITE_API_URL`:

```bash
# Override the default API URL
VITE_API_URL=http://192.168.50.50:5000/api
```

If not set, the app will automatically determine the URL based on the current hostname.

## Benefits

1. **Seamless Switching**: Change data sources without modifying component code
2. **Frontend-Only Development**: Use mock mode for development without backend
3. **Consistent Interface**: All implementations follow the same contract
4. **Easy Testing**: Mock implementations for unit testing
5. **Future-Proof**: Easy to add MSSQL backend support later

## Adding New Services

1. Create the service interface in `[resource]/[resource]Service.ts`
2. Implement mock version in `[resource]/mock/index.ts`
3. Implement real version in `[resource]/real/index.ts`
4. Create factory in `[resource]/factory.ts`
5. Update components to use the factory

## Mock Data Persistence

Mock services use localStorage for data persistence:
- `dialysis_patients`: Patient data
- `dialysis_billing`: Billing data
- `dialysis_history`: History data
- `dialysis_schedules`: Schedule data
- `dialysis_staff`: Staff data

Data persists across browser sessions and page refreshes.

## Soft Delete Functionality

All services support soft delete operations:

### Soft Delete Methods
- `softDeletePatient(id)` / `softDeleteSchedule(id)` - Marks records as deleted without removing them
- `restorePatient(id)` / `restoreSchedule(id)` - Restores soft-deleted records
- `deletePatient(id)` / `deleteSchedule(id)` - Now performs soft delete by default

### Soft Delete Fields
Records include these fields for soft delete:
- `isDeleted?: boolean` - Marks if the record is soft-deleted
- `deletedAt?: string` - Timestamp when the record was soft-deleted

### Behavior
- **Mock Services**: Soft-deleted records are filtered out from `getAll()` methods
- **Real Services**: Uses existing delete endpoints (soft delete implementation depends on backend)
- **UI**: Delete buttons in tables now perform soft delete instead of hard delete 