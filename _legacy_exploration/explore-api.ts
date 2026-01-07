/**
 * API Verification Script
 * 
 * Verifies the new service-based architecture of the Cozi API Client.
 * Run with: npx ts-node explore-api.ts
 */

import { CoziApiClient } from './src/CoziApiClient';

async function exploreApi() {
  console.log('🔍 Cozi API Client Verification\n');

  // Prompt for credentials
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
      readline.question(prompt, resolve);
    });
  };

  try {
    const username = await question('Enter your Cozi email: ');
    const password = await question('Enter your Cozi password: ');
    console.log('');

    // Create client with debug enabled
    const client = new CoziApiClient({ debug: true });

    // Authenticate
    console.log('🔐 Authenticating...');
    const auth = await client.authenticate(username, password);
    console.log('✓ Authenticated successfully');

    // 1. Verify Account Service
    console.log('\n👤 Verifying Account Service...');
    const account = await client.account.getAccountInfo();
    console.log(`   Account Name: ${account.name}`);
    console.log(`   Timezone: ${account.timezone}`);

    // 2. Verify Family Service
    console.log('\n👨‍👩‍👧‍👦 Verifying Family Service...');
    const family = await client.family.getFamilyMembers();
    console.log(`   Family members found: ${family.length}`);
    family.forEach(p => console.log(`   - ${p.name} (${p.accountPersonType})`));

    // 3. Verify Lists Service
    console.log('\n📝 Verifying List Service...');
    const lists = await client.lists.getLists();
    console.log(`   Lists found: ${lists.length}`);
    if (lists.length > 0) {
      console.log(`   First list: ${lists[0].name} (${lists[0].status})`);
    }

    // 4. Verify Calendar Service
    console.log('\n📅 Verifying Calendar Service...');
    const today = new Date();
    const calendar = await client.calendar.getCalendar(today.getFullYear(), today.getMonth() + 1);
    console.log(`   Calendar items found for current month: ${calendar.items.length}`);

    // 5. Verify Recipe Service
    console.log('\n🍳 Verifying Recipe Service...');
    const recipes = await client.recipes.getRecipes();
    console.log(`   Recipes found: ${recipes.length}`);

    console.log('\n✅ Verification Complete! The new service architecture is working.');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message || error);
    if (error.details) console.error('Details:', error.details);
  } finally {
    readline.close();
  }
}

// Run the exploration
exploreApi().catch(console.error);
