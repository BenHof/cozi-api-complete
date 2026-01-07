/**
 * List Section Traffic Capture
 * 
 * Run this, then use Cozi in a browser to add/organize list sections.
 * The script will capture all list-related API traffic.
 * 
 * Run with: node capture-list-traffic.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

const capturedRequests = [];

async function captureListTraffic() {
    console.log('🛒 List Section Traffic Capture\n');
    console.log('This will open Cozi and capture all list-related API traffic.\n');

    const browser = await puppeteer.launch({
        headless: false, // Show browser so you can interact
        defaultViewport: { width: 1400, height: 900 }
    });

    const page = await browser.newPage();

    // Intercept all requests
    await page.setRequestInterception(true);

    page.on('request', request => {
        const url = request.url();

        // Capture API calls to rest.cozi.com, especially list-related
        if (url.includes('rest.cozi.com')) {
            const isListRelated = url.includes('/list') ||
                url.includes('/item') ||
                url.includes('/section') ||
                url.includes('/category') ||
                url.includes('/shopping');

            const requestData = {
                url: url,
                method: request.method(),
                postData: request.postData(),
                timestamp: new Date().toISOString(),
                isListRelated: isListRelated
            };

            capturedRequests.push(requestData);

            if (isListRelated) {
                console.log(`📡 [LIST] ${request.method()} ${url}`);
                if (request.postData()) {
                    console.log(`   Body: ${request.postData()}`);
                }
            }
        }

        request.continue();
    });

    // Capture responses
    page.on('response', async response => {
        const url = response.url();

        if (url.includes('rest.cozi.com') && url.includes('/list')) {
            try {
                const status = response.status();
                const body = await response.text();

                // Find matching request
                const matchingRequest = capturedRequests.find(r => r.url === url);
                if (matchingRequest) {
                    matchingRequest.responseStatus = status;
                    matchingRequest.responseBody = body;

                    // Parse and look for sections
                    try {
                        const data = JSON.parse(body);
                        if (Array.isArray(data)) {
                            console.log(`\n📋 LIST RESPONSE ANALYSIS:`);
                            data.forEach(list => {
                                console.log(`   List: "${list.title}" (${list.listType})`);
                                console.log(`   Keys: ${Object.keys(list).join(', ')}`);
                                if (list.items && list.items.length > 0) {
                                    console.log(`   Item keys: ${Object.keys(list.items[0]).join(', ')}`);
                                    // Look for section-related fields
                                    const sectionFields = Object.keys(list.items[0]).filter(k =>
                                        k.toLowerCase().includes('section') ||
                                        k.toLowerCase().includes('category') ||
                                        k.toLowerCase().includes('group') ||
                                        k.toLowerCase().includes('header')
                                    );
                                    if (sectionFields.length > 0) {
                                        console.log(`   🎉 SECTION FIELDS FOUND: ${sectionFields.join(', ')}`);
                                    }
                                }
                            });
                        }
                    } catch (e) { }
                }
            } catch (error) { }
        }
    });

    console.log('\n📝 INSTRUCTIONS:');
    console.log('1. Log into Cozi');
    console.log('2. Go to your Shopping Lists');
    console.log('3. Add items to different SECTIONS (like "Produce", "Dairy")');
    console.log('4. Move items between sections');
    console.log('5. Create a new section');
    console.log('6. Press Ctrl+C when done\n');

    // Navigate to Cozi lists
    await page.goto('https://my.cozi.com/lists', { waitUntil: 'networkidle2' });

    // Auto-save every 5 seconds
    const autoSaveInterval = setInterval(() => {
        if (capturedRequests.length > 0) {
            fs.writeFileSync('./list-traffic-capture.json', JSON.stringify({
                capturedAt: new Date().toISOString(),
                totalRequests: capturedRequests.length,
                listRelatedRequests: capturedRequests.filter(r => r.isListRelated).length,
                requests: capturedRequests
            }, null, 2));
            console.log(`[Auto-saved ${capturedRequests.length} requests]`);
        }
    }, 5000);

    // Wait for user
    await new Promise(resolve => {
        process.on('SIGINT', () => {
            clearInterval(autoSaveInterval);
            resolve();
        });
    });

    // Final save and analysis
    fs.writeFileSync('./list-traffic-capture.json', JSON.stringify({
        capturedAt: new Date().toISOString(),
        totalRequests: capturedRequests.length,
        listRelatedRequests: capturedRequests.filter(r => r.isListRelated).length,
        requests: capturedRequests
    }, null, 2));

    // Analyze for sections
    console.log('\n' + '='.repeat(70));
    console.log('📊 CAPTURE COMPLETE');
    console.log('='.repeat(70));

    const listRequests = capturedRequests.filter(r => r.isListRelated);
    console.log(`Total requests: ${capturedRequests.length}`);
    console.log(`List-related: ${listRequests.length}`);

    // Look for any section patterns in request/response data
    let foundSections = false;
    listRequests.forEach(req => {
        const combined = (req.postData || '') + (req.responseBody || '');
        if (combined.toLowerCase().includes('section') ||
            combined.toLowerCase().includes('category') ||
            combined.toLowerCase().includes('aisle')) {
            console.log(`\n🎉 POTENTIAL SECTION DATA in ${req.url}:`);
            console.log(`   POST: ${req.postData?.substring(0, 200) || 'none'}`);
            console.log(`   Response: ${req.responseBody?.substring(0, 200) || 'none'}`);
            foundSections = true;
        }
    });

    if (!foundSections) {
        console.log('\n❌ No section-related fields found in captured traffic');
        console.log('   Sections may be client-side only or use a different mechanism');
    }

    console.log('\n💾 Full results saved to: list-traffic-capture.json');

    await browser.close();
}

captureListTraffic().catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
});
