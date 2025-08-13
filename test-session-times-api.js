// Simple test to verify session times API endpoints
const API_URL = 'http://localhost:5000';

async function testSessionTimesAPI() {
  try {
    console.log('Testing Session Times API...');
    
    // Test GET endpoint
    console.log('\n1. Testing GET /data/session_times...');
    const getResponse = await fetch(`${API_URL}/data/session_times`);
    console.log('GET response status:', getResponse.status);
    if (getResponse.ok) {
      const data = await getResponse.json();
      console.log('Session times data:', data);
    } else {
      console.log('GET failed:', await getResponse.text());
    }

    // Test POST endpoint
    console.log('\n2. Testing POST /data/session_times...');
    const newSessionTime = {
      ST_Session_Name: '4th',
      ST_Start_Time: '20:00'
    };
    const postResponse = await fetch(`${API_URL}/data/session_times`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSessionTime)
    });
    console.log('POST response status:', postResponse.status);
    if (postResponse.ok) {
      const data = await postResponse.json();
      console.log('Created session time:', data);
    } else {
      console.log('POST failed:', await postResponse.text());
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testSessionTimesAPI();