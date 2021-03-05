const cheerio = require('cheerio');
const MailParser = require("mailparser-mit").MailParser;
const mailparser = new MailParser();
const fs = require("fs");
 
mailparser.on("end", function(mail_object){

    const $ = cheerio.load(mail_object.html);

    //let tableRowsElements = [];
    let tableRowsElements = $('span').filter(function() {
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

        return {
            trackingNumber,
            value,
            transaction,
            destination,
            service,
            cost,
            type,
            weight
        };

    });

    console.log(tableRowsElements);
});


// In Gmail you can save the email as an "eml" file
// - Beside the forward button there is three dots
// click and select "download message"
fs.createReadStream("test.eml").pipe(mailparser);
