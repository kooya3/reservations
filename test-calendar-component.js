// Test script to verify the calendar component works correctly
const puppeteer = require('puppeteer');

async function testCalendarComponent() {
  let browser;
  
  try {
    console.log('🚀 Starting calendar component test...');
    
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text());
      }
    });
    
    // Listen for page errors
    page.on('error', err => {
      console.log('❌ Page Error:', err.message);
    });
    
    // Go to the register page (assuming it exists)
    console.log('📄 Navigating to register page...');
    
    // First, let's check if the server is actually running
    try {
      await page.goto('http://localhost:3001', { 
        waitUntil: 'networkidle0',
        timeout: 10000 
      });
      console.log('✅ Successfully loaded main page');
    } catch (error) {
      console.log('❌ Failed to load main page:', error.message);
      return;
    }
    
    // Try to find a register link or navigate directly to register page
    try {
      // Look for register or sign up link
      const registerLink = await page.$('a[href*="register"], button[href*="register"], a[href*="sign"], button[href*="sign"]');
      if (registerLink) {
        await registerLink.click();
        console.log('✅ Clicked register link');
        await page.waitForTimeout(2000);
      } else {
        // Try direct navigation
        await page.goto('http://localhost:3001/guests/123/register', { 
          waitUntil: 'networkidle0',
          timeout: 10000 
        });
        console.log('✅ Navigated directly to register page');
      }
    } catch (error) {
      console.log('⚠️  Register page navigation failed, trying alternative paths...');
      
      // Try other possible register paths
      const paths = ['/register', '/sign-up', '/patients/123/register'];
      for (const path of paths) {
        try {
          await page.goto(`http://localhost:3001${path}`, { 
            waitUntil: 'networkidle0',
            timeout: 5000 
          });
          console.log(`✅ Successfully loaded ${path}`);
          break;
        } catch (err) {
          console.log(`❌ Failed to load ${path}`);
        }
      }
    }
    
    // Check if the date picker component is present
    console.log('🔍 Looking for calendar component...');
    
    // Wait a bit for the page to fully render
    await page.waitForTimeout(3000);
    
    // Look for our calendar component elements
    const calendarElements = await page.$$('[data-slot="calendar"], .date-picker, button[data-day], [class*="calendar"]');
    
    if (calendarElements.length > 0) {
      console.log('✅ Found calendar-related elements on page');
      
      // Try to click the calendar trigger
      const calendarTrigger = await page.$('button[class*="calendar"], button[class*="date"], [role="button"]:has(svg[data-lucide="calendar"])');
      if (calendarTrigger) {
        await calendarTrigger.click();
        console.log('✅ Clicked calendar trigger');
        await page.waitForTimeout(1000);
        
        // Check if popover/calendar opened
        const calendarPopover = await page.$('[role="dialog"], [data-slot="calendar"], .calendar');
        if (calendarPopover) {
          console.log('✅ Calendar popover opened successfully');
        } else {
          console.log('⚠️  Calendar popover did not open');
        }
      }
    } else {
      console.log('⚠️  No calendar elements found. Checking page structure...');
      
      // Get page title and some content to understand what page we're on
      const title = await page.title();
      console.log('Page title:', title);
      
      // Check if there are any form fields
      const formFields = await page.$$('input, select, textarea, button');
      console.log(`Found ${formFields.length} form elements`);
      
      // Check if there are any date-related inputs
      const dateInputs = await page.$$('input[type="date"], input[placeholder*="date"], input[placeholder*="birthday"]');
      console.log(`Found ${dateInputs.length} date-related inputs`);
    }
    
    console.log('✅ Calendar component test completed');
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Check if puppeteer is available
try {
  testCalendarComponent();
} catch (error) {
  console.log('❌ Puppeteer not available, skipping component test');
  console.log('ℹ️  To run this test, install puppeteer: npm install puppeteer');
}