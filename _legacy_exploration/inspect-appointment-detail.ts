import { CoziApiClient } from './src/CoziApiClient';
import axios from 'axios';
import * as readline from 'readline';

async function inspectAppointment() {
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
    const username = await question('Enter your Cozi email: ');
    const password = await question('Enter your Cozi password: ');
    console.log('');

    const client = new CoziApiClient({ debug: false });
    
    console.log('🔐 Authenticating...');
    const auth = await client.authenticate(username, password);
    console.log('✓ Authenticated\n');

    const accountId = auth.accountId;
    const token = auth.accessToken;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    console.log(`Fetching calendar for ${year}-${month}...\n`);

    const response = await axios.get(
      `https://rest.cozi.com/api/ext/2004/${accountId}/calendar/${year}/${month}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const items = response.data.items || [];
    
    console.log(`Found ${items.length} appointments\n`);
    
    if (items.length > 0) {
      console.log('='.repeat(70));
      console.log('FIRST APPOINTMENT COMPLETE STRUCTURE');
      console.log('='.repeat(70));
      console.log(JSON.stringify(items[0], null, 2));
      
      console.log('\n' + '='.repeat(70));
      console.log('ALL FIELDS IN FIRST APPOINTMENT');
      console.log('='.repeat(70));
      Object.keys(items[0]).forEach(key => {
        console.log(`${key}: ${typeof (items[0] as any)[key]} = ${JSON.stringify((items[0] as any)[key])}`);
      });
      
      // Check all appointments for reminder-like fields
      console.log('\n' + '='.repeat(70));
      console.log('SCANNING ALL APPOINTMENTS FOR REMINDER FIELDS');
      console.log('='.repeat(70));
      
      const allKeys = new Set<string>();
      items.forEach((item: any) => {
        Object.keys(item).forEach(k => allKeys.add(k));
      });
      
      const reminderKeys = Array.from(allKeys).filter(k =>
        k.toLowerCase().includes('remind') ||
        k.toLowerCase().includes('alert') ||
        k.toLowerCase().includes('notif') ||
        k.toLowerCase().includes('alarm')
      );
      
      if (reminderKeys.length > 0) {
        console.log('\n✅ FOUND REMINDER-RELATED FIELDS:');
        reminderKeys.forEach(k => {
          console.log(`\n  Field: ${k}`);
          const samplesWithField = items.filter((item: any) => item[k] !== undefined);
          console.log(`  Found in ${samplesWithField.length}/${items.length} appointments`);
          if (samplesWithField.length > 0) {
            console.log(`  Sample values:`);
            samplesWithField.slice(0, 3).forEach((item: any) => {
              console.log(`    ${JSON.stringify(item[k])}`);
            });
          }
        });
      } else {
        console.log('\n❌ No reminder-related fields found in appointments');
        console.log('\nThis suggests:');
        console.log('1. Reminders might be set only through mobile apps');
        console.log('2. Reminders might be stored separately and not returned in API');
        console.log('3. Reminders might use push notification service (not in REST API)');
      }
    } else {
      console.log('No appointments found for this month');
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  } finally {
    rl.close();
  }
}

inspectAppointment();
