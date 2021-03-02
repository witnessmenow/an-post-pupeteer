const puppeteer = require('puppeteer');
const csv = require('csv-parser')
const fs = require('fs')

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

async function launchBrowser() {
  const browser = await puppeteer.launch({headless: false});
  return browser;
  // const page = await browser.newPage();
  // await page.setViewport({ width: 1920, height: 1080 })
}

async function addLabel(browser, data){

  console.log('Adding label for ' + data.FirstName + ' ' + data.LastName);
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 })
  await page.goto('https://www.anpost.com/Post-Parcels/Click-and-Post/Postage-Label/labelling-recipient');
  await page.waitForTimeout(1000);

  // --------------------------------------------
  // PAGE 1
  // --------------------------------------------

  try {
    await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 1000 });
    console.log('Cookie found');
    await page.click('#onetrust-accept-btn-handler');
  } catch {
    console.log('Cookie not found');
  }

  await page.waitForTimeout(1000);

  // Select Package Type
  switch(data.Type){
    case 'Large':
      await page.$eval(('input#large'), element => element.click()); 
      break;
    default:
      throw new Error('Unsupported Package Type: ' + data.Type);
  }

  // Select Destination Country
  await page.select(('select#destination'), data.Destination); 

  await page.waitForTimeout(1000);

  // Submit Page 1
  await page.$eval(('a.gtm-cta'), element => element.click()); 
  
  // --------------------------------------------
  // PAGE 2 - Weight
  // --------------------------------------------

  await page.waitForTimeout(1000);

  // This is probably large letter specific...
  switch(data.WeightCat){
    case '100':
      await page.$eval(('input#itemWeight-0'), element => element.click());
      break;
    case '250':
      await page.$eval(('input#itemWeight-1'), element => element.click());
      break;
    case '500':
      await page.$eval(('input#itemWeight-2'), element => element.click());
      break;
    default:
      throw new Error('Unsupported WeightCat: ' + data.WeightCat);
  }
  
  switch(data.Contents){
    case 'Documents':
      await page.$eval(('input#correspondence'), element => element.click());
      break;
    case 'Other':
      await page.$eval(('input#goods'), element => element.click());
      break;
    default:
      throw new Error('Unsupported Content Type: ' + data.Contents);
  }

  await page.waitForTimeout(500);
  // Submit Page 2
  await page.$eval(('button.sc-kpOJdX'), element => element.click()); 

  // --------------------------------------------
  // PAGE 3 - Postage Option
  // --------------------------------------------

  await page.waitForTimeout(1000);
  //Post Service
  switch(data.Service){
    case 'Registered':
      await page.$eval(('input[id=\'15201\']'), element => element.click()); 
      break;
    default:
      throw new Error('Unsupported Service Type: ' + data.Service);
  }
  await page.waitForTimeout(500);
  // Submit Page 3
  await page.$eval(('button.gtm-cta.bn.bn--primary'), element => element.click()); 

  // --------------------------------------------
  // PAGE 4 - Address
  // --------------------------------------------

  await page.waitForTimeout(1000);
  await page.focus('input#recipientFirstname')
  await page.keyboard.type(data.FirstName)
  await page.focus('input#recipientLastname')
  await page.keyboard.type(data.LastName)

  if(data.CompanyName){
    await page.focus('input#companyName')
    await page.keyboard.type(data.CompanyName)
  }
  
  if(data.Email){
    await page.focus('input#recipientEmail')
    await page.keyboard.type(data.Email)
  }

  if(data.Phone){
    await page.focus('input#recipientPhone')
    await page.keyboard.type(data.Phone)
  }

  await page.focus('input#recipientaddresslineone')
  await page.keyboard.type(data.AddressLine1)
  await page.focus('input#recipientaddresslinetwo')
  await page.keyboard.type(data.AddressLine2)

  await page.focus('input#recipientCity')
  await page.keyboard.type(data.CityState)
  await page.focus('input#recipientpostcode')
  await page.keyboard.type(data.Postcode)


  await page.waitForTimeout(500);
  // Submit Page 4
  await page.$eval(('button.gtm-cta.bn.bn--primary'), element => element.click()); 

  // --------------------------------------------
  // PAGE 5 - Describe what your sending
  // --------------------------------------------

  await page.waitForTimeout(500);
  // Type of Contents
  switch(data.ContentCategory){
    case 'Sale':
      await page.select(('select#customsCategoryofitems'), "1");  
      break;
    default:
      throw new Error('Unsupported ContentCategory: ' + data.ContentCategory);
  }

  await page.waitForTimeout(100);

  await page.focus('input#description0')
  await page.keyboard.type(data.ItemDescription0)

  await page.focus('input#quantity0')
  await page.keyboard.down('Control');
  await page.keyboard.press('A');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
  await page.keyboard.type(data.Quantity0)

  await page.focus('input#value0')
  await page.keyboard.down('Control');
  await page.keyboard.press('A');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
  await page.keyboard.type(data.Value0)

  await page.focus('input#weight0')
  await page.keyboard.down('Control');
  await page.keyboard.press('A');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
  await page.keyboard.type(data.Weight0)

  await page.waitForTimeout(100);

  if(data.ItemDescription1){
    await page.$eval(('button.add'), element => element.click());
    await page.waitForTimeout(100); 

    await page.focus('input#description1')
    await page.keyboard.type(data.ItemDescription1)

    await page.focus('input#quantity1')
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.keyboard.type(data.Quantity1)

    await page.focus('input#value1')
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.keyboard.type(data.Value1)

    await page.focus('input#weight1')
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.keyboard.type(data.Weight1)

    await page.waitForTimeout(100);
  }

  await page.$eval(('button.gtm-cta.bn.bn--primary'), element => element.click());

  // --------------------------------------------
  // PAGE 6 - Summary
  // --------------------------------------------

  await page.waitForTimeout(100);
  await page.$eval(('button.gtm-cta.bn.bn--primary'), element => element.click());
  await page.waitForTimeout(500);


}

async function processData(browser, allData){
  for (const d of allData) {
    await addLabel(browser, d);
  }
}

csvData = [];

console.log("Launching Browser");
launchBrowser().then( brow => {
  fs.createReadStream('data.csv')
  .pipe(csv())
  .on('data', (data) => csvData.push(data))
  .on('end', () => {
    processData(brow, csvData);
    //console.log('Added All');
  });
});