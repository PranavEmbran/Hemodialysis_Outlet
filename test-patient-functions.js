// Test the patient search and pagination functions directly
import { searchPatients, getPatientsPage } from './hodo/api/services/mssqlService.js';

async function testPatientFunctions() {
  console.log('Testing Patient Search and Pagination Functions\n');

  try {
    // Test 1: Search patients function
    console.log('1. Testing searchPatients function...');
    const searchResults = await searchPatients('john', 10);
    console.log(`   Search results for "john":`, searchResults.length, 'patients found');
    if (searchResults.length > 0) {
      console.log(`   First result:`, searchResults[0]);
    }

    // Test 2: Get paginated patients function
    console.log('\n2. Testing getPatientsPage function...');
    const pageResults = await getPatientsPage(1, 25);
    console.log(`   Page 1 results:`, pageResults.patients?.length || 0, 'patients');
    console.log(`   Total count:`, pageResults.totalCount);
    console.log(`   Has more:`, pageResults.hasMore);

    console.log('\n✅ All function tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testPatientFunctions();