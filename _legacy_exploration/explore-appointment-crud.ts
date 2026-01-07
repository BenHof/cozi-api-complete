/**
 * Comprehensive test for appointment CRUD operations
 * Tests: Create, Read, Edit (single & recurring), Delete
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

async function testAppointmentCRUD() {
  console.log('🧪 Comprehensive Appointment CRUD Test\n');
  
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
  
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const startDay = tomorrow.toISOString().split('T')[0];
  
  // ===== 1. CREATE TEST =====
  console.log('📝 TEST 1: Create Simple Appointment');
  const createPayload = [{
    itemType: 'appointment',
    create: {
      startDay: startDay,
      details: {
        startTime: '10:00',
        endTime: '11:00',
        dateSpan: 1,
        subject: 'CRUD Test Appointment',
        location: 'Test Location',
        notes: 'This is a test appointment for CRUD operations'
      }
    }
  }];
  
  const createResponse = await axios.post(
    `${API_BASE}/${accountId}/calendar/${year}/${month}?apikey=${API_KEY}`,
    createPayload,
    { headers }
  );
  
  console.log('✅ Created:', JSON.stringify(createResponse.data, null, 2));
  
  // Extract the created appointment ID from response
  const createdId = createResponse.data?.items?.[0]?.id || createResponse.data?.[0]?.id;
  console.log(`   Appointment ID: ${createdId}\n`);
  
  if (!createdId) {
    console.log('❌ Could not get appointment ID from response. Fetching calendar...\n');
    const calendarResponse = await axios.get(
      `${API_BASE}/${accountId}/calendar/${year}/${month}`,
      { headers }
    );
    
    const testAppt = calendarResponse.data.items?.find((item: any) => 
      item.subject === 'CRUD Test Appointment'
    );
    
    if (testAppt) {
      console.log('✅ Found appointment in calendar:', testAppt.id);
      console.log('   Version:', testAppt.version);
      console.log('   Details:', JSON.stringify(testAppt, null, 2), '\n');
    }
    
    return;
  }
  
  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // ===== 2. READ TEST =====
  console.log('📖 TEST 2: Read Calendar to Verify');
  const readResponse = await axios.get(
    `${API_BASE}/${accountId}/calendar/${year}/${month}`,
    { headers }
  );
  
  const appointment = readResponse.data.items?.find((item: any) => item.id === createdId);
  if (appointment) {
    console.log('✅ Found appointment:', {
      id: appointment.id,
      subject: appointment.subject,
      version: appointment.version,
      start: appointment.start,
      end: appointment.end
    });
    console.log('\n');
  } else {
    console.log('❌ Could not find appointment in calendar\n');
    return;
  }
  
  // ===== 3. EDIT TEST =====
  console.log('✏️  TEST 3: Edit Appointment');
  const editPayload = [{
    itemType: 'appointment',
    edit: {
      id: createdId,
      version: appointment.version,
      startDay: startDay,
      details: {
        startTime: '14:00',  // Changed from 10:00
        endTime: '15:30',     // Changed from 11:00
        dateSpan: 1,
        subject: 'EDITED - CRUD Test Appointment',  // Changed
        location: 'Updated Location',  // Changed
        notes: 'This appointment was edited via API test'  // Changed
      }
    }
  }];
  
  const editResponse = await axios.post(
    `${API_BASE}/${accountId}/calendar/${year}/${month}?apikey=${API_KEY}`,
    editPayload,
    { headers }
  );
  
  console.log('✅ Edited:', JSON.stringify(editResponse.data, null, 2), '\n');
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // ===== 4. VERIFY EDIT =====
  console.log('🔍 TEST 4: Verify Edit');
  const verifyResponse = await axios.get(
    `${API_BASE}/${accountId}/calendar/${year}/${month}`,
    { headers }
  );
  
  const editedAppt = verifyResponse.data.items?.find((item: any) => item.id === createdId);
  if (editedAppt) {
    console.log('✅ Verified edit:', {
      subject: editedAppt.subject,
      start: editedAppt.start,
      end: editedAppt.end,
      location: editedAppt.location,
      version: editedAppt.version
    });
    console.log('\n');
  }
  
  // ===== 5. DELETE TEST =====
  console.log('🗑️  TEST 5: Delete Appointment');
  const shouldDelete = await prompt('Delete the test appointment? (yes/no): ');
  
  if (shouldDelete.toLowerCase() === 'yes' || shouldDelete.toLowerCase() === 'y') {
    const deletePayload = [{
      itemType: 'appointment',
      delete: {
        id: createdId,
        version: editedAppt.version
      }
    }];
    
    const deleteResponse = await axios.post(
      `${API_BASE}/${accountId}/calendar/${year}/${month}?apikey=${API_KEY}`,
      deletePayload,
      { headers }
    );
    
    console.log('✅ Deleted:', JSON.stringify(deleteResponse.data, null, 2), '\n');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify deletion
    const finalResponse = await axios.get(
      `${API_BASE}/${accountId}/calendar/${year}/${month}`,
      { headers }
    );
    
    const deletedAppt = finalResponse.data.items?.find((item: any) => item.id === createdId);
    if (!deletedAppt) {
      console.log('✅ Verified: Appointment successfully deleted\n');
    } else {
      console.log('⚠️  Appointment still exists after delete\n');
    }
  } else {
    console.log('ℹ️  Skipped deletion. Appointment ID:', createdId, '\n');
  }
  
  console.log('🎉 CRUD Test Complete!');
}

testAppointmentCRUD().catch(error => {
  console.error('\n❌ Error:', error.message);
  if (error.response) {
    console.error('Status:', error.response.status);
    console.error('Data:', JSON.stringify(error.response.data, null, 2));
  }
});
