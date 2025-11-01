import axios from 'axios';

async function testTransferRatesAPI() {
  try {
    // We need to authenticate first
    console.log('=== Testing Transfer Rates API ===\n');

    // First, login to get a token
    console.log('Step 1: Logging in...');
    const loginResponse = await axios.post('http://localhost:3001/api/v1/auth/login', {
      email: 'admin@demo.com',
      password: 'Admin@123',
    });

    const { accessToken } = loginResponse.data;
    console.log('✓ Login successful\n');

    // Now, fetch transfer rates
    console.log('Step 2: Fetching transfer rates for service offering #3...');
    const ratesResponse = await axios.get('http://localhost:3001/api/v1/transfers/rates', {
      params: {
        serviceOfferingId: 3,
      },
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    console.log('Response status:', ratesResponse.status);
    console.log('Response data type:', typeof ratesResponse.data);
    console.log('Response data is array:', Array.isArray(ratesResponse.data));
    console.log('Response data length:', Array.isArray(ratesResponse.data) ? ratesResponse.data.length : 'N/A');
    console.log('\nFull response data:');
    console.log(JSON.stringify(ratesResponse.data, null, 2));

  } catch (error: any) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testTransferRatesAPI();
