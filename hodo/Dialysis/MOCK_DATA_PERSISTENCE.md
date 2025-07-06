# Mock Data Persistence System

This document explains how the mock data persistence system works when `VITE_DATA_MODE=mock`.

## Overview

When running in mock mode, all CRUD operations (create, edit, delete) are automatically saved to localStorage as backup data. This data can then be manually copied to the `src/mock/mockData.json` file to persist changes.

## How It Works

### 1. Data Flow
```
User Action (Create/Edit/Delete) 
    ↓
Mock Service (Patient, Billing, etc.)
    ↓
File Persistence Utility
    ↓
localStorage Backup + Console Instructions
    ↓
Manual File Update (optional)
```

### 2. File Structure
- `src/utils/filePersistence.ts` - Core persistence logic
- `src/services/*/mock/index.ts` - Updated to use file persistence
- `src/components/MockDataFileManager.tsx` - UI for managing file updates
- `scripts/updateMockData.js` - Node.js utility for file operations

## Usage

### Automatic Backup
1. Set `VITE_DATA_MODE=mock` in your `.env` file
2. Make changes in the app (create, edit, delete patients)
3. Changes are automatically saved to localStorage as backup

### Manual File Update
1. Go to `/test` page in the app
2. Click "Show File Manager"
3. Click "Copy" to copy the updated data
4. Open `src/mock/mockData.json`
5. Replace the entire content with the copied data
6. Save the file
7. Refresh the app to see changes

### Using Node.js Script
```bash
# From the project root
node scripts/updateMockData.js
```

## Components

### MockDataFileManager
- Shows current backup data
- Provides copy-to-clipboard functionality
- Clear backup/cache options
- Step-by-step instructions

### File Persistence Utility
- Loads data from `mockData.json`
- Saves changes to localStorage backup
- Provides console instructions for manual updates
- Handles CRUD operations on file data

## Environment Variables

```bash
# .env file
VITE_DATA_MODE=mock  # Use mock data and persistence
VITE_DATA_MODE=real  # Use real backend API
```

## Testing

1. Visit `/test` page
2. Verify data loading works correctly
3. Make changes in the app
4. Use File Manager to copy updated data
5. Update `mockData.json` manually
6. Refresh and verify changes persist

## Troubleshooting

### Changes not appearing
- Clear browser cache and localStorage
- Restart the dev server
- Check that `VITE_DATA_MODE=mock` is set

### File not updating
- Ensure you're copying the entire JSON structure
- Check file permissions on `mockData.json`
- Use the Node.js script as alternative

### Data inconsistencies
- Clear cache using File Manager
- Reset to initial state using Node.js script
- Check for ID conflicts in the data

## Benefits

1. **Frontend-only development** - No backend required
2. **Persistent changes** - Data survives app restarts
3. **Easy testing** - Quick data manipulation
4. **Version control** - Changes tracked in git
5. **Flexible** - Can switch between mock and real modes

## Future Enhancements

- Automatic file writing (requires backend integration)
- Real-time file watching
- Data validation and sanitization
- Export/import functionality
- Conflict resolution for concurrent changes 