# File-Based Mock Data Persistence System

## Overview

This system enables persistent mock data storage by reading from and writing directly to `mockData.json` file from the frontend, using Vite's plugin system to simulate file operations without requiring a backend server.

## Architecture

### Components

1. **vite-plugin-mock** - Vite plugin that intercepts API calls and handles file operations
2. **Mock API Handlers** - Simulate REST API endpoints that read/write to `mockData.json`
3. **Updated Services** - Use fetch API to interact with mock endpoints
4. **File Persistence** - Direct file system operations through the plugin

### Data Flow

```
Frontend Action → Service Method → Fetch API → Mock Handler → File System → mockData.json
     ↓
Browser Refresh → Service Method → Fetch API → Mock Handler → File System → mockData.json
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install vite-plugin-mock --save-dev
```

### 2. Configure Vite

Update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { viteMockServe } from 'vite-plugin-mock'

export default defineConfig({
  plugins: [
    react(),
    viteMockServe({
      mockPath: 'src/mock',
      localEnabled: true,
      prodEnabled: false,
      supportTs: true,
      logger: false,
    })
  ],
  server: {
    host: true,
    port: 3000
  }
})
```

### 3. Set Environment Variable

```bash
VITE_DATA_MODE=mock
```

## Implementation Details

### Mock API Handlers (`src/mock/api.ts`)

The system provides REST API endpoints that simulate backend operations:

#### Available Endpoints:
- `GET /api/patients` - Get all active patients
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Add new patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Soft delete patient
- `GET /api/billing` - Get all billing records
- `POST /api/billing` - Add new billing record
- `GET /api/history` - Get all history records
- `GET /api/appointments` - Get all appointments

#### File Operations:
- **Read**: `fs.readFileSync()` to load current data
- **Write**: `fs.writeFileSync()` to persist changes
- **Error Handling**: Graceful fallbacks and logging

### Updated Services

#### MockPatientService Changes:
- Removed localStorage dependencies
- Uses fetch API to call mock endpoints
- Maintains same interface for seamless integration
- Automatic file persistence on all CRUD operations

#### loadData Utility Updates:
- Detects mock mode and routes to API endpoints
- Maintains compatibility with existing code
- Provides consistent data loading experience

## Usage

### Development Workflow

1. **Start Development Server:**
   ```bash
   npm run dev
   ```

2. **Add New Patient:**
   - Navigate to registration page
   - Fill out patient form
   - Submit - data automatically saves to `mockData.json`

3. **View Dashboard:**
   - Patient appears immediately
   - Data persists across browser refreshes
   - File is updated in real-time

4. **Edit/Delete Patients:**
   - All operations update the file
   - Changes are immediately visible
   - No data loss on refresh

### Data Management

#### Export Data:
- Use MockDataManager on `/test` page
- Downloads current `mockData.json` file
- Preserves all patient data

#### Import Data:
- Upload JSON file through MockDataManager
- Manually replace `mockData.json` file
- Refresh page to see imported data

#### Reset Data:
- Clear `mockData.json` file manually
- Refresh page to reset to initial state

## Benefits

### ✅ **True File Persistence**
- Data saved directly to `mockData.json`
- Survives browser refreshes and page reloads
- No localStorage or sessionStorage dependencies

### ✅ **No Backend Required**
- Pure frontend solution
- Uses Vite plugin system
- Works entirely in development environment

### ✅ **Real-time Updates**
- File updates immediately
- Changes visible across all components
- Consistent data state

### ✅ **Developer Experience**
- Familiar REST API patterns
- Standard fetch API usage
- Easy debugging and monitoring

### ✅ **Production Ready**
- Clean separation of concerns
- No mock code in production builds
- Maintains existing service interfaces

## Technical Notes

### File System Operations
- **Read Operations**: Synchronous file reading for immediate data access
- **Write Operations**: Synchronous file writing for data persistence
- **Error Handling**: Comprehensive error catching and logging
- **Data Validation**: Ensures data integrity before writing

### Performance Considerations
- **File I/O**: Minimal impact during development
- **Memory Usage**: Efficient data loading and caching
- **Network Simulation**: Realistic API response times
- **Error Recovery**: Graceful fallbacks for file operations

### Security
- **File Access**: Limited to development environment
- **Data Validation**: Input sanitization and validation
- **Error Logging**: Comprehensive error tracking
- **Safe Operations**: No destructive file operations

## Troubleshooting

### Common Issues

#### Data Not Persisting:
1. Verify `VITE_DATA_MODE=mock` is set
2. Check file permissions for `mockData.json`
3. Ensure vite-plugin-mock is properly configured
4. Check browser console for errors

#### API Endpoints Not Working:
1. Verify mock handlers are properly defined
2. Check Vite configuration
3. Ensure development server is running
4. Check network tab for failed requests

#### File Not Updating:
1. Check file write permissions
2. Verify file path is correct
3. Check for file system errors in console
4. Ensure no other processes are locking the file

### Debugging

#### Enable Logging:
```typescript
// In vite.config.ts
viteMockServe({
  logger: true, // Enable detailed logging
})
```

#### Check File Operations:
```typescript
// In mock handlers
console.log('Reading from:', MOCK_DATA_PATH);
console.log('Writing data:', JSON.stringify(data, null, 2));
```

## Migration from localStorage

### Before (localStorage):
```typescript
// Save to localStorage
localStorage.setItem('key', JSON.stringify(data));

// Load from localStorage
const data = JSON.parse(localStorage.getItem('key') || '[]');
```

### After (File-based):
```typescript
// Save via API
await fetch('/api/patients', {
  method: 'POST',
  body: JSON.stringify(patientData)
});

// Load via API
const response = await fetch('/api/patients');
const data = await response.json();
```

## Future Enhancements

1. **Multi-resource Support** - Extend to all data types
2. **Data Versioning** - Track changes and provide rollbacks
3. **Auto-backup** - Automatic backup before major operations
4. **Data Validation** - Enhanced validation and error handling
5. **Real-time Sync** - File watching for external changes

## Conclusion

This file-based persistence system provides a robust, developer-friendly solution for mock data management that:

- ✅ Persists data across browser refreshes
- ✅ Works entirely in the frontend
- ✅ Maintains familiar API patterns
- ✅ Provides excellent developer experience
- ✅ Scales to multiple data types
- ✅ Includes comprehensive error handling

The system successfully achieves the goal of persistent mock data storage without requiring backend services or browser storage, while maintaining full compatibility with existing application code. 