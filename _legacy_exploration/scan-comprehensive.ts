/**
 * Comprehensive Cozi API Scanner
 * 
 * Systematically discovers all API endpoints by testing patterns
 * based on known endpoints and feature flags from the config.
 * 
 * Run with: npx ts-node scan-comprehensive.ts
 */

import axios, { AxiosInstance } from 'axios';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// API versions we've discovered
const API_VERSIONS = ['2004', '2103', '2106', '2207', '2307'];
const BASE_URL = 'https://rest.cozi.com';
const API_KEY = 'coziwc|v249_production';


interface EndpointResult {
    name: string;
    method: string;
    url: string;
    version: string;
    success: boolean;
    status?: number;
    dataKeys?: string[];
    dataPreview?: string;
    error?: string;
}

interface ScanResults {
    timestamp: string;
    accountId: string;
    totalTests: number;
    successful: number;
    failed: number;
    results: EndpointResult[];
    discoveredEndpoints: string[];
}


async function authenticate(client: AxiosInstance, username: string, password: string) {
    const response = await client.post(`/api/ext/2207/auth/login?apikey=${API_KEY}`, {
        username,
        password,
        issueRefresh: true
    });
    return response.data;
}

function buildEndpointList(accountId: string): { name: string; method: string; url: string; version: string }[] {
    const endpoints: { name: string; method: string; url: string; version: string }[] = [];

    // Helper to add endpoints for a version
    const add = (name: string, method: string, path: string, version: string) => {
        endpoints.push({
            name,
            method,
            url: `${BASE_URL}/api/ext/${version}/${accountId}${path}?apikey=${API_KEY}`,
            version
        });
    };

    // ========== v2004 Endpoints ==========
    const v = '2004';

    // Core (known working)
    add('Account Info', 'GET', '/account/', v);
    add('Account Person List', 'GET', '/account/person/', v);
    add('Subscription', 'GET', '/subscription/', v);
    add('Subscription Products', 'GET', '/subscription/product/', v);
    add('Config', 'GET', '/config/', v);
    add('Lists', 'GET', '/list/', v);

    // Calendar variations
    add('Calendar Current Month', 'GET', '/calendar/2026/1', v);
    add('Calendar Search', 'GET', '/search/calendar/&q=test', v);

    // Birthdays (seen in feature flags)
    add('Birthdays List', 'GET', '/birthday/', v);
    add('Birthdays v2', 'GET', '/account/birthday/', v);
    add('Birthdays v3', 'GET', '/calendar/birthday/', v);

    // Chores (seen in feature flags)
    add('Chores', 'GET', '/chore/', v);
    add('Chores v2', 'GET', '/list/chore/', v);
    add('Chores v3', 'GET', '/chores/', v);

    // Meals (seen in feature flags: MealPlanner, MealsWebView)
    add('Meals', 'GET', '/meal/', v);
    add('Meals v2', 'GET', '/meals/', v);
    add('Meal Plan', 'GET', '/mealplan/', v);
    add('Meal Plan v2', 'GET', '/meal/plan/', v);
    add('Menu', 'GET', '/menu/', v);
    add('Menu Weekly', 'GET', '/menu/weekly/', v);

    // Journal/Notes (common family app feature)
    add('Journal', 'GET', '/journal/', v);
    add('Journal Entries', 'GET', '/journal/entry/', v);
    add('Notes', 'GET', '/note/', v);
    add('Notes v2', 'GET', '/notes/', v);
    add('Messages', 'GET', '/message/', v);

    // Photos/Media
    add('Photos', 'GET', '/photo/', v);
    add('Photos v2', 'GET', '/photos/', v);
    add('Media', 'GET', '/media/', v);

    // Activity/Notifications
    add('Activity', 'GET', '/activity/', v);
    add('Notifications', 'GET', '/notification/', v);
    add('Notifications v2', 'GET', '/notifications/', v);

    // Settings variations
    add('Settings', 'GET', '/settings/', v);
    add('Preferences', 'GET', '/preferences/', v);
    add('Account Settings', 'GET', '/account/settings/', v);

    // Holidays (seen in calendar response)
    add('Holidays', 'GET', '/holiday/', v);
    add('Holidays v2', 'GET', '/holidays/', v);

    // Import/Export (seen in featureKeys: GoogleImport)
    add('Import', 'GET', '/import/', v);
    add('Google Import', 'GET', '/import/google/', v);
    add('Export', 'GET', '/export/', v);

    // Shopping mode (seen in feature flags)
    add('Shopping', 'GET', '/shopping/', v);
    add('Shopping List', 'GET', '/shopping/list/', v);

    // ========== v2103 Endpoints (Food/Recipe) ==========
    const v103 = '2103';
    add('Recipes', 'GET', '/food/recipe/', v103);
    add('Curated Recipes', 'GET', '/food/curated/recipe/', v103);
    add('Food Items', 'GET', '/food/', v103);
    add('Food Categories', 'GET', '/food/category/', v103);
    add('Meal Plan (2103)', 'GET', '/food/mealplan/', v103);
    add('Meal Plan v2 (2103)', 'GET', '/mealplan/', v103);
    add('Menu (2103)', 'GET', '/food/menu/', v103);
    add('Menu Weekly (2103)', 'GET', '/food/menu/weekly/', v103);
    add('Grocery List', 'GET', '/food/grocery/', v103);
    add('Pantry', 'GET', '/food/pantry/', v103);

    // ========== v2106 Endpoints (Settings) ==========
    const v106 = '2106';
    add('User Settings', 'GET', '/account/user/settings', v106);
    add('Account Settings (2106)', 'GET', '/account/settings/', v106);
    add('Preferences (2106)', 'GET', '/preferences/', v106);
    add('Notification Settings', 'GET', '/notification/settings/', v106);

    // ========== v2307 Endpoints (Iterable/Push) ==========
    const v307 = '2307';
    // Need personId for iterable, skip for now
    add('Iterable Config', 'GET', '/iterable/', v307);

    return endpoints;
}

async function scanEndpoint(
    client: AxiosInstance,
    endpoint: { name: string; method: string; url: string; version: string },
    token: string
): Promise<EndpointResult> {
    try {
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        };

        let response;
        if (endpoint.method === 'GET') {
            response = await client.get(endpoint.url, config);
        } else if (endpoint.method === 'POST') {
            response = await client.post(endpoint.url, {}, config);
        } else {
            return {
                ...endpoint,
                success: false,
                error: `Unsupported method: ${endpoint.method}`
            };
        }

        const data = response.data;
        let dataKeys: string[] = [];
        let dataPreview = '';

        if (Array.isArray(data)) {
            dataPreview = `Array[${data.length}]`;
            if (data.length > 0 && typeof data[0] === 'object') {
                dataKeys = Object.keys(data[0]);
            }
        } else if (typeof data === 'object' && data !== null) {
            dataKeys = Object.keys(data);
            dataPreview = JSON.stringify(data).substring(0, 200);
        } else {
            dataPreview = String(data).substring(0, 200);
        }

        return {
            ...endpoint,
            success: true,
            status: response.status,
            dataKeys,
            dataPreview
        };
    } catch (error: any) {
        return {
            ...endpoint,
            success: false,
            status: error.response?.status,
            error: error.response?.data ?
                (typeof error.response.data === 'string' ?
                    error.response.data.substring(0, 100) :
                    JSON.stringify(error.response.data).substring(0, 100)) :
                error.message
        };
    }
}

async function main() {
    console.log('🔬 Comprehensive Cozi API Scanner\n');
    console.log('This will systematically test all possible API endpoints.\n');

    const username = process.env.COZI_USERNAME || process.env.COZI_EMAIL;
    const password = process.env.COZI_PASSWORD;

    if (!username || !password) {
        console.error('❌ Missing COZI_USERNAME/COZI_EMAIL and COZI_PASSWORD in .env.local');
        return;
    }

    console.log(`📧 Using credentials for: ${username}\n`);

    const client = axios.create({
        baseURL: BASE_URL,
        timeout: 30000
    });

    console.log('🔐 Authenticating...');
    let auth;
    try {
        auth = await authenticate(client, username, password);
        console.log(`✅ Authenticated as account: ${auth.accountId}\n`);
    } catch (error: any) {
        console.error('❌ Authentication failed:', error.message);
        return;
    }

    const endpoints = buildEndpointList(auth.accountId);
    console.log(`📋 Testing ${endpoints.length} endpoints...\n`);

    const results: ScanResults = {
        timestamp: new Date().toISOString(),
        accountId: auth.accountId,
        totalTests: endpoints.length,
        successful: 0,
        failed: 0,
        results: [],
        discoveredEndpoints: []
    };

    for (let i = 0; i < endpoints.length; i++) {
        const endpoint = endpoints[i];
        const progress = `[${i + 1}/${endpoints.length}]`;

        process.stdout.write(`${progress} Testing ${endpoint.name}... `);

        const result = await scanEndpoint(client, endpoint, auth.accessToken);
        results.results.push(result);

        if (result.success) {
            results.successful++;
            results.discoveredEndpoints.push(`${result.method} ${result.url.split('?')[0].replace(auth.accountId, '{accountId}')}`);
            console.log(`✅ ${result.status} - Keys: [${result.dataKeys?.join(', ') || 'none'}]`);
        } else {
            results.failed++;
            console.log(`❌ ${result.status || 'ERR'}`);
        }
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 SCAN RESULTS');
    console.log('='.repeat(70));
    console.log(`Total tested: ${results.totalTests}`);
    console.log(`✅ Successful: ${results.successful}`);
    console.log(`❌ Failed: ${results.failed}`);

    console.log('\n📡 DISCOVERED WORKING ENDPOINTS:');
    results.discoveredEndpoints.forEach(ep => {
        console.log(`   ${ep}`);
    });

    // Analyze results by category
    const byVersion: Record<string, EndpointResult[]> = {};
    results.results.filter(r => r.success).forEach(r => {
        if (!byVersion[r.version]) byVersion[r.version] = [];
        byVersion[r.version].push(r);
    });

    console.log('\n📁 BY API VERSION:');
    Object.entries(byVersion).forEach(([version, endpoints]) => {
        console.log(`   v${version}: ${endpoints.length} working endpoints`);
        endpoints.forEach(ep => console.log(`      - ${ep.name}`));
    });

    // Save results
    const outputFile = './comprehensive-scan-results.json';
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    console.log(`\n💾 Full results saved to: ${outputFile}`);

    // Generate markdown summary
    const mdOutput = generateMarkdownReport(results);
    fs.writeFileSync('./API-SCAN-REPORT.md', mdOutput);
    console.log('📄 Report saved to: API-SCAN-REPORT.md');
}

function generateMarkdownReport(results: ScanResults): string {
    let md = `# Cozi API Scan Report\n\n`;
    md += `**Scan Date:** ${results.timestamp}\n`;
    md += `**Account ID:** ${results.accountId}\n\n`;
    md += `## Summary\n\n`;
    md += `- **Total Tested:** ${results.totalTests}\n`;
    md += `- **Successful:** ${results.successful}\n`;
    md += `- **Failed:** ${results.failed}\n\n`;

    md += `## Working Endpoints\n\n`;
    md += `| Name | Method | Version | Response Keys |\n`;
    md += `|------|--------|---------|---------------|\n`;

    results.results.filter(r => r.success).forEach(r => {
        const keys = r.dataKeys?.join(', ') || '-';
        md += `| ${r.name} | ${r.method} | v${r.version} | ${keys} |\n`;
    });

    md += `\n## Failed Endpoints (404/403)\n\n`;
    md += `These endpoints did not exist or required different permissions:\n\n`;

    results.results.filter(r => !r.success && r.status === 404).forEach(r => {
        md += `- ❌ ${r.name} (${r.method})\n`;
    });

    return md;
}

main().catch(console.error);
