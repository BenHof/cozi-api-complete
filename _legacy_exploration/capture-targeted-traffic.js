/**
 * Targeted Browser Traffic Capture for Cozi Features
 * Captures API calls for: Meals, Recipes, Birthdays, Search, Chores
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

// Load credentials
require('dotenv').config({ path: '.env.local' });

const COZI_EMAIL = process.env.COZI_EMAIL;
const COZI_PASSWORD = process.env.COZI_PASSWORD;

if (!COZI_EMAIL || !COZI_PASSWORD) {
  console.error('❌ Missing credentials. Set COZI_EMAIL and COZI_PASSWORD in .env.local');
  process.exit(1);
}

const capturedRequests = {
  meals: [],
  recipes: [],
  birthdays: [],
  search: [],
  chores: [],
  calendar: [],
  other: []
};

function categorizeRequest(url) {
  if (url.includes('/meal') || url.includes('/menu') || url.includes('/food')) {
    return 'meals';
  }
  if (url.includes('/recipe') || url.includes('/cookbook')) {
    return 'recipes';
  }
  if (url.includes('/birthday') || url.includes('/specialday')) {
    return 'birthdays';
  }
  if (url.includes('/search') || url.includes('/query')) {
    return 'search';
  }
  if (url.includes('/chore') || url.includes('/task')) {
    return 'chores';
  }
  if (url.includes('/calendar')) {
    return 'calendar';
  }
  return 'other';
}

async function captureTraffic() {
  console.log('🎯 Targeted Cozi Traffic Capture\n');
  console.log('This script will:');
  console.log('  1. Log into Cozi');
  console.log('  2. Wait for you to use specific features');
  console.log('  3. Capture only relevant API calls');
  console.log('  4. Generate organized reports\n');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });

  const page = await browser.newPage();

  // Intercept all requests
  await page.setRequestInterception(true);
  
  page.on('request', request => {
    const url = request.url();
    
    // Only capture API calls to rest.cozi.com
    if (url.includes('rest.cozi.com/api')) {
      const category = categorizeRequest(url);
      const method = request.method();
      const headers = request.headers();
      const postData = request.postData();
      
      capturedRequests[category].push({
        timestamp: new Date().toISOString(),
        method,
        url,
        headers: {
          'authorization': headers.authorization ? 'Bearer [REDACTED]' : undefined,
          'content-type': headers['content-type']
        },
        postData: postData ? (postData.length > 1000 ? postData.substring(0, 1000) + '...[TRUNCATED]' : postData) : null
      });
      
      // Log in real-time
      const emoji = {
        meals: '🍽️',
        recipes: '📖',
        birthdays: '🎂',
        search: '🔍',
        chores: '✅',
        calendar: '📅',
        other: '📦'
      }[category];
      
      console.log(`${emoji} ${method} ${url.replace('https://rest.cozi.com', '')}`);
    }
    
    request.continue();
  });

  page.on('response', async response => {
    const url = response.url();
    
    if (url.includes('rest.cozi.com/api')) {
      const category = categorizeRequest(url);
      const status = response.status();
      
      try {
        const contentType = response.headers()['content-type'];
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          const lastRequest = capturedRequests[category][capturedRequests[category].length - 1];
          if (lastRequest) {
            lastRequest.responseStatus = status;
            lastRequest.responseBody = JSON.stringify(data).length > 2000 
              ? JSON.stringify(data).substring(0, 2000) + '...[TRUNCATED]'
              : data;
          }
        }
      } catch (e) {
        // Non-JSON response or error
      }
    }
  });

  console.log('\n🔐 Logging into Cozi...\n');

  // Navigate to Cozi login
  await page.goto('https://my.cozi.com/');
  
  // Wait for and fill in login form
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.type('input[type="email"]', COZI_EMAIL);
  await page.type('input[type="password"]', COZI_PASSWORD);
  
  // Click login button (try multiple selectors)
  try {
    await page.click('button[type="submit"]');
  } catch (e) {
    try {
      await page.click('button:has-text("Sign In")');
    } catch (e2) {
      // Try clicking any button
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const loginButton = buttons.find(b => b.textContent.toLowerCase().includes('sign') || b.textContent.toLowerCase().includes('log'));
        if (loginButton) loginButton.click();
      });
    }
  }
  
  // Wait for successful login (calendar should load)
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  
  console.log('✅ Logged in successfully!\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  🎬 NOW PERFORM THESE ACTIONS:');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('  1. 🍽️  MEAL PLANNER');
  console.log('     - Click on "Meals" or meal planning section');
  console.log('     - Add a meal to a day');
  console.log('     - View your meal plan');
  console.log('');
  console.log('  2. 📖 RECIPES');
  console.log('     - Go to recipe box/cookbook');
  console.log('     - Add or view a recipe');
  console.log('     - Browse recipe categories');
  console.log('');
  console.log('  3. 🎂 BIRTHDAYS');
  console.log('     - View birthdays section');
  console.log('     - Try to add or edit a birthday');
  console.log('');
  console.log('  4. 🔍 SEARCH');
  console.log('     - Use the search feature');
  console.log('     - Search for calendar events or items');
  console.log('');
  console.log('  5. ✅ CHORES (if available)');
  console.log('     - Look for chore lists');
  console.log('     - Try to add a chore');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Press Ctrl+C when done to save results');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Function to save results
  const saveResults = () => {
    
    // Generate reports
    const summary = {
      capturedAt: new Date().toISOString(),
      totalRequests: Object.values(capturedRequests).reduce((sum, arr) => sum + arr.length, 0),
      byCategory: {
        meals: capturedRequests.meals.length,
        recipes: capturedRequests.recipes.length,
        birthdays: capturedRequests.birthdays.length,
        search: capturedRequests.search.length,
        chores: capturedRequests.chores.length,
        calendar: capturedRequests.calendar.length,
        other: capturedRequests.other.length
      },
      requests: capturedRequests
    };

    // Save full capture
    fs.writeFileSync(
      './targeted-traffic-capture.json',
      JSON.stringify(summary, null, 2)
    );

    // Generate readable report
    let report = '# Targeted Traffic Capture Report\n\n';
    report += `**Captured**: ${new Date().toISOString()}\n`;
    report += `**Total Requests**: ${summary.totalRequests}\n\n`;
    
    for (const [category, requests] of Object.entries(capturedRequests)) {
      if (requests.length > 0) {
        const emoji = {
          meals: '🍽️',
          recipes: '📖',
          birthdays: '🎂',
          search: '🔍',
          chores: '✅',
          calendar: '📅',
          other: '📦'
        }[category];
        
        report += `## ${emoji} ${category.toUpperCase()} (${requests.length} requests)\n\n`;
        
        requests.forEach((req, i) => {
          report += `### Request ${i + 1}\n`;
          report += `- **Method**: ${req.method}\n`;
          report += `- **URL**: ${req.url}\n`;
          report += `- **Status**: ${req.responseStatus || 'N/A'}\n`;
          
          if (req.postData) {
            report += `- **Payload**:\n\`\`\`json\n${req.postData}\n\`\`\`\n`;
          }
          
          if (req.responseBody) {
            const body = typeof req.responseBody === 'string' 
              ? req.responseBody 
              : JSON.stringify(req.responseBody, null, 2);
            report += `- **Response**:\n\`\`\`json\n${body}\n\`\`\`\n`;
          }
          
          report += '\n';
        });
        
        report += '---\n\n';
      }
    }

    fs.writeFileSync('./TARGETED-TRAFFIC-REPORT.md', report);

    console.log('✅ Results saved:');
    console.log('   📄 targeted-traffic-capture.json (full data)');
    console.log('   📄 TARGETED-TRAFFIC-REPORT.md (readable report)');
    console.log('\n📊 Summary:');
    console.log(`   Total Requests: ${summary.totalRequests}`);
    console.log(`   🍽️  Meals: ${summary.byCategory.meals}`);
    console.log(`   📖 Recipes: ${summary.byCategory.recipes}`);
    console.log(`   🎂 Birthdays: ${summary.byCategory.birthdays}`);
    console.log(`   🔍 Search: ${summary.byCategory.search}`);
    console.log(`   ✅ Chores: ${summary.byCategory.chores}`);
    console.log(`   📅 Calendar: ${summary.byCategory.calendar}`);
    console.log(`   📦 Other: ${summary.byCategory.other}\n`);
    
    return summary;
  };

  // Auto-save every 30 seconds as backup
  const autoSaveInterval = setInterval(() => {
    try {
      const summary = {
        capturedAt: new Date().toISOString(),
        totalRequests: Object.values(capturedRequests).reduce((sum, arr) => sum + arr.length, 0),
        byCategory: {
          meals: capturedRequests.meals.length,
          recipes: capturedRequests.recipes.length,
          birthdays: capturedRequests.birthdays.length,
          search: capturedRequests.search.length,
          chores: capturedRequests.chores.length,
          calendar: capturedRequests.calendar.length,
          other: capturedRequests.other.length
        },
        requests: capturedRequests
      };
      
      fs.writeFileSync(
        './targeted-traffic-capture-autosave.json',
        JSON.stringify(summary, null, 2)
      );
    } catch (e) {
      // Ignore autosave errors
    }
  }, 30000);

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n\n💾 Saving captured traffic...\n');
    clearInterval(autoSaveInterval);
    
    try {
      saveResults();
      console.log('✅ Save complete!\n');
    } catch (error) {
      console.error('❌ Error saving:', error.message);
    }
    
    browser.close().then(() => {
      process.exit(0);
    }).catch(() => {
      process.exit(0);
    });
  });
  
  // Handle normal exit
  process.on('exit', () => {
    clearInterval(autoSaveInterval);
  });

  // Keep script running
  await new Promise(() => {});
}

captureTraffic().catch(error => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
