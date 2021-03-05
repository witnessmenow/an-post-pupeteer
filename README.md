# an-post-pupeteer

A Pupeteer script interacting with An Post's website to automate orders.

I have also added a Cheerio script for parsing the email that An Post send, so you can extract the Tracking number programmatically

This is a serious work in progress, it's being held together with sticky tape, but the basics of my use case are working. At the moment it's really only intended for people with a coding background.

This is provided with no warranty!

### Current Limitations

- It only supports Registered, large envelopes at the moment.
- The An Post website changes under the hood based on the country selected, and I'm not exactly sure what the criteria is ahead of time for this. I've come across 3 variants, EU seems to be one, US, Oz and Canada have another and then Switzerland and Russia have another. These 3 variants work, but each additional non EU country will need to get added to the appropriate list (these are just the countries contained in my orders so far)
- It is not battle hardened at all! It has worked for my 20 orders but who know what future orders will throw up
- It currently only supports two different types of items in the item description section, this could be extended relatively easily.

### Installation

- Download and install [NodeJS](https://nodejs.org/en/download/)
- Download this code and navigate to folder on the command line.
- Type 'npm install'

### Usage

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
