/**
 * Test script to create an appointment with reminder on Ben's Cozi calendar
 */

import { CoziApiClient } from './src/CoziApiClient';
import axios from 'axios';
import * as readline from 'readline';

async function testCreateAppointment() {
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
    console.log('📅 Cozi Appointment Creation Test\n');
    
    const username = await question('Enter your Cozi email: ');
    const password = await question('Enter your Cozi password: ');
    console.log('');

    const client = new CoziApiClient({ debug: true });
    
    console.log('🔐 Authenticating...');
    const auth = await client.authenticate(username, password);
    console.log('✓ Authenticated\n');

    const accountId = auth.accountId;
    const token = auth.accessToken;

    // Get family members to find Ben's person ID
    console.log('👥 Getting family members...');
    const personsResponse = await axios.get(
      `https://rest.cozi.com/api/ext/2004/${accountId}/account/person/`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const persons = personsResponse.data;
    const accountPersonId = auth.accountPersonId; // The current logged-in user
    
    console.log('\nFamily members:');
    persons.forEach((p: any, i: number) => {
      console.log(`  ${i + 1}. ${p.name} (${p.email}) - notifiable: ${p.notifiable}, type: ${p.accountPersonType}`);
    });

    // Find Ben
    const ben = persons.find((p: any) => 
      p.name?.toLowerCase().includes('ben') || 
      p.email?.toLowerCase().includes('ben')
    );

    if (!ben) {
      console.log('\n⚠️  Could not find Ben in family members. Using first person.');
    }

    const benPersonId = ben?.accountPersonId || persons[0]?.accountPersonId;
    console.log(`\n✓ Using person: ${ben?.name || persons[0]?.name} (${benPersonId})\n`);

    // Create appointment for tomorrow at 2 PM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const year = tomorrow.getFullYear();
    const month = tomorrow.getMonth() + 1;
    const day = tomorrow.getDate();
    const startDay = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // Get ALL notifiable family members (users only, including self)
    const notifiablePersons = persons.filter((p: any) => 
      p.notifiable === true && 
      p.accountPersonType === 'user'
    );
    const notifyPersonIds = notifiablePersons.map((p: any) => p.accountPersonId);
    console.log(`\n📬 Will notify ${notifyPersonIds.length} notifiable users: ${notifiablePersons.map((p: any) => p.name).join(', ')}\n`);

    console.log('📝 Creating appointment...');
    console.log(`   Date: ${startDay}`);
    console.log(`   Time: 14:00 - 15:00`);
    console.log(`   Subject: API Test with Multiple Reminders`);
    console.log(`   Reminders (max 3):`);
    console.log(`     - 30 minutes before`);
    console.log(`     - 1 hour before`);
    console.log(`     - 1 day before`);
    console.log(`   Notify: ${notifyPersonIds.length} users (${notifiablePersons.map((p: any) => p.name).join(', ')})\n`);

    const appointmentData = [{
      itemType: 'appointment',
      notifyPersons: notifyPersonIds,
      create: {
        startDay: startDay,
        reminders: [
          { minutesBefore: 30 },     // 30 minutes before
          { minutesBefore: 60 },     // 1 hour before  
          { minutesBefore: 1440 }    // 1 day before (24 hours)
        ],
        details: {
          startTime: '14:00',
          endTime: '15:00',
          dateSpan: 1,
          subject: 'API Test with Multiple Reminders',
          location: 'Test Location with Reminders',
          notes: `This appointment has 3 reminders (Cozi max):\n- 30 min before\n- 1 hour before\n- 1 day before\n\nNotified: ${notifiablePersons.map((p: any) => p.name).join(', ')}. Feel free to delete!`
        }
      }
    }];

    console.log('Sending request...\n');

    const createResponse = await axios.post(
      `https://rest.cozi.com/api/ext/2004/${accountId}/calendar/${year}/${month}?apikey=coziwc|v249_production`,
      appointmentData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ SUCCESS! Appointment created!\n');
    console.log('Response status:', createResponse.status);
    console.log('Response data:', JSON.stringify(createResponse.data, null, 2));

    // Verify by fetching the calendar
    console.log('\n🔍 Verifying - fetching calendar...\n');
    const calendarResponse = await axios.get(
      `https://rest.cozi.com/api/ext/2004/${accountId}/calendar/${year}/${month}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const items = calendarResponse.data.items || [];
    const testAppointment = items.find((item: any) => 
      item.subject === 'API Test with Multiple Reminders'
    );

    if (testAppointment) {
      console.log('✅ VERIFIED! Appointment found in calendar:');
      console.log('');
      console.log('   ID:', testAppointment.id);
      console.log('   Subject:', testAppointment.subject);
      console.log('   Date:', `${testAppointment.startYear}-${testAppointment.startMonth}-${testAppointment.startDay}`);
      console.log('   Time:', `${testAppointment.start} - ${testAppointment.end}`);
      console.log('   Location:', testAppointment.location);
      console.log('   Reminders:', JSON.stringify(testAppointment.reminders));
      console.log('   Version:', testAppointment.version);
      console.log('');
      console.log('🎉 The appointment is now on your Cozi calendar!');
      console.log('   You should receive a reminder 30 minutes before the event.');
    } else {
      console.log('⚠️  Appointment created but not immediately visible in calendar.');
      console.log('   This is normal - it may take a moment to appear.');
    }

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  } finally {
    rl.close();
  }
}

testCreateAppointment();
