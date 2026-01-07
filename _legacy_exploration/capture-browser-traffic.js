/**
 * Puppeteer script to capture API calls from Cozi web app
 * 
 * Install: npm install puppeteer
 * Run: node capture-browser-traffic.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

const capturedRequests = [];

async function captureCoziTraffic() {
  console.log('🌐 Launching browser...\n');
  
  const browser = await puppeteer.launch({
    headless: false, // Show browser so you can interact
    defaultViewport: { width: 1400, height: 900 }
  });

  const page = await browser.newPage();

  // Intercept all requests
  await page.setRequestInterception(true);
  
  page.on('request', request => {
    const url = request.url();
    
    // Capture API calls to rest.cozi.com
    if (url.includes('rest.cozi.com')) {
      const requestData = {
        url: url,
        method: request.method(),
        headers: request.headers(),
        postData: request.postData(),
        timestamp: new Date().toISOString()
      };
      
      capturedRequests.push(requestData);
      
      // Log to console
      console.log(`📡 ${request.method()} ${url}`);
      if (request.postData()) {
        console.log(`   Body: ${request.postData().substring(0, 100)}...`);
      }
    }
    
    request.continue();
  });

  // Capture responses
  page.on('response', async response => {
    const url = response.url();
    
    if (url.includes('rest.cozi.com')) {
      try {
        const status = response.status();
        console.log(`✅ Response ${status} from ${url}`);
        
        // Try to get response body
        const contentType = response.headers()['content-type'];
        if (contentType && contentType.includes('application/json')) {
          const body = await response.text();
          
          // Find matching request
          const matchingRequest = capturedRequests.find(r => r.url === url);
          if (matchingRequest) {
            matchingRequest.responseStatus = status;
            matchingRequest.responseBody = body;
          }
        }
      } catch (error) {
        // Response might be consumed already
      }
    }
  });

  console.log('📝 Please perform these actions in Cozi:\n');
  console.log('1. Login to your account');
  console.log('2. View your calendar');
  console.log('3. Create/edit an appointment');
  console.log('4. Try to set a REMINDER on an appointment');
  console.log('5. View/add recipes (if available)');
  console.log('6. Check messages/journal (if available)');
  console.log('7. View shopping lists');
  console.log('8. Check account settings\n');
  console.log('Press Ctrl+C when done to save results\n');

  // Navigate to Cozi
  await page.goto('https://www.cozi.com', { waitUntil: 'networkidle2' });

  // Function to save and summarize results
  const saveResults = () => {
    console.log('\n\n💾 Saving captured requests...\n');
    
    const results = {
      totalRequests: capturedRequests.length,
      capturedAt: new Date().toISOString(),
      requests: capturedRequests
    };

    fs.writeFileSync(
      './browser-captured-requests.json',
      JSON.stringify(results, null, 2)
    );
    
    return results;
  };

  // Auto-save every 10 seconds
  const autoSaveInterval = setInterval(() => {
    if (capturedRequests.length > 0) {
      saveResults();
      console.log(`[Auto-saved ${capturedRequests.length} requests]`);
    }
  }, 10000);

  // Wait for user to finish
  await new Promise(resolve => {
    const handler = () => {
      clearInterval(autoSaveInterval);
      saveResults();
      resolve();
    };
    process.on('SIGINT', handler);
    process.on('SIGTERM', handler);
  });

  // Create detailed summary
  const endpoints = new Set();
  const endpointDetails = {};
  const reminderRequests = [];
  const recipeRequests = [];
  
  capturedRequests.forEach(req => {
    try {
      const url = new URL(req.url);
      const path = url.pathname;
      const key = `${req.method} ${path}`;
      endpoints.add(key);
      
      if (!endpointDetails[key]) {
        endpointDetails[key] = {
          method: req.method,
          path: path,
          count: 0,
          sampleRequest: req.postData ? req.postData.substring(0, 200) : null,
          sampleResponse: req.responseBody ? req.responseBody.substring(0, 200) : null
        };
      }
      endpointDetails[key].count++;
      
      // Check for reminders
      if (req.postData && req.postData.toLowerCase().includes('reminder')) {
        reminderRequests.push({
          url: req.url,
          method: req.method,
          body: req.postData,
          response: req.responseBody
        });
      }
      
      // Check for recipes
      if (path.includes('recipe') || path.includes('food')) {
        recipeRequests.push({
          url: req.url,
          method: req.method,
          body: req.postData,
          response: req.responseBody
        });
      }
    } catch (e) {}
  });

  console.log('\n' + '='.repeat(70));
  console.log('DISCOVERED ENDPOINTS');
  console.log('='.repeat(70));
  Array.from(endpoints).sort().forEach(endpoint => {
    const details = endpointDetails[endpoint];
    console.log(`  ${endpoint} (${details.count}x)`);
  });
  
  // Reminder analysis
  if (reminderRequests.length > 0) {
    console.log('\n' + '='.repeat(70));
    console.log('⏰ REMINDER REQUESTS FOUND!');
    console.log('='.repeat(70));
    reminderRequests.forEach((req, i) => {
      console.log(`\n  Request ${i + 1}:`);
      console.log(`    URL: ${req.url}`);
      console.log(`    Method: ${req.method}`);
      if (req.body) {
        console.log(`    Body preview: ${req.body.substring(0, 300)}...`);
      }
    });
    
    // Save reminder details separately
    fs.writeFileSync(
      './reminder-requests-detail.json',
      JSON.stringify(reminderRequests, null, 2)
    );
    console.log('\n  📄 Full reminder requests saved to: reminder-requests-detail.json');
  } else {
    console.log('\n⚠️  No reminder requests found - try creating an appointment with a reminder');
  }
  
  // Recipe analysis
  if (recipeRequests.length > 0) {
    console.log('\n' + '='.repeat(70));
    console.log('🍳 RECIPE/FOOD REQUESTS FOUND!');
    console.log('='.repeat(70));
    recipeRequests.forEach((req, i) => {
      console.log(`\n  Request ${i + 1}:`);
      console.log(`    URL: ${req.url}`);
      console.log(`    Method: ${req.method}`);
    });
    
    // Save recipe details separately
    fs.writeFileSync(
      './recipe-requests-detail.json',
      JSON.stringify(recipeRequests, null, 2)
    );
    console.log('\n  📄 Full recipe requests saved to: recipe-requests-detail.json');
  }

  console.log('\n' + '='.repeat(70));
  console.log(`✅ Captured ${capturedRequests.length} total requests`);
  console.log('📄 Full results saved to: browser-captured-requests.json\n');

  await browser.close();
}

// Run
captureCoziTraffic().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
