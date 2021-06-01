# an-post-pupeteer

A Pupeteer script interacting with An Post's website to automate orders.

I have also added a Cheerio script for parsing the email that An Post send, so you can extract the Tracking number programmatically. This information can also be used to generate a barcode that can be scanned in the post office. Be careful with this step as An Post do not provide a good way of matching up your tracking numbers with your orders. I use the order of the input CSV and try validate as best I can (check the country and the value, thats all that is possible)

I currently parse the email and print the barcode (barcodeID) onto a sticky label that I attach to the envelope.

This is a serious work in progress, it's being held together with sticky tape, but the basics of my use case are working.

This is provided with no warranty!

### Current Limitations

- It only supports Registered, large envelopes at the moment.
- The An Post website changes under the hood based on the country selected, and I'm not exactly sure what the criteria is ahead of time for this. I've come across 5 variants:

1. EU seems to be one,
2. US, Canada and Brazil are another
3. Switzerland and Russia have another.
4. UK
5. Australia and New Zealand

These variants work, but each additional non EU country will need to get added to the appropriate list (these are just the countries contained in my orders so far)

- I have been using it for the past few months and it has worked fairly well for me.
- There is fail check of the length of the CSV compared to the amount of orders that end up in your basic, **you should check this manually for now!**
- It currently only supports two different types of items in the item description section, this could be extended relatively easily.

## Installation

Note: At the moment it's really only intended for people with a coding background.

- Download and install [NodeJS](https://nodejs.org/en/download/)
- Download this code and navigate to folder on the command line.
- Type 'npm install'

## Usage

#### Web Automation

This will insert orders from a CSV file onto AnPost's website.

- Generate a CSV file in the same format as the data.csv supplied with this code base
- Update the file reference to your csv file in `index.js`
- Run `node index.js`
- When it has completed the automation step it will leave the browser open, you will need to checkout manually. NOTE: If you close or halt the application the browser will also close.

#### Email Prase

This will parse the email you get from An Post. Currently it extracts the data and just prints the info to screen.

- Save the email you recieve from An Post
  - For Gmail, beside the forward button, click the three dots and click "Download message"
- Update the file reference to your eml file in `email.js`
- Run `node email.js`
