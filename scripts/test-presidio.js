const axios = require("axios");
const client = axios.create({ timeout: 15000 });

async function anonymize(text) {
  const analysis = await client.post("http://localhost:3000/analyze", {
    text,
    language: "en",
  });

  const anonymized = await client.post("http://localhost:3001/anonymize", {
    text,
    analyzer_results: analysis.data,
  });

  return anonymized.data.text;
}

(async () => {
  try {
    const input = "My name is John Doe and my phone is 999-9999";
    const result = await anonymize(input);

    console.log("Original:", input);
    console.log("Anonymized:", result);
  } catch (error) {
    const details = error.response?.data || error.message;
    console.error("Presidio test failed:", details);
    process.exitCode = 1;
  }
})();
