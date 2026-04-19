const fs = require("fs");
const pdf = require("pdf-parse/lib/pdf-parse.js");

const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);

    const data = await pdf(dataBuffer);

    const cleanText = data.text
  .replace(/\r\n/g, "\n")
  .replace(/\n{2,}/g, "\n")
  .replace(/[^\x20-\x7E\n]/g, "") 
  .trim();
    fs.unlinkSync(filePath);
    return cleanText;

  } catch (error) {
    console.error("PDF Extraction Error:", error.message);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    throw error; // 👈 show real error
  }
};

module.exports = extractTextFromPDF;