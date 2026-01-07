/**
 * Reminder Endpoint Explorer
 * Tests various patterns to find reminder/notification endpoints
 */

import { CoziApiClient } from './src/CoziApiClient';
import axios from 'axios';
import * as readline from 'readline';

async function exploreReminders() {
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
    console.log('🔔 Cozi Reminder Explorer\n');
    
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

    // First, let's check if reminders are in appointments
    console.log('1️⃣  Checking if reminders are in appointment data...\n');
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    const calendarResponse = await axios.get(
      `${baseUrl}/api/ext/2004/${accountId}/calendar/${year}/${month}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const items = calendarResponse.data.items || [];
    if (items.length > 0) {
      console.log('Sample appointment structure:');
      console.log(Object.keys(items[0]));
      
      // Check for reminder-related fields
      const reminderFields = Object.keys(items[0]).filter(k => 
        k.toLowerCase().includes('remind') || 
        k.toLowerCase().includes('alert') || 
        k.toLowerCase().includes('notif')
      );
      
      if (reminderFields.length > 0) {
        console.log('\n✅ Found reminder-related fields in appointments:');
        reminderFields.forEach(f => console.log(`   - ${f}: ${(items[0] as any)[f]}`));
      } else {
        console.log('❌ No reminder fields in appointment data');
      }
    }

    // Check if reminders are in list items
    console.log('\n2️⃣  Checking if reminders are in list items...\n');
    const lists = await client.getLists();
    if (lists.length > 0 && lists[0].items.length > 0) {
      const sampleItem = lists[0].items[0];
      console.log('Sample list item structure:');
      console.log(Object.keys(sampleItem));
      
      const reminderFields = Object.keys(sampleItem).filter(k => 
        k.toLowerCase().includes('remind') || 
        k.toLowerCase().includes('alert') || 
        k.toLowerCase().includes('notif') ||
        k.toLowerCase().includes('due')
      );
      
      if (reminderFields.length > 0) {
        console.log('\n✅ Found reminder-related fields in list items:');
        reminderFields.forEach(f => console.log(`   - ${f}: ${(sampleItem as any)[f]}`));
      } else {
        console.log('❌ No reminder fields in list item data');
      }
    }

    // Test potential reminder endpoints
    console.log('\n3️⃣  Testing potential reminder endpoints...\n');
    
    const reminderEndpoints = [
      // Reminder endpoints
      `/api/ext/2004/${accountId}/reminder/`,
      `/api/ext/2004/${accountId}/reminders/`,
      `/api/ext/2004/${accountId}/notification/`,
      `/api/ext/2004/${accountId}/notifications/`,
      `/api/ext/2004/${accountId}/alert/`,
      `/api/ext/2004/${accountId}/alerts/`,
      
      // Might be under settings
      `/api/ext/2004/${accountId}/settings/reminder/`,
      `/api/ext/2004/${accountId}/settings/notification/`,
      `/api/ext/2004/${accountId}/account/notification/`,
      `/api/ext/2004/${accountId}/account/reminder/`,
      
      // Might be under person (notification preferences per person)
      `/api/ext/2004/${accountId}/account/person/notification/`,
      
      // Try 2207 API version
      `/api/ext/2207/${accountId}/reminder/`,
      `/api/ext/2207/${accountId}/notification/`,
      
      // Might be part of preferences/profile
      `/api/ext/2004/${accountId}/preferences/`,
      `/api/ext/2004/${accountId}/preference/`,
      `/api/ext/2004/${accountId}/profile/notification/`,
      
      // Might be device-specific
      `/api/ext/2004/${accountId}/device/`,
      `/api/ext/2004/${accountId}/devices/`,
      `/api/ext/2004/${accountId}/subscription/`,
      `/api/ext/2004/${accountId}/push/`,
    ];

    const results = {
      working: [] as any[],
      forbidden: [] as any[],
      notFound: [] as any[],
    };

    for (const endpoint of reminderEndpoints) {
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
          const dataType = Array.isArray(response.data) ? `Array[${response.data.length}]` : 'Object';
          console.log(`   Type: ${dataType}`);
          
          if (typeof response.data === 'object') {
            console.log(`   Keys: ${Object.keys(response.data).join(', ')}`);
          }
          
          console.log(`   Data: ${JSON.stringify(response.data, null, 2).substring(0, 200)}...`);
        }
        console.log('');

        results.working.push({ endpoint, data: response.data });

      } catch (error: any) {
        if (error.response?.status === 403 || error.response?.status === 401) {
          console.log(`🔒 ${endpoint} - Forbidden`);
          results.forbidden.push(endpoint);
        } else if (error.response?.status === 404) {
          // Silent for 404s to reduce noise
          results.notFound.push(endpoint);
        }
      }
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Working endpoints: ${results.working.length}`);
    console.log(`🔒 Forbidden: ${results.forbidden.length}`);
    console.log(`❌ Not found: ${results.notFound.length}`);

    if (results.working.length > 0) {
      console.log('\n✅ WORKING ENDPOINTS:');
      results.working.forEach(r => {
        console.log(`\n${r.endpoint}`);
        console.log(JSON.stringify(r.data, null, 2));
      });
    } else {
      console.log('\n❌ No reminder endpoints found.');
      console.log('\nPossibilities:');
      console.log('1. Reminders might be properties on appointments/list items');
      console.log('2. Reminders might only be configurable via mobile app');
      console.log('3. Reminders might use push notification services (not REST API)');
      console.log('4. Need to check appointment/item structure more carefully');
    }

    if (results.forbidden.length > 0) {
      console.log('\n🔒 FORBIDDEN ENDPOINTS (might need different permissions):');
      results.forbidden.forEach(e => console.log(`  ${e}`));
    }

    // Save results
    const fs = require('fs');
    fs.writeFileSync(
      './reminder-scan-results.json',
      JSON.stringify(results, null, 2)
    );
    console.log('\n📄 Results saved to: reminder-scan-results.json');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  } finally {
    rl.close();
  }
}

exploreReminders();
