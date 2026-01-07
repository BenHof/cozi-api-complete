/**
 * Explore Person/Family Member Management API
 * Tests: Add person, Edit person, Delete person, Update settings
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

async function explorePersonManagement() {
  console.log('👥 Person/Family Member Management Explorer\n');
  
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
  
  // ===== 1. READ CURRENT PERSONS =====
  console.log('📖 STEP 1: Read Current Family Members');
  const personsResponse = await axios.get(
    `${API_BASE}/${accountId}/account/person/?apikey=${API_KEY}`,
    { headers }
  );
  
  const persons = personsResponse.data;
  console.log(`✅ Found ${persons.length} family members:\n`);
  persons.forEach((p: any, i: number) => {
    console.log(`${i + 1}. ${p.name}`);
    console.log(`   ID: ${p.accountPersonId}`);
    console.log(`   Type: ${p.accountPersonType}`);
    console.log(`   Email: ${p.email || 'none'}`);
    console.log(`   Notifiable: ${p.notifiable}`);
    console.log(`   Version: ${p.version}`);
    console.log('');
  });
  
  // ===== 2. TEST ADD PERSON (various methods) =====
  console.log('\n═══════════════════════════════════════');
  console.log('  TESTING: Add New Person');
  console.log('═══════════════════════════════════════\n');
  
  const testAddPerson = await prompt('Test adding a new person? (yes/no): ');
  
  if (testAddPerson.toLowerCase() === 'yes' || testAddPerson.toLowerCase() === 'y') {
    const newPersonName = await prompt('Enter test person name: ');
    
    // Try different endpoints and payloads
    const addTests = [
      {
        name: 'POST /account/person/',
        method: 'POST',
        url: `${API_BASE}/${accountId}/account/person/?apikey=${API_KEY}`,
        data: {
          name: newPersonName,
          accountPersonType: 'attendee',
          colorIndex: 1,
          isAdult: false
        }
      },
      {
        name: 'PUT /account/person/',
        method: 'PUT',
        url: `${API_BASE}/${accountId}/account/person/?apikey=${API_KEY}`,
        data: {
          name: newPersonName,
          accountPersonType: 'attendee'
        }
      },
      {
        name: 'POST /account/person/add',
        method: 'POST',
        url: `${API_BASE}/${accountId}/account/person/add?apikey=${API_KEY}`,
        data: {
          name: newPersonName,
          type: 'attendee'
        }
      },
      {
        name: 'POST /person/',
        method: 'POST',
        url: `${API_BASE}/${accountId}/person/?apikey=${API_KEY}`,
        data: {
          name: newPersonName
        }
      }
    ];
    
    let personAdded = false;
    let newPersonId = null;
    
    for (const test of addTests) {
      console.log(`\n🧪 Testing: ${test.name}`);
      try {
        const response = await axios({
          method: test.method,
          url: test.url,
          headers,
          data: test.data
        });
        
        console.log(`✅ SUCCESS (${response.status})`);
        console.log('Response:', JSON.stringify(response.data, null, 2));
        personAdded = true;
        newPersonId = response.data?.accountPersonId || response.data?.id;
        break;
      } catch (error: any) {
        if (error.response) {
          console.log(`❌ FAILED (${error.response.status}): ${JSON.stringify(error.response.data).substring(0, 200)}`);
        } else {
          console.log(`❌ ERROR: ${error.message}`);
        }
      }
    }
    
    if (personAdded && newPersonId) {
      console.log(`\n✅ Successfully added person with ID: ${newPersonId}`);
      
      // ===== 3. TEST EDIT PERSON =====
      console.log('\n═══════════════════════════════════════');
      console.log('  TESTING: Edit Person');
      console.log('═══════════════════════════════════════\n');
      
      const editTests = [
        {
          name: 'PUT /account/person/{id}',
          method: 'PUT',
          url: `${API_BASE}/${accountId}/account/person/${newPersonId}?apikey=${API_KEY}`,
          data: {
            name: `${newPersonName} (EDITED)`,
            colorIndex: 5
          }
        },
        {
          name: 'PATCH /account/person/{id}',
          method: 'PATCH',
          url: `${API_BASE}/${accountId}/account/person/${newPersonId}?apikey=${API_KEY}`,
          data: {
            name: `${newPersonName} (EDITED)`
          }
        },
        {
          name: 'POST /account/person/{id}',
          method: 'POST',
          url: `${API_BASE}/${accountId}/account/person/${newPersonId}?apikey=${API_KEY}`,
          data: {
            name: `${newPersonName} (EDITED)`
          }
        }
      ];
      
      for (const test of editTests) {
        console.log(`\n🧪 Testing: ${test.name}`);
        try {
          const response = await axios({
            method: test.method,
            url: test.url,
            headers,
            data: test.data
          });
          
          console.log(`✅ SUCCESS (${response.status})`);
          console.log('Response:', JSON.stringify(response.data, null, 2));
          break;
        } catch (error: any) {
          if (error.response) {
            console.log(`❌ FAILED (${error.response.status}): ${JSON.stringify(error.response.data).substring(0, 200)}`);
          } else {
            console.log(`❌ ERROR: ${error.message}`);
          }
        }
      }
      
      // ===== 4. TEST DELETE PERSON =====
      console.log('\n═══════════════════════════════════════');
      console.log('  TESTING: Delete Person');
      console.log('═══════════════════════════════════════\n');
      
      const shouldDelete = await prompt('Delete the test person? (yes/no): ');
      
      if (shouldDelete.toLowerCase() === 'yes' || shouldDelete.toLowerCase() === 'y') {
        const deleteTests = [
          {
            name: 'DELETE /account/person/{id}',
            method: 'DELETE',
            url: `${API_BASE}/${accountId}/account/person/${newPersonId}?apikey=${API_KEY}`
          },
          {
            name: 'POST /account/person/{id}/delete',
            method: 'POST',
            url: `${API_BASE}/${accountId}/account/person/${newPersonId}/delete?apikey=${API_KEY}`,
            data: {}
          },
          {
            name: 'POST /account/person/delete',
            method: 'POST',
            url: `${API_BASE}/${accountId}/account/person/delete?apikey=${API_KEY}`,
            data: { id: newPersonId }
          }
        ];
        
        for (const test of deleteTests) {
          console.log(`\n🧪 Testing: ${test.name}`);
          try {
            const response = await axios({
              method: test.method,
              url: test.url,
              headers,
              data: test.data
            });
            
            console.log(`✅ SUCCESS (${response.status})`);
            console.log('Response:', JSON.stringify(response.data, null, 2));
            break;
          } catch (error: any) {
            if (error.response) {
              console.log(`❌ FAILED (${error.response.status}): ${JSON.stringify(error.response.data).substring(0, 200)}`);
            } else {
              console.log(`❌ ERROR: ${error.message}`);
            }
          }
        }
      }
    }
  }
  
  // ===== 5. TEST PERSON SETTINGS =====
  console.log('\n═══════════════════════════════════════');
  console.log('  TESTING: Person Settings');
  console.log('═══════════════════════════════════════\n');
  
  const firstPerson = persons[0];
  console.log(`Using person: ${firstPerson.name} (${firstPerson.accountPersonId})\n`);
  
  const settingsTests = [
    {
      name: 'GET /account/person/{id}/settings',
      method: 'GET',
      url: `${API_BASE}/${accountId}/account/person/${firstPerson.accountPersonId}/settings?apikey=${API_KEY}`
    },
    {
      name: 'GET /person/{id}/settings',
      method: 'GET',
      url: `${API_BASE}/${accountId}/person/${firstPerson.accountPersonId}/settings?apikey=${API_KEY}`
    }
  ];
  
  for (const test of settingsTests) {
    console.log(`🧪 Testing: ${test.name}`);
    try {
      const response = await axios({
        method: test.method,
        url: test.url,
        headers
      });
      
      console.log(`✅ SUCCESS (${response.status})`);
      console.log('Response:', JSON.stringify(response.data, null, 2).substring(0, 500));
    } catch (error: any) {
      if (error.response) {
        console.log(`❌ FAILED (${error.response.status})`);
      } else {
        console.log(`❌ ERROR: ${error.message}`);
      }
    }
  }
  
  console.log('\n🎉 Person Management Exploration Complete!');
}

explorePersonManagement().catch(error => {
  console.error('\n❌ Fatal Error:', error.message);
  if (error.response) {
    console.error('Status:', error.response.status);
    console.error('Data:', error.response.data);
  }
});
