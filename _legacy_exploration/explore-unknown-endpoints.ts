/**
 * Explore unknown/untested Cozi API endpoints
 * Areas: Meals/Menu, Journal, Recipes, Search, Birthdays
 */

import axios from 'axios';
import * as readline from 'readline';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const API_BASE = 'https://rest.cozi.com/api/ext/2004';
const API_KEY = 'coziwc|v249_production';

async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function authenticate(email: string, password: string) {
  const response = await axios.post('https://rest.cozi.com/api/ext/2207/auth/login', {
    username: email,
    password: password,
    issueRefresh: true
  });
  return response.data;
}

async function testEndpoint(name: string, method: string, url: string, headers: any, data?: any) {
  console.log(`\n🔍 Testing: ${name}`);
  console.log(`   ${method} ${url}`);
  
  try {
    const response = await axios({
      method,
      url,
      headers,
      data
    });
    
    console.log(`✅ SUCCESS (${response.status})`);
    console.log(`   Response:`, JSON.stringify(response.data, null, 2).substring(0, 500));
    return { success: true, data: response.data, status: response.status };
  } catch (error: any) {
    if (error.response) {
      console.log(`❌ FAILED (${error.response.status})`);
      console.log(`   Error:`, JSON.stringify(error.response.data, null, 2).substring(0, 300));
      return { success: false, status: error.response.status, error: error.response.data };
    } else {
      console.log(`❌ ERROR:`, error.message);
      return { success: false, error: error.message };
    }
  }
}

async function exploreEndpoints() {
  console.log('🔬 Cozi API Unknown Endpoints Explorer\n');
  
  const email = process.env.COZI_EMAIL;
  const password = process.env.COZI_PASSWORD;
  
  if (!email || !password) {
    console.error('❌ Missing credentials. Please set COZI_EMAIL and COZI_PASSWORD in .env.local');
    process.exit(1);
  }
  
  console.log(`Using credentials for: ${email}`);
  
  console.log('\n🔐 Authenticating...');
  const auth = await authenticate(email, password);
  console.log('✅ Authenticated\n');
  
  const { accountId, accessToken } = auth;
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  };
  
  const results: any[] = [];
  
  console.log('\n═══════════════════════════════════════');
  console.log('  MEALS & MENU PLANNING');
  console.log('═══════════════════════════════════════');
  
  // Test meal-related endpoints
  const mealTests = [
    { name: 'Get Meals', method: 'GET', path: `/meal/` },
    { name: 'Get Menu', method: 'GET', path: `/menu/` },
    { name: 'Get Weekly Menu', method: 'GET', path: `/menu/weekly` },
    { name: 'Get Meal Plans', method: 'GET', path: `/mealplan/` },
    { name: 'Get Food Items', method: 'GET', path: `/food/` },
  ];
  
  for (const test of mealTests) {
    const result = await testEndpoint(
      test.name,
      test.method,
      `${API_BASE}/${accountId}${test.path}`,
      headers
    );
    results.push({ ...test, ...result });
  }
  
  console.log('\n═══════════════════════════════════════');
  console.log('  RECIPES');
  console.log('═══════════════════════════════════════');
  
  const recipeTests = [
    { name: 'Get Recipes', method: 'GET', path: `/food/recipe/` },
    { name: 'Get Recipe Book', method: 'GET', path: `/recipe/` },
    { name: 'Get Cookbook', method: 'GET', path: `/cookbook/` },
  ];
  
  for (const test of recipeTests) {
    const result = await testEndpoint(
      test.name,
      test.method,
      `${API_BASE}/${accountId}${test.path}`,
      headers
    );
    results.push({ ...test, ...result });
  }
  
  console.log('\n═══════════════════════════════════════');
  console.log('  JOURNAL & NOTES');
  console.log('═══════════════════════════════════════');
  
  const journalTests = [
    { name: 'Get Journal', method: 'GET', path: `/journal/` },
    { name: 'Get Journal Entries', method: 'GET', path: `/journal/entry/` },
    { name: 'Get Notes', method: 'GET', path: `/note/` },
    { name: 'Get Messages', method: 'GET', path: `/message/` },
  ];
  
  for (const test of journalTests) {
    const result = await testEndpoint(
      test.name,
      test.method,
      `${API_BASE}/${accountId}${test.path}`,
      headers
    );
    results.push({ ...test, ...result });
  }
  
  console.log('\n═══════════════════════════════════════');
  console.log('  BIRTHDAYS & HOLIDAYS');
  console.log('═══════════════════════════════════════');
  
  const birthdayTests = [
    { name: 'Get Birthdays', method: 'GET', path: `/birthday/` },
    { name: 'Get Holidays', method: 'GET', path: `/holiday/` },
    { name: 'Get Special Days', method: 'GET', path: `/specialday/` },
  ];
  
  for (const test of birthdayTests) {
    const result = await testEndpoint(
      test.name,
      test.method,
      `${API_BASE}/${accountId}${test.path}`,
      headers
    );
    results.push({ ...test, ...result });
  }
  
  console.log('\n═══════════════════════════════════════');
  console.log('  SEARCH & QUERY');
  console.log('═══════════════════════════════════════');
  
  const searchTests = [
    { name: 'Search Calendar', method: 'GET', path: `/calendar/search?q=test` },
    { name: 'Search All', method: 'GET', path: `/search?q=test` },
    { name: 'Query', method: 'GET', path: `/query?text=test` },
  ];
  
  for (const test of searchTests) {
    const result = await testEndpoint(
      test.name,
      test.method,
      `${API_BASE}/${accountId}${test.path}`,
      headers
    );
    results.push({ ...test, ...result });
  }
  
  console.log('\n═══════════════════════════════════════');
  console.log('  SETTINGS & PREFERENCES');
  console.log('═══════════════════════════════════════');
  
  const settingsTests = [
    { name: 'Get Settings', method: 'GET', path: `/settings/` },
    { name: 'Get Preferences', method: 'GET', path: `/preferences/` },
    { name: 'Get Config', method: 'GET', path: `/config/` },
    { name: 'Get User Settings (2106)', method: 'GET', path: `/account/user/settings`, base: 'https://rest.cozi.com/api/ext/2106' },
  ];
  
  for (const test of settingsTests) {
    const baseUrl = test.base || API_BASE;
    const result = await testEndpoint(
      test.name,
      test.method,
      `${baseUrl}/${accountId}${test.path}`,
      headers
    );
    results.push({ ...test, ...result });
  }
  
  console.log('\n═══════════════════════════════════════');
  console.log('  OTHER ENDPOINTS');
  console.log('═══════════════════════════════════════');
  
  const otherTests = [
    { name: 'Get Photos', method: 'GET', path: `/photo/` },
    { name: 'Get Media', method: 'GET', path: `/media/` },
    { name: 'Get Contacts', method: 'GET', path: `/contact/` },
    { name: 'Get Activity', method: 'GET', path: `/activity/` },
    { name: 'Get Notifications', method: 'GET', path: `/notification/` },
  ];
  
  for (const test of otherTests) {
    const result = await testEndpoint(
      test.name,
      test.method,
      `${API_BASE}/${accountId}${test.path}`,
      headers
    );
    results.push({ ...test, ...result });
  }
  
  // ===== SUMMARY =====
  console.log('\n\n');
  console.log('═══════════════════════════════════════');
  console.log('  SUMMARY OF FINDINGS');
  console.log('═══════════════════════════════════════\n');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful: ${successful.length}`);
  successful.forEach(r => {
    console.log(`   - ${r.name}: ${r.method} ${r.path} (${r.status})`);
  });
  
  console.log(`\n❌ Failed: ${failed.length}`);
  const notFound = failed.filter(r => r.status === 404);
  const forbidden = failed.filter(r => r.status === 403);
  const unauthorized = failed.filter(r => r.status === 401);
  const other = failed.filter(r => ![404, 403, 401].includes(r.status));
  
  if (notFound.length > 0) {
    console.log(`\n   404 Not Found (${notFound.length}):`);
    notFound.forEach(r => console.log(`      - ${r.path}`));
  }
  
  if (forbidden.length > 0) {
    console.log(`\n   403 Forbidden (${forbidden.length}):`);
    forbidden.forEach(r => console.log(`      - ${r.path}`));
  }
  
  if (unauthorized.length > 0) {
    console.log(`\n   401 Unauthorized (${unauthorized.length}):`);
    unauthorized.forEach(r => console.log(`      - ${r.path}`));
  }
  
  if (other.length > 0) {
    console.log(`\n   Other Errors (${other.length}):`);
    other.forEach(r => console.log(`      - ${r.path} (${r.status || 'error'})`));
  }
  
  // Save results to file
  const fs = require('fs');
  fs.writeFileSync(
    './endpoint-discovery-results.json',
    JSON.stringify({ 
      timestamp: new Date().toISOString(),
      totalTests: results.length,
      successful: successful.length,
      failed: failed.length,
      results 
    }, null, 2)
  );
  
  console.log('\n📄 Full results saved to: endpoint-discovery-results.json\n');
}

exploreEndpoints().catch(error => {
  console.error('\n❌ Fatal Error:', error.message);
  if (error.response) {
    console.error('Status:', error.response.status);
    console.error('Data:', error.response.data);
  }
});
