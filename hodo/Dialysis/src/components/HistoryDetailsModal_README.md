# HistoryDetailsModal Component

## Overview
The `HistoryDetailsModal` component displays detailed information about a dialysis session when the eye icon is clicked in the History page.

## Features
- Displays comprehensive dialysis session details
- Shows pre-dialysis and post-dialysis vital signs
- Displays treatment parameters
- Shows session timing information
- Includes nursing notes and additional information

## Usage
```tsx
import HistoryDetailsModal from '../components/HistoryDetailsModal';

<HistoryDetailsModal
  show={showDetailsModal}
  onHide={handleCloseDetailsModal}
  historyData={selectedHistoryData}
/>
```

## Props
- `show: boolean` - Controls modal visibility
- `onHide: () => void` - Function to close the modal
- `historyData: History | null` - The history data to display

## Data Structure
The modal expects a `History` object with the following structure:
```typescript
interface History {
  id?: string | number;
  date: string;
  patientId: string | number;
  patientName: string;
  startTime?: string;
  endTime?: string;
  vitalSigns?: {
    preDialysis?: {
      bloodPressure?: string;
      heartRate?: number;
      temperature?: number;
      weight?: number;
    };
    postDialysis?: {
      bloodPressure?: string;
      heartRate?: number;
      temperature?: number;
      weight?: number;
    };
  };
  treatmentParameters?: {
    dialyzer?: string;
    bloodFlow?: number;
    dialysateFlow?: number;
    ultrafiltration?: number;
  };
  nursingNotes?: string;
  notes?: string;
  parameters?: string;
  amount?: string;
  age?: string;
  gender?: string;
}
```

## Styling
The modal uses Bootstrap classes and includes:
- Color-coded sections for different types of information
- Responsive layout with Bootstrap Grid
- Professional medical interface styling

## Integration
This modal is integrated into the History page (`src/pages/History.tsx`) and is triggered by clicking the eye icon in the parameters column of the history table. 