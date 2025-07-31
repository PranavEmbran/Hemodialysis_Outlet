# Dialysis_Schedules API

## Save Dialysis Sessions

### Endpoint
- **POST** `/api/data/Dialysis_Schedules`
- **Description:** Save one or more dialysis session assignments. The backend will auto-generate unique `DS_ID_PK` values (e.g., SA001, SA002, ...).

### Request Body
An array of session objects (without `DS_ID_PK`):
```json
[
  {
    "P_ID_FK": "20250715/001",
    "DS_Date": "2025-07-16",
    "DS_Time": "08:30",
    "Status": 10,
    "Added_by": "admin",
    "Added_on": "2025-07-15",
    "Modified_by": "admin",
    "Modified_on": "2025-07-15",
    "Provider_FK": "PR001",
    "Outlet_FK": "OUT001"
  }
]
```

### Response
Returns the updated `Dialysis_Schedules` array, with auto-generated `DS_ID_PK` fields:
```json
[
  {
    "DS_ID_PK": "SA001",
    "P_ID_FK": "20250715/001",
    "DS_Date": "2025-07-16",
    "DS_Time": "08:30",
    "Status": 10,
    "Added_by": "admin",
    "Added_on": "2025-07-15",
    "Modified_by": "admin",
    "Modified_on": "2025-07-15",
    "Provider_FK": "PR001",
    "Outlet_FK": "OUT001"
  }
]
```

### Example Frontend Usage
- The **Save Sessions** button on the Scheduling page will POST the selected sessions to this endpoint.
- The backend will assign unique IDs and persist the data in `db.json`.

### Get All Assigned Schedules
- **GET** `/api/data/Dialysis_Schedules`
- Returns all assigned sessions. 