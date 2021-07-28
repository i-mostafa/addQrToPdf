const fs = require("fs");
const { PDFDocument } = require("pdf-lib");
const QRCode = require("qrcode");
const TinyURL = require("tinyurl");
const download = require("download-pdf");
const util = require("util");
const downloadPRomise = util.promisify(download);
const xlsx = require("node-xlsx");

const run = async () => {
  const urls = [];
  const directory = "files/";
  const pathToImage = "imgs/";
  const options = {
    directory: "files/",
    filename: "pdf.pdf",
  };
  const workSheetsFromFile = xlsx.parse(`xlsx/urls.xlsx`);
  workSheetsFromFile[0].data.forEach((data) => urls.push(data[0]));
  await Promise.all(
    urls.map(async (url, i) => {
      const pdfName = `pdf-${i}.pdf`;
      const imgName = `img-${i}.png`;
      const outPath = `output/pdf-${i}.pdf`;
      await downloadPRomise(url, {
        directory,
        filename: pdfName,
      });
      const shortUrl = await TinyURL.shorten(url);
      await QRCode.toFile(pathToImage + imgName, shortUrl);
      const pdfDoc = await PDFDocument.load(
        fs.readFileSync(directory + pdfName)
      );
      const img = await pdfDoc.embedPng(fs.readFileSync(pathToImage + imgName));
      const imagePage = pdfDoc.getPage(0);

      imagePage.drawImage(img, {
        x: 20,
        y: imagePage.getHeight() - 120,
        width: 100, //imagePage.getWidth(),
        height: 100, //imagePage.getHeight(),
      });

      const pdfBytes = await pdfDoc.save();

      fs.writeFileSync(outPath, pdfBytes);
    })
  );
};

run().catch(console.error);
