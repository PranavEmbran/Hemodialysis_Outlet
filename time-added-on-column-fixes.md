# Time and Added On Column Fixes

## Issues Identified
1. **Time Column**: Should show data from `DS_Time` field
2. **Added On Column**: Should show data from `DS_Added_On` field

## Debugging Steps Applied

### 1. Added Field Name Debugging
```typescript
// Debug: Check what fields are available in the row data
if (Math.random() < 0.1) { // Only log occasionally to avoid spam
  console.log('Available row fields:', Object.keys(row));
  console.log('DS_Time value:', row.DS_Time);
  console.log('DS_Added_on value:', row.DS_Added_on);
  console.log('DS_Added_On value:', row.DS_Added_On); // Check alternative casing
}
```

### 2. Fixed Potential Casing Issues
```typescript
// Handle both DS_Added_on and DS_Added_On casing
DS_Added_on: new Date(row.DS_Added_on || row.DS_Added_On).toLocaleString(...)

// Handle multiple possible time field names
DS_Time: formatTime(row.DS_Time || row.ds_time || row.time),
```

### 3. Enhanced Time Formatting with Debugging
```typescript
const formatTime = (timeStr: string) => {
  if (!timeStr) return '';
  // Debug time formatting
  if (Math.random() < 0.1) {
    console.log('Formatting time:', timeStr, 'Type:', typeof timeStr);
  }
  // Handle different time formats
  if (timeStr.includes('T')) {
    // Full datetime string like "1970-01-01T12:00:00.000Z"
    const date = new Date(timeStr);
    return date.toTimeString().slice(0, 5); // Returns HH:MM
  } else if (timeStr.includes(':')) {
    // Already in HH:MM:SS or HH:MM format
    return timeStr.slice(0, 5); // Returns HH:MM
  }
  return timeStr;
};
```

### 4. Added Table Data Debugging
```typescript
// Debug: Log the first few mapped records to see what data is being passed to the table
if (filteredAndMappedData.length > 0) {
  console.log('Sample mapped data for table:', {
    DS_Time: filteredAndMappedData[0].DS_Time,
    DS_Added_on: filteredAndMappedData[0].DS_Added_on,
    PatientName: filteredAndMappedData[0].PatientName,
    allKeys: Object.keys(filteredAndMappedData[0])
  });
}
```

## Column Mapping Verification

### Table Columns Definition:
```typescript
columns={[
  { key: 'DS_P_ID_FK', header: 'Patient ID' },
  { key: 'PatientName', header: 'Patient Name' },
  { key: 'DS_Date', header: 'Date' },
  { key: 'DS_Time', header: 'Time' },           // ← Should show DS_Time
  { key: 'computed_status', header: 'Status' },
  { key: 'DS_Added_on', header: 'Added On' },   // ← Should show DS_Added_on
  { key: 'actions', header: 'Actions' }
]}
```

### Data Mapping:
```typescript
return {
  ...row,
  PatientName: (patients.find(p => p.id == row.DS_P_ID_FK)?.Name) || `Patient ${row.DS_P_ID_FK}`,
  DS_Date: formatDate(row.DS_Date),
  DS_Time: formatTime(row.DS_Time || row.ds_time || row.time),  // ← Maps to Time column
  computed_status: (/* status badge JSX */),
  actions: actionComponent,
  DS_Added_on: new Date(row.DS_Added_on || row.DS_Added_On).toLocaleString(...), // ← Maps to Added On column
};
```

## Expected Results

### Time Column:
- **Input**: `"08:00:00"` or `"1970-01-01T08:00:00.000Z"` or `"08:00"`
- **Output**: `"08:00"`

### Added On Column:
- **Input**: `"2025-01-15T10:30:00.000Z"`
- **Output**: `"01/15/2025, 10:30:00 AM"` (or without time if not MSSQL)

## Troubleshooting Steps

1. **Check Console Logs**: Look for the debugging output to see:
   - What fields are available in the API response
   - What values are in DS_Time and DS_Added_on fields
   - What the final mapped data looks like

2. **Verify API Response**: The API endpoint `/data/dialysis_schedules/with-records` should return:
   - `DS_Time` field with time data
   - `DS_Added_on` or `DS_Added_On` field with datetime data

3. **Check Field Names**: Ensure the API is returning the expected field names:
   - Case sensitivity matters: `DS_Added_on` vs `DS_Added_On`
   - Field existence: Some fields might be null or undefined

4. **Test Time Formatting**: The `formatTime` function should handle:
   - Full datetime strings: `"1970-01-01T12:00:00.000Z"` → `"12:00"`
   - Time-only strings: `"12:00:00"` → `"12:00"`
   - Already formatted: `"12:00"` → `"12:00"`

The debugging code will help identify exactly what data is being received and how it's being processed.