const puppeteer = require("puppeteer");
const PORT = 8000;
const express = require("express");
const cors = require("cors");
const app = express();
const fs = require("fs");

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
      titel: row.querySelector("a").getAttribute("aria-label"),
      price:
        Math.round(
          (convertPrice(row.querySelector(".bp5wbcj").innerText) * 1.05) / 10
        ) * 10,
      imgSrc: row.querySelector("img").getAttribute("src"),
      category: document.querySelector(".hx450ow").innerText,
    }));

    return formattedData;
  }, selector);

  await browser.close();
  return data;
};

const main = async () => {
  // const gpuData = await getWebData(gpuUrl, inetSelector);
  // gpuFacts.push(gpuData);

  // const cpuData = await getWebData(cpuUrl, inetSelector);
  // cpuFacts.push(cpuData);

  const chassiData = await getWebData(chassiUrl, inetSelector);
  chassiFacts.push(chassiData);

  const motherboardData = await getWebData(motherboardUrl, inetSelector);
  motherboardFacts.push(motherboardData);

  // const ssdData = await getWebData(ssdUrl, inetSelector);
  // ssdFacts.push(ssdData);

  // const coolerData = await getWebData(coolerUrl, inetSelector);
  // coolerFacts.push(coolerData);

  // const ramData = await getWebData(ramUrl, inetSelector);
  // ramFacts.push(ramData);

  // const netaggregateData = await getWebData(netaggregateUrl, inetSelector);
  // netaggregateFacts.push(netaggregateData);

  // const hddData = await getWebData(hddUrl, inetSelector);
  // hddFacts.push(hddData);

  computerFacts.push(
    // ...gpuFacts
    // ...cpuFacts
    ...chassiFacts,
    ...motherboardFacts
    // ...netaggregateFacts
    // ...coolerFacts,
    // ...ssdFacts,
    // ...ramFacts,
    // ...hddFacts
  );

  // fs.writeFile("data.json", JSON.stringify(computerFacts), (err) => {
  //   if (err) throw err;
  //   console.log("success");
  // });
};

main();

app.get("/", (req, res) => {
  res.send(computerFacts);
});
