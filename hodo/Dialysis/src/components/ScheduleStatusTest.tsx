import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

const ScheduleStatusTest: React.FC = () => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/data/dialysis_schedules/with-records`);
      const data = await res.json();
      console.log('API Response:', data);
      setSchedules(data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const testCancel = async (scheduleId: string) => {
    try {
      const res = await fetch(`${API_URL}/data/dialysis_schedules/${scheduleId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 0 })
      });
      if (res.ok) {
        console.log('Cancel successful');
        fetchSchedules(); // Refresh
      }
    } catch (error) {
      console.error('Cancel error:', error);
    }
  };

  const testReassign = async (scheduleId: string) => {
    try {
      const res = await fetch(`${API_URL}/data/dialysis_schedules/${scheduleId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 10 })
      });
      if (res.ok) {
        console.log('Reassign successful');
        fetchSchedules(); // Refresh
      }
    } catch (error) {
      console.error('Reassign error:', error);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>Schedule Status Test Component</h3>
      <button onClick={fetchSchedules} disabled={loading}>
        {loading ? 'Loading...' : 'Refresh Schedules'}
      </button>
      
      <div style={{ marginTop: '20px' }}>
        <h4>Schedules ({schedules.length})</h4>
        {schedules.map((schedule, index) => (
          <div key={schedule.DS_ID_PK || index} style={{ 
            border: '1px solid #eee', 
            padding: '10px', 
            margin: '5px 0',
            backgroundColor: schedule.computed_status === 'Cancelled' ? '#ffebee' : '#f9f9f9'
          }}>
            <div><strong>ID:</strong> {schedule.DS_ID_PK}</div>
            <div><strong>Patient:</strong> {schedule.DS_P_ID_FK}</div>
            <div><strong>Date:</strong> {schedule.DS_Date}</div>
            <div><strong>Time:</strong> {schedule.DS_Time}</div>
            <div><strong>DS_Status:</strong> {schedule.DS_Status}</div>
            <div><strong>Computed Status:</strong> {schedule.computed_status || 'Not computed'}</div>
            <div><strong>Has Predialysis:</strong> {schedule.has_predialysis ? 'Yes' : 'No'}</div>
            <div><strong>Has Start Dialysis:</strong> {schedule.has_start_dialysis ? 'Yes' : 'No'}</div>
            <div><strong>Has Post Dialysis:</strong> {schedule.has_post_dialysis ? 'Yes' : 'No'}</div>
            <div style={{ marginTop: '10px' }}>
              <button 
                onClick={() => testCancel(schedule.DS_ID_PK)}
                style={{ marginRight: '10px', backgroundColor: '#f44336', color: 'white', border: 'none', padding: '5px 10px' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => testReassign(schedule.DS_ID_PK)}
                style={{ backgroundColor: '#4caf50', color: 'white', border: 'none', padding: '5px 10px' }}
              >
                Reassign
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleStatusTest;