/**
 * Deep API Explorer
 * 
 * Examines actual response data to find hidden features like
 * birthdays in calendar, chores in lists, etc.
 * 
 * Run with: npx ts-node deep-explore.ts
 */

import axios from 'axios';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const BASE_URL = 'https://rest.cozi.com';
const API_KEY = 'coziwc|v249_production';

interface DeepExplorationResults {
    timestamp: string;
    findings: Finding[];
    calendarStructure: any;
    listTypes: string[];
    birthdays: any[];
    holidays: any[];
}

interface Finding {
    category: string;
    description: string;
    data?: any;
}

async function main() {
    console.log('🔬 Deep Cozi API Explorer\n');

    const username = process.env.COZI_USERNAME || process.env.COZI_EMAIL;
    const password = process.env.COZI_PASSWORD;

    if (!username || !password) {
        console.error('❌ Missing credentials in .env.local');
        return;
    }

    const client = axios.create({ baseURL: BASE_URL, timeout: 30000 });

    // Authenticate
    console.log('🔐 Authenticating...');
    const authResponse = await client.post(`/api/ext/2207/auth/login?apikey=${API_KEY}`, {
        username, password, issueRefresh: true
    });
    const { accessToken, accountId, accountPersonId } = authResponse.data;
    console.log(`✅ Authenticated. PersonId: ${accountPersonId}\n`);

    const headers = { Authorization: `Bearer ${accessToken}` };
    const results: DeepExplorationResults = {
        timestamp: new Date().toISOString(),
        findings: [],
        calendarStructure: {},
        listTypes: [],
        birthdays: [],
        holidays: []
    };

    // 1. Examine Calendar Response for Hidden Structures
    console.log('📅 Examining calendar structure...');
    const calendarResponse = await client.get(
        `/api/ext/2004/${accountId}/calendar/2026/1?apikey=${API_KEY}`,
        { headers }
    );
    const calendar = calendarResponse.data;

    results.calendarStructure = {
        topLevelKeys: Object.keys(calendar),
        hasItems: !!calendar.items,
        itemCount: calendar.items?.length || 0,
        hasDays: !!calendar.days,
        hasAppointmentsById: !!calendar.appointmentsById,
        hasBirthdaysById: !!calendar.birthdaysById,
        hasHolidaysById: !!calendar.holidaysById,
        hasRecurrenceParentsById: !!calendar.recurrenceParentsById
    };

    // Extract birthdays if present
    if (calendar.birthdaysById && Object.keys(calendar.birthdaysById).length > 0) {
        results.birthdays = Object.values(calendar.birthdaysById);
        results.findings.push({
            category: 'Birthdays',
            description: `Found ${results.birthdays.length} birthdays embedded in calendar response`,
            data: results.birthdays[0] // Sample
        });
        console.log(`   🎂 Found ${results.birthdays.length} birthdays!`);
    } else {
        console.log('   ℹ️  No birthdays in this month\'s calendar');
    }

    // Extract holidays if present
    if (calendar.holidaysById && Object.keys(calendar.holidaysById).length > 0) {
        results.holidays = Object.values(calendar.holidaysById);
        results.findings.push({
            category: 'Holidays',
            description: `Found ${results.holidays.length} holidays embedded in calendar response`,
            data: results.holidays[0]
        });
        console.log(`   🎉 Found ${results.holidays.length} holidays!`);
    } else {
        console.log('   ℹ️  No holidays in this month\'s calendar');
    }

    // Examine items structure
    if (calendar.items?.length > 0) {
        const itemTypes = new Set(calendar.items.map((i: any) => i.itemType || 'unknown'));
        console.log(`   📋 Item types found: ${[...itemTypes].join(', ')}`);
        results.findings.push({
            category: 'Calendar Items',
            description: `Calendar contains these item types: ${[...itemTypes].join(', ')}`,
            data: { sampleItem: calendar.items[0] }
        });
    }

    // 2. Examine Lists for Different Types (Chores, etc.)
    console.log('\n📝 Examining lists for types...');
    const listsResponse = await client.get(
        `/api/ext/2004/${accountId}/list/?apikey=${API_KEY}`,
        { headers }
    );
    const lists = listsResponse.data;

    if (Array.isArray(lists)) {
        const listTypes = new Set(lists.map((l: any) => l.listType || l.type || l.status));
        results.listTypes = [...listTypes] as string[];
        console.log(`   📋 List types found: ${results.listTypes.join(', ')}`);

        lists.forEach((list: any) => {
            console.log(`   - "${list.title || list.name}" (${list.listType || list.type}): ${list.items?.length || 0} items`);
        });

        results.findings.push({
            category: 'Lists',
            description: `Found ${lists.length} lists with types: ${results.listTypes.join(', ')}`,
            data: { listNames: lists.map((l: any) => l.title || l.name) }
        });
    }

    // 3. Test Calendar Search with Correct Format
    console.log('\n🔍 Testing calendar search...');
    try {
        const searchResponse = await client.get(
            `/api/ext/2004/${accountId}/search/calendar/?apikey=${API_KEY}&q=test`,
            { headers }
        );
        console.log('   ✅ Calendar search works!');
        console.log(`   Response keys: ${Object.keys(searchResponse.data).join(', ')}`);
        results.findings.push({
            category: 'Search',
            description: 'Calendar search endpoint is working',
            data: { responseKeys: Object.keys(searchResponse.data) }
        });
    } catch (error: any) {
        console.log(`   ❌ Search failed: ${error.response?.status || error.message}`);
    }

    // 4. Examine Config for Feature Details
    console.log('\n⚙️  Examining config for hidden features...');
    const configResponse = await client.get(
        `/api/ext/2004/${accountId}/config/?apikey=${API_KEY}`,
        { headers }
    );
    const config = configResponse.data;

    // Look for meal planning details
    if (config['feature.Meals']) {
        console.log('   🍽️  Found Meals feature config!');
        results.findings.push({
            category: 'Meals',
            description: 'Meals feature configuration found in config',
            data: config['feature.Meals']
        });
    }

    // List all enabled features
    if (config.features) {
        console.log(`   ✅ Enabled features: ${config.features.join(', ')}`);
    }

    // 5. Check Recipe Details
    console.log('\n🍳 Examining recipes...');
    const recipesResponse = await client.get(
        `/api/ext/2103/${accountId}/food/recipe/?apikey=${API_KEY}`,
        { headers }
    );
    const recipes = recipesResponse.data;
    console.log(`   📚 User recipes: ${recipes.length}`);

    if (recipes.length > 0) {
        console.log(`   Recipe keys: ${Object.keys(recipes[0]).join(', ')}`);
        results.findings.push({
            category: 'Recipes',
            description: `Found ${recipes.length} user recipes`,
            data: { recipeKeys: Object.keys(recipes[0]) }
        });
    }

    // 6. Check for Person Birthday Info
    console.log('\n👥 Checking person details for birthdays...');
    const personsResponse = await client.get(
        `/api/ext/2004/${accountId}/account/person/?apikey=${API_KEY}`,
        { headers }
    );
    const persons = personsResponse.data;

    if (Array.isArray(persons) && persons.length > 0) {
        console.log(`   Found ${persons.length} family members`);
        const personKeys = Object.keys(persons[0]);
        console.log(`   Person keys: ${personKeys.join(', ')}`);

        // Check for birthday field
        const hasBirthday = personKeys.some(k => k.toLowerCase().includes('birth'));
        if (hasBirthday) {
            console.log('   🎂 Birthday field found in person data!');
            results.findings.push({
                category: 'Person Birthdays',
                description: 'Person objects contain birthday information',
                data: persons.map((p: any) => ({ name: p.name, birthday: p.birthday || p.birthdate }))
            });
        }
    }

    // 7. Test Iterable endpoint with personId
    console.log('\n📱 Testing push notification token endpoint...');
    try {
        const iterableResponse = await client.get(
            `/api/ext/2307/${accountId}/iterable/${accountPersonId}/token?apikey=${API_KEY}`,
            { headers }
        );
        console.log('   ✅ Iterable endpoint works!');
        results.findings.push({
            category: 'Push Notifications',
            description: 'Iterable token endpoint works',
            data: iterableResponse.data
        });
    } catch (error: any) {
        console.log(`   ❌ Iterable endpoint: ${error.response?.status || error.message}`);
    }

    // Save results
    console.log('\n' + '='.repeat(70));
    console.log('📊 EXPLORATION COMPLETE');
    console.log('='.repeat(70));

    console.log('\n🔍 Key Findings:');
    results.findings.forEach(f => {
        console.log(`   [${f.category}] ${f.description}`);
    });

    fs.writeFileSync('./deep-exploration-results.json', JSON.stringify(results, null, 2));
    console.log('\n💾 Full results saved to: deep-exploration-results.json');
}

main().catch(console.error);
