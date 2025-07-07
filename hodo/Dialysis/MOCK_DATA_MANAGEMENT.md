# Mock Data Management

This document explains how to use the enhanced mock data management features in the Dialysis App.

## Features

### 1. Automatic File Updates
The app now supports automatically updating `mockData.json` via the API server when you use the "Copy & Update File" button.

### 2. API Server Integration
- **Endpoint**: `POST http://localhost:5001/api/mock-data/update`
- **Purpose**: Updates `mockData.json` with current localStorage backup data
- **Response**: Success message with file path

## Setup Instructions

### 1. Start the API Server
Navigate to the API directory and start the server:

```bash
cd hodo/Dialysis/api
npm start
```

**Note**: This server runs on port 5001 to avoid conflicts with the main backend server (port 5000).

Or use the provided scripts:
- **Windows**: `start-server.bat`
- **Unix/Linux**: `./start-server.sh`

### 2. Verify Server Status
The MockDataManager component will automatically check if the API server is available and display the status:
- ✅ **Available**: Automatic file updates are enabled
- ❌ **Unavailable**: Start the API server to enable automatic updates

## Usage

### Copy & Update File Button
1. Make changes to your mock data in the app
2. Click "Copy & Update File" in the MockDataManager
3. The data will be:
   - Copied to your clipboard
   - Automatically saved to `mockData.json` via the API

### Manual Fallback
If the API server is not running, the button will still copy data to clipboard but show a warning message.

## API Endpoints

### Update Mock Data
```
POST /api/mock-data/update
Content-Type: application/json

{
  "data": {
    "patients": [...],
    "appointments": [...],
    "billing": [...],
    "history": [...],
    "staff": {...}
  }
}
```

### Get Current Mock Data
```
GET /api/mock-data
```

## Troubleshooting

### API Server Not Starting
1. Check if Node.js is installed
2. Verify all dependencies are installed: `npm install`
3. Check if port 5001 is available (different from main backend on port 5000)
4. Review server logs for errors

### File Update Fails
1. Ensure the API server is running
2. Check file permissions for `src/mock/mockData.json`
3. Verify the file path is correct

### CORS Issues
The API server is configured to allow requests from common development ports. If you're using a different port, add it to the CORS configuration in `api/server.ts`.

## Benefits

1. **Automated Workflow**: No more manual file editing
2. **Real-time Updates**: Changes are immediately persisted
3. **Backup Safety**: Data is still backed up in localStorage
4. **Developer Friendly**: Clear status indicators and error messages 