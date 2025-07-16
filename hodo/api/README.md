# Schedules_Assigned API

## Save Dialysis Sessions

### Endpoint
- **POST** `/api/data/schedules_assigned`
- **Description:** Save one or more dialysis session assignments. The backend will auto-generate unique `SA_ID_PK` values (e.g., SA001, SA002, ...).

### Request Body
An array of session objects (without `SA_ID_PK`):
```json
[
  {
    "P_ID_FK": "20250715/001",
    "SA_Date": "2025-07-16",
    "SA_Time": "08:30",
    "isDeleted": 10,
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
Returns the updated `Schedules_Assigned` array, with auto-generated `SA_ID_PK` fields:
```json
[
  {
    "SA_ID_PK": "SA001",
    "P_ID_FK": "20250715/001",
    "SA_Date": "2025-07-16",
    "SA_Time": "08:30",
    "isDeleted": 10,
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
- **GET** `/api/data/schedules_assigned`
- Returns all assigned sessions. 