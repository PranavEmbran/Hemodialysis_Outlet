// Simple test script to verify update functionality
import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000';

async function testUpdateEndpoints() {
  console.log('Testing update endpoints...');
  
  try {
    // Test predialysis update
    const predialysisUpdate = {
      PreDR_ID_PK: 'test123',
      PreDR_Vitals_BP: 120,
      PreDR_Vitals_HeartRate: 80,
      PreDR_Notes: 'Updated test note'
    };
    
    console.log('Testing predialysis update...');
    const response1 = await fetch(`${API_URL}/data/predialysis_record`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(predialysisUpdate)
    });
    
    console.log('Predialysis update response:', response1.status);
    if (response1.ok) {
      const result1 = await response1.json();
      console.log('Predialysis update result:', result1);
    } else {
      console.log('Predialysis update error:', await response1.text());
    }
    
    // Test soft delete
    const softDelete = {
      PreDR_ID_PK: 'test123',
      deleted: true
    };
    
    console.log('Testing soft delete...');
    const response2 = await fetch(`${API_URL}/data/predialysis_record`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(softDelete)
    });
    
    console.log('Soft delete response:', response2.status);
    if (response2.ok) {
      const result2 = await response2.json();
      console.log('Soft delete result:', result2);
    } else {
      console.log('Soft delete error:', await response2.text());
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testUpdateEndpoints();