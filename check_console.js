const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Listen for console messages
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    const location = msg.location();
    
    console.log(`[${type.toUpperCase()}] ${text}`);
    if (location.url) {
      console.log(`  at ${location.url}:${location.lineNumber}:${location.columnNumber}`);
    }
  });
  
  // Listen for page errors
  page.on('pageerror', error => {
    console.log('[PAGE ERROR]', error.message);
  });
  
  // Listen for request failures
  page.on('requestfailed', request => {
    console.log('[REQUEST FAILED]', request.failure().errorText, request.url());
  });
  
  // Navigate to the page - replace with your URL
  const url = process.argv[2] || 'http://localhost:3000';
  console.log(`Navigating to ${url}...`);
  
  try {
    await page.goto(url, { waitUntil: 'networkidle2' });
    console.log('Page loaded successfully');
    
    // Wait a bit to catch any delayed console messages
    await new Promise(resolve => setTimeout(resolve, 3000));
  } catch (error) {
    console.error('Error loading page:', error);
  }
  
  await browser.close();
})();