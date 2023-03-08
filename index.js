const puppeteer = require("puppeteer");
const PORT = 8000;
const express = require("express");
const cors = require("cors");
const app = express();

const dotenv = require("dotenv");

app.use(cors({ origin: "*" }));
app.listen(PORT, () => console.log(`server running on PORT ${PORT}`));

dotenv.config();

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

const gpuUrl = process.env.GPU_URL;
const cpuUrl = process.env.CPU_URL;
const chassiUrl = process.env.CHASSI_URL;
const motherboardUrl = process.env.MOTHERBOARD_URL;
const ssdUrl = process.env.SSD_URL;
const netaggregateUrl = process.env.NETAGGREGATE_URL;
const ramUrl = process.env.RAM_URL;
const coolerUrl = process.env.COOLER_URL;
const hddUrl = process.env.HDD_URL;

const inetSelector = ".l1qhmxkx";

const getWebData = async (url, selector) => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(url);

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

  const data = await page.evaluate((selector) => {
    const convertPrice = (price) => {
      const cleanedPrice = price.replace(/[^\d.,]+/g, "");
      return parseFloat(cleanedPrice.replace(",", "."));
    };

    const rows = Array.from(document.querySelectorAll(selector));
    const formattedData = rows.map((row) => ({
      title: row.querySelector("a").getAttribute("aria-label"),
      price: convertPrice(row.querySelector(".bp5wbcj").innerText),
      imgSrc: row.querySelector("img").getAttribute("src"),
    }));

    return formattedData;
  }, selector);

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
    ...netaggregateFacts,
    ...coolerFacts,
    ...ssdFacts,
    ...ramFacts,
    ...motherboardFacts,
    ...hddFacts
  );
};

main();

app.get("/", (req, res) => {
  res.send(computerFacts);
});

app.get("/gpu", (req, res) => {
  res.send(gpuFacts);
});

app.get("/cpu", (req, res) => {
  res.send(cpuFacts);
});

app.get("/chassi", (req, res) => {
  res.send(chassiFacts);
});

app.get("/motherboards", (req, res) => {
  res.send(motherboardFacts);
});
