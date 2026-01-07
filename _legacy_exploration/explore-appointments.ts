/**
 * Appointment Endpoint Explorer
 * Tests various endpoint patterns to find the calendar/appointment API
 */

import { CoziApiClient } from './src/CoziApiClient';
import axios from 'axios';
import * as readline from 'readline';

async function exploreAppointments() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  };

  try {
    console.log('🔍 Cozi Appointment API Explorer\n');
    
    const username = await question('Enter your Cozi email: ');
    const password = await question('Enter your Cozi password: ');
    console.log('');

    const client = new CoziApiClient({ debug: false });
    
    console.log('🔐 Authenticating...');
    const auth = await client.authenticate(username, password);
    console.log('✓ Authenticated\n');

    const accountId = auth.accountId;
    const token = auth.accessToken;
    const baseUrl = 'https://rest.cozi.com';

    // Test different variations
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const monthPadded = month.toString().padStart(2, '0');

    const endpoints = [
      // Try different path patterns
      `/api/ext/2004/${accountId}/appointments/`,
      `/api/ext/2004/${accountId}/appointments/${year}/${month}`,
      `/api/ext/2004/${accountId}/appointments/${year}/${monthPadded}`,
      `/api/ext/2004/${accountId}/calendar`,
      `/api/ext/2004/${accountId}/calendar/`,
      `/api/ext/2004/${accountId}/calendar/${year}`,
      `/api/ext/2004/${accountId}/calendar/${year}/${month}`,
      `/api/ext/2004/${accountId}/calendar/${year}/${monthPadded}`,
      `/api/ext/2004/${accountId}/calendar/${year}-${monthPadded}`,
      
      // Try without trailing slash
      `/api/ext/2004/${accountId}/appointment`,
      `/api/ext/2004/${accountId}/appointment/${year}/${month}`,
      
      // Try query parameters
      `/api/ext/2004/${accountId}/calendar?year=${year}&month=${month}`,
      `/api/ext/2004/${accountId}/appointments?year=${year}&month=${month}`,
      
      // Try different API version
      `/api/ext/2207/${accountId}/calendar`,
      `/api/ext/2207/${accountId}/calendar/${year}/${month}`,
      
      // Try calendar endpoints similar to list pattern
      `/api/ext/2004/${accountId}/cozi-calendar/`,
      
      // Try agenda
      `/api/ext/2004/${accountId}/agenda/`,
      `/api/ext/2004/${accountId}/agenda/${year}/${month}`,
    ];

    console.log(`Testing ${endpoints.length} endpoint variations...\n`);

    const successfulEndpoints = [];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${baseUrl}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 5000,
        });

        console.log(`✅ ${endpoint}`);
        console.log(`   Status: ${response.status}`);
        
        if (response.data) {
          const dataType = Array.isArray(response.data) ? 'array' : typeof response.data;
          console.log(`   Type: ${dataType}`);
          
          if (Array.isArray(response.data)) {
            console.log(`   Count: ${response.data.length}`);
            if (response.data.length > 0) {
              console.log(`   First item keys:`, Object.keys(response.data[0]));
            }
          } else if (typeof response.data === 'object') {
            console.log(`   Keys:`, Object.keys(response.data));
          }
        }
        console.log('');
        
        successfulEndpoints.push({ endpoint, data: response.data });
      } catch (error: any) {
        // Only log successful ones to reduce noise
        if (error.response && error.response.status !== 404) {
          console.log(`⚠️  ${endpoint} - Status: ${error.response.status}`);
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));
    
    if (successfulEndpoints.length === 0) {
      console.log('❌ No appointment/calendar endpoints found');
      console.log('\nThis could mean:');
      console.log('1. The endpoints use a different pattern');
      console.log('2. Calendar data might be accessed differently');
      console.log('3. The py-cozi library might use a different API version');
      console.log('\nNext steps:');
      console.log('- Check if py-cozi has been updated recently');
      console.log('- Try inspecting network traffic from the Cozi web app');
      console.log('- Contact the py-cozi maintainer for guidance');
    } else {
      console.log(`✓ Found ${successfulEndpoints.length} working endpoint(s):\n`);
      successfulEndpoints.forEach(({ endpoint, data }) => {
        console.log(`  ${endpoint}`);
      });
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

exploreAppointments().catch(console.error);
