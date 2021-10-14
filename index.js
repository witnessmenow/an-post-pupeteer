const puppeteer = require('puppeteer');
const PhoneNumber = require('awesome-phonenumber');
const csv = require('csv-parser')
const fs = require('fs')

const waitBetweenPages = 5000;// Going too fast seems to cause session expiry problems

const timeOutValue = 20000;

// These are not an exhaustive list, just the ones I've hit so far.
// https://postal-codes.net/country-codes/
const countryTypes = [
  ['US', 'CA', 'SG', 'BR'], //type 1
  ['CH', 'RU', 'NO'],
  ['GB'],
  ['AU', 'NZ']
]

const serviceCat = [
  {
    '100': '170912', // Type 0 - EU
    '250': '170915',
    '500': '170918',
  },
  {
    '100': '170594', // Type 1 - US
    '250': '170597',
    '500': '170600',
  },
  {
    '100': '171071', // Type 2 - Non EU (switzerland)
    '250': '171074',
    '500': '171077'
  },
  {
    '100': '170997', // Type 3 - UK
    '250': '171000',
    '500': '171003'
  },
  {
    '100': '172112', // Type 4 - Australia
    '250': '172115',
    '500': '172153'
  },
]

const packageServiceCat = [
  {
    '100': '170913', // Type 0 - EU
    '250': '170915',
    '500': '170919',
  },
  {
    '100': '170595', // Type 1 - US
    '250': '170765',
    '500': '',
  },
  {
    '100': '', // Type 2 - Non EU (switzerland)
    '250': '',
    '500': ''
  },
  {
    '100': '', // Type 3 - UK
    '250': '',
    '500': ''
  },
  {
    '100': '172112', // Type 4 - Australia
    '250': '172115',
    '500': '172153'
  },
]

let cookieHandled = true;

async function launchBrowser() {
  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: "./user_data",
    args: [
      '--window-size=1920,1080'
    ]
  });
  return browser;
}

let labelsAdded = 0;

async function addLabel(browser, data) {

  console.log('Adding label for ' + data.FirstName + ' ' + data.LastName);
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 })
  const postagePage = 'https://www.anpost.com/Post-Parcels/Sending/Calculate-Postage';
  await page.goto(postagePage);

  // --------------------------------------------
  // PAGE 1
  // --------------------------------------------

  if (!cookieHandled) {
    try {
      await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: timeOutValue });
      console.log('Cookie found');
      await page.waitForTimeout(2000);
      await page.click('#onetrust-accept-btn-handler');
      cookieHandled = true;
    } catch (err) {
      console.log('Cookie not found');
      cookieHandled = true;
      console.log(err.message);
    }
  }

  while (page.url() !== postagePage) {
    console.log(page.url())
    console.log("wrong page, will try again in 5 seconds")
    // Need to login manually
    await page.waitForTimeout(5000);
  }

  await page.waitForSelector('input#large', { timeout: timeOutValue });

  await page.waitForTimeout(5000);

  if (labelsAdded == 0 && await page.$(('span.header__basket__circle--red[style="display:none"]') == null)) {
    throw Error("Basket is not empty");
  }



  let largeLetter = false;
  // Select Package Type
  switch (data.Type) {
    case 'Large':
      largeLetter = true;
      await page.$eval(('input#large'), element => element.click());
      break;
    case 'Package':
      await page.$eval(('input#packet'), element => element.click());
      break;
    default:
      throw new Error('Unsupported Package Type: ' + data.Type);
  }

  await page.waitForTimeout(5000);
  // Select Destination Country
  await page.select(('select#destination'), data.Destination);

  await page.waitForTimeout(200);

  // Submit Page 1
  await page.$eval(('a.gtm-cta.sc-cSHVUG'), element => element.click());

  // --------------------------------------------
  // PAGE 2 - Weight
  // --------------------------------------------

  await page.waitForTimeout(waitBetweenPages);

  await page.waitForSelector('input#itemWeight-0', { timeout: timeOutValue });

  // This is probably large letter specific...
  switch (data.WeightCat) {
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

  if (largeLetter) {
    switch (data.Contents) {
      case 'Documents':
        await page.$eval(('input#correspondence'), element => element.click());
        break;
      case 'Other':
        await page.$eval(('input#goods'), element => element.click());
        break;
      default:
        throw new Error('Unsupported Content Type: ' + data.Contents);
    }
  }

  await page.waitForTimeout(100);
  // Submit Page 2
  //await page.$eval(('button.sc-kpOJdX'), element => element.click());
  await page.$eval(('button.sc-ckVGcZ.gtm-cta'), element => element.click());

  // --------------------------------------------
  // PAGE 3 - Postage Option
  // --------------------------------------------

  //await page.waitForTimeout(2000);
  await page.waitForTimeout(waitBetweenPages);
  await page.waitForSelector('div.price-header', { timeout: timeOutValue });
  //Post Service
  switch (data.Service) {
    case 'Registered':

      let countryType = countryTypes.findIndex(type => {
        return type.indexOf(data.Destination) >= 0;
      });
      countryType += 1; //if no type its probably EU, which is index 0

      let service = ''
      if (largeLetter) {
        service = serviceCat[countryType][data.WeightCat]
        if (service) {
          await page.$eval(('input[id=\'' + service + '\']'), element => element.click());
        } else {
          throw new Error('Unsupported serviceCat for country and weight.');
        }
      } else {
        service = packageServiceCat[countryType][data.WeightCat]
        if (service) {
          await page.$eval(('input[id=\'' + service + '\']'), element => element.click());
        } else {
          throw new Error('Unsupported serviceCat for country and weight.');
        }
      }

      break;
    default:
      throw new Error('Unsupported Service Type: ' + data.Service);
  }
  await page.waitForTimeout(100);
  // Submit Page 3
  await page.$eval(('button.gtm-cta.bn.bn--primary'), element => element.click());

  // --------------------------------------------
  // PAGE 4 - Address
  // --------------------------------------------

  await page.waitForTimeout(waitBetweenPages);
  await page.waitForSelector('input#recipientFirstname', { timeout: timeOutValue });
  await page.focus('input#recipientFirstname')
  await page.keyboard.type(data.FirstName)
  await page.focus('input#recipientLastname')
  await page.keyboard.type(data.LastName)

  if (data.CompanyName) {
    await page.focus('input#companyName')
    await page.keyboard.type(data.CompanyName)
  }

  if (data.Email) {
    await page.focus('input#recipientEmail')
    await page.keyboard.type(data.Email)
  }

  if (data.Phone) {
    let pn = new PhoneNumber(data.Phone);
    let countryCodeValue = pn.getRegionCode() + "-" + pn.getCountryCode();
    let prefix = pn.getNumber('significant').substring(0, 2); // Just assuming first 2 digits are prefix, not sure how you are actually meant to know the format of every countries phone number....
    let number = pn.getNumber('significant').substring(2);
    await page.select(('select#recipientPhoneCountryCode'), countryCodeValue);
    await page.focus('input#recipientPhonePrefix')
    await page.keyboard.type(prefix)
    await page.focus('input#recipientPhoneNumber')
    await page.keyboard.type(number)
  }

  await page.focus('input#recipientAddressAddresslineone')
  await page.keyboard.type(data.AddressLine1)
  await page.focus('input#recipientAddressAddresslinetwo')
  await page.keyboard.type(data.AddressLine2)

  await page.focus('input#recipientAddressCity')
  await page.keyboard.type(data.CityState)
  await page.focus('input#recipientAddressPostCode')
  await page.keyboard.type(data.Postcode)


  await page.waitForTimeout(100);
  // Submit Page 4
  await page.$eval(('button.gtm-cta.bn.bn--primary'), element => element.click());

  // --------------------------------------------
  // PAGE 5 - Describe what your sending
  // --------------------------------------------

  await page.waitForTimeout(waitBetweenPages);
  await page.waitForSelector('input#description0', { timeout: timeOutValue });
  // Type of Contents

  //Not sure what is special yet... maybe not EU?
  let isSpecial = countryTypes.some(type => {
    return type.indexOf(data.Destination) >= 0;
  });

  if (isSpecial) {
    switch (data.ContentCategory) {
      case 'Sale':
        await page.select(('select#customsCategoryofitems'), "1");
        await page.waitForTimeout(1000);
        break;
      default:
        throw new Error('Unsupported ContentCategory: ' + data.ContentCategory);
    }
  }


  await page.waitForTimeout(100);

  await page.focus('input#description0')
  await page.keyboard.type(data.ItemDescription0)

  if (isSpecial) {

    await page.focus('input#itemTariff0')
    await page.keyboard.type(data.Taric0)

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
  }

  await page.waitForTimeout(100);

  if (data.ItemDescription1) {
    await page.$eval(('button.add'), element => element.click());
    await page.waitForTimeout(100);

    await page.focus('input#description1')
    await page.keyboard.type(data.ItemDescription1)
    if (isSpecial) {

      await page.focus('input#itemTariff1')
      await page.keyboard.type(data.Taric1)

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
    }

    await page.waitForTimeout(100);
  }

  if (!isSpecial) {
    let value = parseInt(data.Value0);
    if (data.Quantity1) {
      value += parseInt(data.Value1);
    }

    console.log(value);

    await page.focus('input#value');
    await page.type('input#value', value + '');
  }

  await page.waitForTimeout(100);
  await page.$eval(('button.gtm-cta.bn.bn--primary'), element => element.click());

  // --------------------------------------------
  // PAGE 6 - Summary
  // --------------------------------------------

  await page.waitForTimeout(waitBetweenPages);
  await page.waitForSelector('button.gtm-cta.bn.bn--primary', { timeout: 5000 });
  await page.$eval(('button.gtm-cta.bn.bn--primary'), element => element.click());
  //await page.waitForTimeout(500);

  labelsAdded++;


}

async function processData(browser, allData) {
  for (const d of allData) {
    await addLabel(browser, d);
  }
}

csvData = [];

console.log("Launching Browser");
launchBrowser().then(brow => {
  fs.createReadStream('../AnPostPuppet/data.csv')
    //fs.createReadStream('data.csv')
    .pipe(csv())
    .on('data', (data) => csvData.push(data))
    .on('end', () => {
      processData(brow, csvData);
      //console.log('Added All');
    });
});