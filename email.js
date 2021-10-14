const cheerio = require('cheerio');
const MailParser = require("mailparser-mit").MailParser;
const mailparser = new MailParser();

const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const csv = require('csv-parser')
const fs = require('fs')

// CSV:Email
const countryMap = {
    'United States of America': 'United States',
    'Russia': 'Russian Federation',
    'United Kingdom': 'Great Britain'
}

function checkCountry(elementCountry, trackCountry) {
    let newElemCountry = elementCountry;

    if (countryMap.hasOwnProperty(elementCountry)) {
        newElemCountry = countryMap[elementCountry];
    }

    return newElemCountry == trackCountry;
}

function mergeData(csvData, trackingData) {
    const mergedData = [];
    if (csvData.length == trackingData.length) {
        csvData.forEach((element, index) => {
            const trackingDataRef = trackingData.length - index - 1;
            let value = parseFloat(element.Value0);
            if (element.Value1) {
                value += parseFloat(element.Value1);
            }

            const valueMatches = parseFloat(trackingData[trackingDataRef].value.replace('€', '')) == value;
            const countriesMatches = checkCountry(element.Country, trackingData[trackingDataRef].destination);

            if (valueMatches && countriesMatches) {
                mergedData.push(Object.assign(element, trackingData[trackingDataRef]));
            } else {
                console.log('ERROR, they did not match up, ' + element.LastName);
                console.log('Value fromCSV: ' + value + ', value from email: ' + parseFloat(trackingData[trackingDataRef].value.replace('€', '')));
                console.log('Country from CSV: ' + element.Country + ', country from email: ' + trackingData[trackingDataRef].destination);
            }
        });
    }

    console.log(mergedData.length);
    return mergedData;
    //console.log(csvData);
}

mailparser.on("end", function (mail_object) {

    // const barcodeFolder = 'C:\\Users\\Brian\\Documents\\Code\\AnPostPuppet\\barcodeimages\\'
    // console.log("attachments");
    // console.log(mail_object.attachments);
    // mail_object.attachments.filter(f => f.contentType == 'image/png').forEach((file => {
    //     fs.writeFile(barcodeFolder + file.contentId, file.content, file.transferEncoding, function(err){
    //         console.log(err);
    //     } );
    // }))
    const $ = cheerio.load(mail_object.html);



    //let tableRowsElements = [];
    let trackingData = $('span').filter(function () {
        return $(this).text().trim() === 'Tracking Number:';
    }).toArray().map(elem => {
        let trackValueTr = elem.parent.parent;

        let trackingNumber = $(trackValueTr).find('td:nth-child(2)').text().replace('\n', '').trim();
        let value = $(trackValueTr).find('td:nth-child(5)').text().replace('\n', '').trim();

        let transactionDestinationTr = $(trackValueTr).prev('tr');

        let transaction = $(transactionDestinationTr).find('td:nth-child(2)').text().replace('\n', '').trim();
        let destination = $(transactionDestinationTr).find('td:nth-child(5)').text().replace('\n', '').trim();

        let serviceCostTr = $(trackValueTr).next('tr');
        let service = $(serviceCostTr).find('td:nth-child(2)').text().replace('\n', '').trim();
        let cost = $(serviceCostTr).find('td:nth-child(5)').text().replace('\n', '').trim();

        let typeWeightTr = $(serviceCostTr).next('tr');
        let type = $(typeWeightTr).find('td:nth-child(2)').text().replace('\n', '').trim();
        let weight = $(typeWeightTr).find('td:nth-child(5)').text().replace('\n', '').trim();

        let barcodeTr = $(typeWeightTr).next('tr');
        let imageDiv = $(barcodeTr).find('div');
        let barcodeId = imageDiv.text().replace('\n', '').trim();

        return {
            trackingNumber,
            value,
            transaction,
            destination,
            service,
            cost,
            type,
            weight,
            barcodeId
        };

    });

    console.log(trackingData);

    let csvData = [];
    fs.createReadStream('../AnPostPuppet/data.csv')
        .pipe(csv())
        .on('data', (data) => csvData.push(data))
        .on('end', () => {
            const csvFormat = mergeData(csvData, trackingData);
            const csvWriter = createCsvWriter({
                path: '../AnPostPuppet/track-data.csv',
                header: [
                    { id: 'OrderNumber', title: 'OrderNumber' },
                    { id: 'trackingNumber', title: 'TrackingNumber' },
                    { id: 'Type', title: 'Type' },
                    { id: 'Destination', title: 'Destination' },
                    { id: 'Country', title: 'Country' },
                    { id: 'WeightCat', title: 'WeightCat' },
                    { id: 'Contents', title: 'Contents' },
                    { id: 'Service', title: 'Service' },
                    { id: 'FirstName', title: 'FirstName' },
                    { id: 'LastName', title: 'LastName' },
                    { id: 'CompanyName', title: 'CompanyName' },
                    { id: 'Email', title: 'Email' },
                    { id: 'Phone', title: 'Phone' },
                    { id: 'AddressLine1', title: 'AddressLine1' },
                    { id: 'AddressLine2', title: 'AddressLine2' },
                    { id: 'CityState', title: 'CityState' },
                    { id: 'Postcode', title: 'Postcode' },
                    { id: 'ContentCategory', title: 'ContentCategory' },
                    { id: 'ItemDescription0', title: 'ItemDescription0' },
                    { id: 'Quantity0', title: 'Quantity0' },
                    { id: 'Value0', title: 'Value0' },
                    { id: 'Weight0', title: 'Weight0' },
                    { id: 'ItemDescription1', title: 'ItemDescription1' },
                    { id: 'Quantity1', title: 'Quantity1' },
                    { id: 'Value1', title: 'Value1' },
                    { id: 'Weight1', title: 'Weight1' },
                    { id: 'barcodeId', title: 'barcodeId' },
                    { id: 'Sku', title: 'Sku' }
                ]
            });
            return csvWriter.writeRecords(csvFormat)
            //console.log('Added All');
        });
});


// In Gmail you can save the email as an "eml" file
// - Beside the forward button there is three dots
// click and select "download message"
//fs.createReadStream('test.eml').pipe(mailparser);
fs.createReadStream('../AnPostPuppet/1410.eml').pipe(mailparser);

