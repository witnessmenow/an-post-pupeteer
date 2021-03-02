const puppeteer = require('puppeteer');

let destination = 'US';

let firstName = 'Joe';
let lastName = 'Biden';
let companyName = 'The White House';

let email = 'hello@us.gov';
let phone = '555 5555 55';

let addressLine1 = '1600 Pennsylvania Avenue NW';
let addressLine2 = 'Washington';

let cityState = 'DC';
let postCode = '20500';

let goodsDescription = 'Electronic Kit (No battery)';
let itemQuantity = '1';
let itemValue = '15';
let itemWeight = '0.05';

(async () => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 })
  await page.goto('https://www.anpost.com/Post-Parcels/Click-and-Post/Postage-Label/labelling-recipient');
  await page.waitForTimeout(1000);
  try {
    await page.waitForSelector('#onetrust-accept-btn-handler');
    console.log('Cookie found');
    await page.click('#onetrust-accept-btn-handler');
  } catch {
    console.log('not found');
  }

  await page.waitForTimeout(1000);
  //await page.screenshot({ path: 'before.png' });

//   try {
//     await page.waitForSelector('input#large');
//     console.log('Cookie found');
//     await page.evaluate(('input#large'), () => document.querySelector('input#large').click(), 'input#large'); 
//   } catch {
//     console.log('not found');
//   }

  // --------------------------------------------
  // PAGE 1
  // --------------------------------------------

  // Select Large Envelope
  await page.$eval(('input#large'), element => element.click()); 

  // Select Destination Country
  await page.select(('select#destination'), destination); 

  await page.waitForTimeout(1000);

  // Submit Page 1
  await page.$eval(('a.gtm-cta'), element => element.click()); 
  
  // --------------------------------------------
  // PAGE 2 - Weight
  // --------------------------------------------

  await page.waitForTimeout(1000);
  await page.$eval(('input#itemWeight-0'), element => element.click()); 

  await page.$eval(('input#goods'), element => element.click()); 

  await page.waitForTimeout(500);
  // Submit Page 2
  await page.$eval(('button.sc-kpOJdX'), element => element.click()); 

  // --------------------------------------------
  // PAGE 3 - Postage Option
  // --------------------------------------------

  await page.waitForTimeout(1000);
  //Regestired Post
  await page.$eval(('input[id=\'15201\']'), element => element.click()); 

  await page.waitForTimeout(500);
  // Submit Page 3
  await page.$eval(('button.gtm-cta.bn.bn--primary'), element => element.click()); 

  // --------------------------------------------
  // PAGE 4 - Address
  // --------------------------------------------

  await page.waitForTimeout(1000);
  await page.focus('input#recipientFirstname')
  await page.keyboard.type(firstName)
  await page.focus('input#recipientLastname')
  await page.keyboard.type(lastName)

  if(companyName){
    await page.focus('input#companyName')
    await page.keyboard.type(companyName)
  }
  
  if(email){
    await page.focus('input#recipientEmail')
    await page.keyboard.type(email)
  }

  if(phone){
    await page.focus('input#recipientPhone')
    await page.keyboard.type(phone)
  }

  await page.focus('input#recipientaddresslineone')
  await page.keyboard.type(addressLine1)
  await page.focus('input#recipientaddresslinetwo')
  await page.keyboard.type(addressLine2)

  await page.focus('input#recipientCity')
  await page.keyboard.type(cityState)
  await page.focus('input#recipientpostcode')
  await page.keyboard.type(postCode)


  await page.waitForTimeout(500);
  // Submit Page 4
  await page.$eval(('button.gtm-cta.bn.bn--primary'), element => element.click()); 

  // --------------------------------------------
  // PAGE 5 - Describe what your sending
  // --------------------------------------------

  await page.waitForTimeout(500);
  // Type of Contents
  await page.select(('select#customsCategoryofitems'), "1"); 

  await page.waitForTimeout(100);

  await page.focus('input#description0')
  await page.keyboard.type(goodsDescription)

  await page.focus('input#quantity0')
  await page.keyboard.down('Control');
  await page.keyboard.press('A');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
  await page.keyboard.type(itemQuantity)

  await page.focus('input#value0')
  await page.keyboard.down('Control');
  await page.keyboard.press('A');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
  await page.keyboard.type(itemValue)

  await page.focus('input#weight0')
  await page.keyboard.down('Control');
  await page.keyboard.press('A');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
  await page.keyboard.type(itemWeight)

  await page.waitForTimeout(100);

  await page.$eval(('button.gtm-cta.bn.bn--primary'), element => element.click()); 

  //await browser.close();
})();