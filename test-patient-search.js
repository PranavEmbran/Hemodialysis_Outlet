// Test script for new patient search and pagination endpoints
const baseUrl = 'http://localhost:5000/api/data';

async function testPatientEndpoints() {
  console.log('Testing Patient Search and Pagination Endpoints\n');

  try {
    // Test 1: Search patients by name
    console.log('1. Testing patient search by name...');
    const searchResponse = await fetch(`${baseUrl}/patients/search?q=john&limit=10`);
    const searchResults = await searchResponse.json();
    console.log(`   Search results for "john":`, searchResults.length, 'patients found');
    if (searchResults.length > 0) {
      console.log(`   First result:`, searchResults[0]);
    }

    // Test 2: Search patients by ID
    console.log('\n2. Testing patient search by ID...');
    const idSearchResponse = await fetch(`${baseUrl}/patients/search?q=123&limit=10`);
    const idSearchResults = await idSearchResponse.json();
    console.log(`   Search results for ID "123":`, idSearchResults.length, 'patients found');
    if (idSearchResults.length > 0) {
      console.log(`   First result:`, idSearchResults[0]);
    }

    // Test 3: Get paginated patients
    console.log('\n3. Testing patient pagination...');
    const pageResponse = await fetch(`${baseUrl}/patients/page?page=1&pageSize=25`);
    const pageResults = await pageResponse.json();
    console.log(`   Page 1 results:`, pageResults.patients?.length || 0, 'patients');
    console.log(`   Total count:`, pageResults.totalCount);
    console.log(`   Has more:`, pageResults.hasMore);

    // Test 4: Original endpoint (for comparison)
    console.log('\n4. Testing original patients_derived endpoint...');
    const originalResponse = await fetch(`${baseUrl}/patients_derived`);
    const originalResults = await originalResponse.json();
    console.log(`   Original endpoint results:`, originalResults.length, 'patients');

    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  testPatientEndpoints();
}