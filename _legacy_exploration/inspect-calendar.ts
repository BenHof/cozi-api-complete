/**
 * Calendar Data Inspector
 * Fetches and displays the structure of calendar data
 */

import { CoziApiClient } from './src/CoziApiClient';
import axios from 'axios';
import * as readline from 'readline';

async function inspectCalendar() {
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
    console.log('📅 Cozi Calendar Data Inspector\n');
    
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

    // Get current month's calendar
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    console.log(`Fetching calendar for ${year}-${month}...\n`);

    const endpoint = `/api/ext/2004/${accountId}/calendar/${year}/${month}`;
    
    const response = await axios.get(`${baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('='.repeat(60));
    console.log('CALENDAR DATA STRUCTURE');
    console.log('='.repeat(60));
    console.log('\nFull Response:\n');
    console.log(JSON.stringify(response.data, null, 2));

    console.log('\n' + '='.repeat(60));
    console.log('ANALYSIS');
    console.log('='.repeat(60));

    const data = response.data;
    
    // Analyze structure
    console.log('\nTop-level keys:', Object.keys(data));
    
    // Check for appointments array
    const possibleAppointmentKeys = ['appointments', 'events', 'items', 'calendar', 'data'];
    for (const key of possibleAppointmentKeys) {
      if (data[key]) {
        console.log(`\nFound '${key}' field:`);
        if (Array.isArray(data[key])) {
          console.log(`  Type: array`);
          console.log(`  Length: ${data[key].length}`);
          if (data[key].length > 0) {
            console.log(`  First item keys:`, Object.keys(data[key][0]));
            console.log(`\n  Sample appointment:`);
            console.log(JSON.stringify(data[key][0], null, 2));
          }
        } else {
          console.log(`  Type: ${typeof data[key]}`);
        }
      }
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  } finally {
    rl.close();
  }
}

inspectCalendar().catch(console.error);
