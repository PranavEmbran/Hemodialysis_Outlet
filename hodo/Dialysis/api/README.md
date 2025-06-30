# Dialysis Management API

This is the backend API for the Dialysis Management System.

## Features

- Patient management
- Appointment scheduling
- Billing records
- Dialysis history tracking
- Flow chart management
- Haemodialysis records
- Data quality validation and reporting

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the API directory:
```bash
cd api
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Test
- `GET /api/test` - Test endpoint to verify API is working

### Patients
- `GET /api/patients` - Get all patients
- `POST /api/patients` - Add a new patient

### Appointments/Schedule
- `GET /api/schedule` - Get all appointments
- `GET /api/schedules` - Alternative endpoint for appointments
- `POST /api/schedule` - Add a new appointment
- `POST /api/schedules` - Alternative endpoint for adding appointments

### Billing
- `GET /api/billing` - Get all billing records
- `POST /api/billing` - Add a new billing record

### History
- `GET /api/history` - Get all dialysis history records
- `POST /api/history` - Add a new history record
- `DELETE /api/history/:id` - Delete a history record

### Dialysis Flow Charts
- `GET /api/dialysis-flow-charts` - Get all flow charts
- `POST /api/dialysis-flow-charts` - Add a new flow chart
- `DELETE /api/dialysis-flow-charts/:id` - Delete a flow chart

### Haemodialysis Records
- `GET /api/haemodialysis-records` - Get all haemodialysis records
- `POST /api/haemodialysis-records` - Add a new haemodialysis record

### Staff
- `GET /api/staff` - Get staff information (technicians, doctors, units)

## Data Quality Tools

### Data Quality Check

Run a comprehensive data quality analysis:

```bash
node scripts/dataQualityCheck.js
```

This will generate a report showing:
- Data summary (counts of each record type)
- Data quality issues (errors and warnings)
- Recommendations for improvement

### Data Quality Fixes

Automatically fix common data quality issues:

```bash
node scripts/fixDataQuality.js
```

This script will:
- Fix duplicate mobile numbers
- Add missing medical dates
- Standardize date formats

## Database Structure

The database is stored in `db/db.json` and contains the following collections:

- `patients` - Patient information
- `appointments` - Scheduled appointments
- `billing` - Billing records
- `history` - Dialysis session history
- `dialysisFlowCharts` - Flow chart data
- `haemodialysisRecords` - Haemodialysis monitoring records

## Data Validation

The system includes comprehensive data validation for:

- Patient information (name, gender, dates, contact info)
- Appointment scheduling (dates, times, units)
- Medical records (vital signs, lab results)
- Billing information

## Backup and Recovery

The system includes utilities for:
- Database backup creation
- Database restoration from backups
- Data quality monitoring

## Development

### TypeScript Configuration

The project uses TypeScript with the following configuration:
- Target: ES2020
- Module: CommonJS
- Strict type checking enabled
- Source maps for debugging

### File Structure

```
api/
├── db/
│   ├── db.json              # Main database file
│   └── dbOperations.ts      # Database operations
├── routes/
│   └── dataRoutes.ts        # API routes
├── scripts/
│   ├── dataQualityCheck.js  # Data quality analysis
│   └── fixDataQuality.js    # Data quality fixes
├── utils/
│   ├── dataValidation.ts    # Data validation utilities
│   └── dataQualityReport.ts # Data quality reporting
├── server.ts                # Main server file
├── package.json             # Dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

## Troubleshooting

### Common Issues

1. **Server won't start**: Check if port 5000 is already in use
2. **Database errors**: Ensure `db/db.json` exists and is valid JSON
3. **TypeScript errors**: Run `npm install` to ensure all dependencies are installed

### Logs

The server logs errors and operations to the console. Check the terminal output for debugging information.

## Contributing

1. Follow the existing code style
2. Add appropriate error handling
3. Include data validation for new endpoints
4. Update this README for any new features

## License

This project is part of the Dialysis Management System. 