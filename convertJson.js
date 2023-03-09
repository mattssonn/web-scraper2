let csvjson = require("csvjson");
let fs = require("fs");

fs.readFile("./data.json", "utf-8", (err, fileContent) => {
  if (err) {
    console.log(err);
    throw new Error(err);
  }

  const csvData = csvjson.toCSV(fileContent, {
    headers: "key",
  });

  fs.writeFile("./csvData.csv", csvData, (err) => {
    if (err) {
      console.log(err);
      throw new Error(err);
    }
    console.log("Converted successfully");
  });
});
