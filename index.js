// Import necessary packages
const puppeteer = require("puppeteer");
const PORT = 8000;
const express = require("express");
const cors = require("cors");
const app = express();
const fs = require("fs");
const dotenv = require("dotenv");

// Set up CORS
app.use(cors({ origin: "*" }));

// Listen to the specified port and log a message when the server starts
app.listen(PORT, () => console.log(`server running on PORT ${PORT}`));

// Load environment variables from a .env file
dotenv.config();

// Initialize arrays to store facts for different computer components
const computerFacts = [];
const gpuFacts = [];
const cpuFacts = [];
const chassiFacts = [];
const motherboardFacts = [];
const ssdFacts = [];
const netaggregateFacts = [];
const hddFacts = [];
const ramFacts = [];
const coolerFacts = [];

// Load URLs for different computer component web pages from environment variables
const gpuUrl = process.env.GPU_URL;
const cpuUrl = process.env.CPU_URL;
const chassiUrl = process.env.CHASSI_URL;
const motherboardUrl = process.env.MOTHERBOARD_URL;
const ssdUrl = process.env.SSD_URL;
const netaggregateUrl = process.env.NETAGGREGATE_URL;
const ramUrl = process.env.RAM_URL;
const coolerUrl = process.env.COOLER_URL;
const hddUrl = process.env.HDD_URL;

// Set the selector for the data to be scraped from the web pages
const inetSelector = ".l1qhmxkx";

// Scrape data from a web page
const getWebData = async (url, selector) => {
  // Launch Puppeteer and navigate to the specified URL
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(url);

  // Scroll down to the bottom of the page to load all the data
  let previousHeight = 0;
  while (true) {
    const currentHeight = await page.evaluate("document.body.scrollHeight");
    if (currentHeight === previousHeight) {
      break;
    }
    await page.evaluate(`window.scrollTo(0, ${currentHeight})`);
    await page.waitForTimeout(1000);
    previousHeight = currentHeight;
  }

  // Extract the data from the web page and format it
  const data = await page.evaluate((selector) => {
    // Function to convert the price string to a number
    const convertPrice = (price) => {
      const cleanedPrice = price.replace(/[^\d.,]+/g, "");
      return parseFloat(cleanedPrice.replace(",", "."));
    };

    // Select all the rows of data
    const rows = Array.from(document.querySelectorAll(selector));

    // Format each row of data into an object and return an array of formatted data
    const formattedData = rows.map((row) => ({
      namn: row.querySelector("a").getAttribute("aria-label"),
      pris:
        Math.round(
          (convertPrice(row.querySelector(".bp5wbcj").innerText) * 1.05) / 10
        ) * 10,
      bilder: row.querySelector("img").getAttribute("src"),
      kategorier: document.querySelector(".hx450ow").innerText,
    }));

    return formattedData;
  }, selector);

  // Close the Puppeteer browser instance and return the formatted data
  await browser.close();
  return data;
};

const main = async () => {
  const gpuData = await getWebData(gpuUrl, inetSelector);
  gpuFacts.push(gpuData);

  const cpuData = await getWebData(cpuUrl, inetSelector);
  cpuFacts.push(cpuData);

  const chassiData = await getWebData(chassiUrl, inetSelector);
  chassiFacts.push(chassiData);

  const motherboardData = await getWebData(motherboardUrl, inetSelector);
  motherboardFacts.push(motherboardData);

  const ssdData = await getWebData(ssdUrl, inetSelector);
  ssdFacts.push(ssdData);

  const coolerData = await getWebData(coolerUrl, inetSelector);
  coolerFacts.push(coolerData);

  const ramData = await getWebData(ramUrl, inetSelector);
  ramFacts.push(ramData);

  const netaggregateData = await getWebData(netaggregateUrl, inetSelector);
  netaggregateFacts.push(netaggregateData);

  const hddData = await getWebData(hddUrl, inetSelector);
  hddFacts.push(hddData);

  computerFacts.push(
    ...gpuFacts,
    ...cpuFacts,
    ...chassiFacts,
    ...motherboardFacts,
    ...netaggregateFacts,
    ...coolerFacts,
    ...ssdFacts,
    ...ramFacts,
    ...hddFacts
  );

  // Loop through all the facts in computerFacts, and set a unique artikelnummer for each item
  computerFacts.flat().forEach((item, index = 1000) => {
    let id = index + 1;
    item.artikelnummer = id;
  });

  // Write the computerFacts array to a JSON file called "data.json"

  // fs.writeFile("data.json", JSON.stringify(computerFacts), (err) => {
  //   if (err) throw err;
  //   console.log("success");
  // });
};

// Call the main function
main();

// Set up a GET route for the root URL ("/"), which sends the computerFacts array as a response to the client
app.get("/", (req, res) => {
  res.send(computerFacts);
});
