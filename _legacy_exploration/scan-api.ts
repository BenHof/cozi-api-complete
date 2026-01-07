/**
 * Comprehensive Cozi API Scanner
 * Systematically discovers all available API endpoints
 */

import { CoziApiClient } from './src/CoziApiClient';
import axios from 'axios';
import * as readline from 'readline';

interface EndpointTest {
  method: string;
  path: string;
  description: string;
  testData?: any;
}

async function scanApi() {
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
    console.log('🔍 Comprehensive Cozi API Scanner\n');
    console.log('This will test various endpoints to map out the full API.\n');
    
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

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // Get a list ID for testing (if available)
    const lists = await client.getLists();
    const testListId = lists.length > 0 ? lists[0].listId : null;
    const testItemId = lists.length > 0 && lists[0].items.length > 0 ? lists[0].items[0].itemId : null;

    console.log(`Found ${lists.length} lists for testing`);
    if (testListId) console.log(`Using test list: ${testListId}`);
    console.log('');

    // Define comprehensive endpoint tests
    const endpointTests: EndpointTest[] = [
      // ===== LISTS (Known working) =====
      { method: 'GET', path: `/api/ext/2004/${accountId}/list/`, description: 'Get all lists' },
      
      // ===== CALENDAR / APPOINTMENTS =====
      { method: 'GET', path: `/api/ext/2004/${accountId}/calendar/${year}/${month}`, description: 'Get calendar for month (KNOWN)' },
      { method: 'GET', path: `/api/ext/2004/${accountId}/calendar/${year}/${month}/`, description: 'Get calendar with trailing slash' },
      { method: 'GET', path: `/api/ext/2004/${accountId}/appointment/`, description: 'Get all appointments' },
      { method: 'POST', path: `/api/ext/2004/${accountId}/appointment/`, description: 'Create appointment', testData: {
        subject: 'Test',
        startYear: year,
        startMonth: month,
        startDay: 15,
        start: '10:00',
        end: '11:00',
      }},
      { method: 'GET', path: `/api/ext/2004/${accountId}/appointment/${year}/${month}/`, description: 'Get appointments for month' },
      
      // ===== ACCOUNT / PROFILE =====
      { method: 'GET', path: `/api/ext/2004/${accountId}/`, description: 'Get account info' },
      { method: 'GET', path: `/api/ext/2004/${accountId}/profile/`, description: 'Get profile' },
      { method: 'GET', path: `/api/ext/2004/${accountId}/account/`, description: 'Get account details' },
      { method: 'GET', path: `/api/ext/2004/${accountId}/settings/`, description: 'Get settings' },
      { method: 'GET', path: `/api/ext/2004/${accountId}/family/`, description: 'Get family members' },
      { method: 'GET', path: `/api/ext/2004/${accountId}/person/`, description: 'Get persons' },
      { method: 'GET', path: `/api/ext/2004/${accountId}/member/`, description: 'Get members' },
      { method: 'GET', path: `/api/ext/2004/${accountId}/user/`, description: 'Get user info' },
      
      // ===== MESSAGES / JOURNAL =====
      { method: 'GET', path: `/api/ext/2004/${accountId}/message/`, description: 'Get messages' },
      { method: 'GET', path: `/api/ext/2004/${accountId}/messages/`, description: 'Get messages (plural)' },
      { method: 'GET', path: `/api/ext/2004/${accountId}/journal/`, description: 'Get journal entries' },
      { method: 'GET', path: `/api/ext/2004/${accountId}/note/`, description: 'Get notes' },
      { method: 'GET', path: `/api/ext/2004/${accountId}/notes/`, description: 'Get notes (plural)' },
      
      // ===== RECIPES =====
      { method: 'GET', path: `/api/ext/2004/${accountId}/recipe/`, description: 'Get recipes' },
      { method: 'GET', path: `/api/ext/2004/${accountId}/recipes/`, description: 'Get recipes (plural)' },
      { method: 'GET', path: `/api/ext/2004/${accountId}/meal/`, description: 'Get meals' },
      { method: 'GET', path: `/api/ext/2004/${accountId}/menu/`, description: 'Get menu' },
      
      // ===== CONTACTS =====
      { method: 'GET', path: `/api/ext/2004/${accountId}/contact/`, description: 'Get contacts' },
      { method: 'GET', path: `/api/ext/2004/${accountId}/contacts/`, description: 'Get contacts (plural)' },
      
      // ===== REMINDERS / NOTIFICATIONS =====
      { method: 'GET', path: `/api/ext/2004/${accountId}/reminder/`, description: 'Get reminders' },
      { method: 'GET', path: `/api/ext/2004/${accountId}/notification/`, description: 'Get notifications' },
      { method: 'GET', path: `/api/ext/2004/${accountId}/alert/`, description: 'Get alerts' },
      
      // ===== SYNC / DATA =====
      { method: 'GET', path: `/api/ext/2004/${accountId}/sync/`, description: 'Get sync info' },
      { method: 'GET', path: `/api/ext/2004/${accountId}/data/`, description: 'Get all data' },
      
      // ===== TRY API VERSION 2207 =====
      { method: 'GET', path: `/api/ext/2207/${accountId}/calendar/${year}/${month}`, description: 'Calendar (2207 API)' },
      { method: 'GET', path: `/api/ext/2207/${accountId}/list/`, description: 'Lists (2207 API)' },
    ];

    console.log(`Testing ${endpointTests.length} endpoints...\n`);
    console.log('='.repeat(80));

    const results = {
      successful: [] as any[],
      forbidden: [] as any[],
      notFound: [] as any[],
      errors: [] as any[],
    };

    for (const test of endpointTests) {
      try {
        const config: any = {
          method: test.method,
          url: `${baseUrl}${test.path}`,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 5000,
        };

        if (test.testData && (test.method === 'POST' || test.method === 'PUT')) {
          config.data = test.testData;
        }

        const response = await axios(config);

        console.log(`✅ ${test.method.padEnd(6)} ${test.path}`);
        console.log(`   ${test.description}`);
        console.log(`   Status: ${response.status}`);
        
        // Show data structure
        if (response.data) {
          if (Array.isArray(response.data)) {
            console.log(`   Type: Array[${response.data.length}]`);
            if (response.data.length > 0) {
              console.log(`   Sample keys: ${Object.keys(response.data[0]).slice(0, 5).join(', ')}`);
            }
          } else if (typeof response.data === 'object') {
            console.log(`   Type: Object`);
            console.log(`   Keys: ${Object.keys(response.data).slice(0, 8).join(', ')}`);
          }
        }
        console.log('');

        results.successful.push({
          method: test.method,
          path: test.path,
          description: test.description,
          status: response.status,
          dataType: Array.isArray(response.data) ? 'array' : typeof response.data,
          dataKeys: response.data && typeof response.data === 'object' ? Object.keys(response.data) : null,
        });

      } catch (error: any) {
        if (error.response) {
          const status = error.response.status;
          
          if (status === 404) {
            results.notFound.push(test);
          } else if (status === 403 || status === 401) {
            console.log(`🔒 ${test.method.padEnd(6)} ${test.path}`);
            console.log(`   ${test.description}`);
            console.log(`   Status: ${status} (Auth issue)\n`);
            results.forbidden.push({ ...test, status });
          } else {
            console.log(`⚠️  ${test.method.padEnd(6)} ${test.path}`);
            console.log(`   ${test.description}`);
            console.log(`   Status: ${status}\n`);
            results.errors.push({ ...test, status, error: error.message });
          }
        }
      }
    }

    // ===== SUMMARY =====
    console.log('='.repeat(80));
    console.log('SCAN RESULTS SUMMARY');
    console.log('='.repeat(80));
    console.log(`\n✅ Successful: ${results.successful.length}`);
    console.log(`🔒 Forbidden: ${results.forbidden.length}`);
    console.log(`❌ Not Found: ${results.notFound.length}`);
    console.log(`⚠️  Errors: ${results.errors.length}`);

    if (results.successful.length > 0) {
      console.log('\n' + '='.repeat(80));
      console.log('WORKING ENDPOINTS');
      console.log('='.repeat(80));
      results.successful.forEach(r => {
        console.log(`\n${r.method} ${r.path}`);
        console.log(`  ${r.description}`);
        if (r.dataKeys) {
          console.log(`  Keys: ${r.dataKeys.join(', ')}`);
        }
      });
    }

    if (results.forbidden.length > 0) {
      console.log('\n' + '='.repeat(80));
      console.log('FORBIDDEN ENDPOINTS (May need different auth or permissions)');
      console.log('='.repeat(80));
      results.forbidden.forEach(r => {
        console.log(`  ${r.method} ${r.path} - ${r.description}`);
      });
    }

    // Save results to file
    const fs = require('fs');
    const reportPath = './api-scan-results.json';
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\n📄 Full results saved to: ${reportPath}`);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  } finally {
    rl.close();
  }
}

scanApi().catch(console.error);
