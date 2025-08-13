// Test script for the new schedule status API endpoints
const API_URL = 'http://localhost:5000';

async function testScheduleStatusAPI() {
  try {
    console.log('Testing Schedule Status API...');
    
    // Test 1: Get all schedules with related records
    console.log('\n1. Testing GET /data/dialysis_schedules/with-records...');
    const getResponse = await fetch(`${API_URL}/data/dialysis_schedules/with-records`);
    console.log('GET response status:', getResponse.status);
    if (getResponse.ok) {
      const data = await getResponse.json();
      console.log('Full response data:', JSON.stringify(data.slice(0, 1), null, 2)); // Show only first record for clarity
      console.log('Field names in first record:', data.length > 0 ? Object.keys(data[0]) : 'No data');
      console.log('Schedules with status:', data.map(s => ({
        id: s.DS_ID_PK,
        patient: s.DS_P_ID_FK,
        date: s.DS_Date,
        time: s.DS_Time,
        status: s.computed_status,
        ds_status: s.DS_Status,
        has_predialysis: s.has_predialysis,
        has_start_dialysis: s.has_start_dialysis,
        has_post_dialysis: s.has_post_dialysis
      })));
      
      // Test 2: Update status of first schedule (if exists)
      if (data.length > 0) {
        const firstSchedule = data[0];
        console.log('\n2. Testing PUT /data/dialysis_schedules/:id/status...');
        const updateResponse = await fetch(`${API_URL}/data/dialysis_schedules/${firstSchedule.DS_ID_PK}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 0 }) // Cancel
        });
        console.log('PUT response status:', updateResponse.status);
        if (updateResponse.ok) {
          const updatedData = await updateResponse.json();
          console.log('Updated schedule:', updatedData);
          
          // Test 3: Get updated data to see if status changed
          console.log('\n3. Re-fetching to check status change...');
          const regetResponse = await fetch(`${API_URL}/data/dialysis_schedules/with-records`);
          if (regetResponse.ok) {
            const regetData = await regetResponse.json();
            const updatedSchedule = regetData.find(s => s.DS_ID_PK == firstSchedule.DS_ID_PK);
            console.log('Updated schedule status:', {
              id: updatedSchedule?.DS_ID_PK,
              computed_status: updatedSchedule?.computed_status,
              DS_Status: updatedSchedule?.DS_Status
            });
          }
        } else {
          console.log('PUT failed:', await updateResponse.text());
        }
      }
    } else {
      console.log('GET failed:', await getResponse.text());
    }

    // Test 4: Check conflict
    console.log('\n4. Testing GET /data/dialysis_schedules/check-conflict...');
    const conflictResponse = await fetch(`${API_URL}/data/dialysis_schedules/check-conflict?date=2025-01-15&time=08:00`);
    console.log('Conflict check response status:', conflictResponse.status);
    if (conflictResponse.ok) {
      const conflictData = await conflictResponse.json();
      console.log('Conflict check result:', conflictData);
    } else {
      console.log('Conflict check failed:', await conflictResponse.text());
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testScheduleStatusAPI();