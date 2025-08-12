// Test script to verify lookup endpoints are working
import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000';

async function testLookupEndpoints() {
  console.log('Testing lookup endpoints...');
  
  try {
    // Test units endpoint
    console.log('\n1. Testing units_management endpoint...');
    const unitsResponse = await fetch(`${API_URL}/data/units_management`);
    console.log('Units response status:', unitsResponse.status);
    if (unitsResponse.ok) {
      const units = await unitsResponse.json();
      console.log('Units data:', units);
      console.log('Units count:', Array.isArray(units) ? units.length : 'Not an array');
    } else {
      console.log('Units error:', await unitsResponse.text());
    }
    
    // Test vascular access endpoint
    console.log('\n2. Testing vascular_access_lookup endpoint...');
    const accessResponse = await fetch(`${API_URL}/data/vascular_access_lookup`);
    console.log('Access response status:', accessResponse.status);
    if (accessResponse.ok) {
      const access = await accessResponse.json();
      console.log('Access data:', access);
      console.log('Access count:', Array.isArray(access) ? access.length : 'Not an array');
    } else {
      console.log('Access error:', await accessResponse.text());
    }
    
    // Test dialyzer types endpoint
    console.log('\n3. Testing dialyzer_type_lookup endpoint...');
    const dialyzerResponse = await fetch(`${API_URL}/data/dialyzer_type_lookup`);
    console.log('Dialyzer response status:', dialyzerResponse.status);
    if (dialyzerResponse.ok) {
      const dialyzer = await dialyzerResponse.json();
      console.log('Dialyzer data:', dialyzer);
      console.log('Dialyzer count:', Array.isArray(dialyzer) ? dialyzer.length : 'Not an array');
    } else {
      console.log('Dialyzer error:', await dialyzerResponse.text());
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testLookupEndpoints();