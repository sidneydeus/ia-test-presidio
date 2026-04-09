const http = require("http");
const axios = require("axios");
const { URL } = require("url");

const port = process.env.PORT || 8080;
const client = axios.create({ timeout: 15000 });

async function anonymize(text) {
  const analysis = await client.post("http://presidio-analyzer:3000/analyze", {
    text,
    language: "en"
  });

  const anonymized = await client.post(
    "http://presidio-anonymizer:3000/anonymize",
    {
      text,
      analyzer_results: analysis.data
    }
  );

  return {
    original: text,
    analyzerResults: analysis.data,
    anonymized: anonymized.data.text
  };
}

function renderHomePage(defaultText) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Presidio Browser Test</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f4efe6;
        --panel: #fffaf2;
        --ink: #1f2937;
        --muted: #6b7280;
        --accent: #c2410c;
        --accent-strong: #9a3412;
        --border: #e7d8c7;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        font-family: Georgia, "Times New Roman", serif;
        color: var(--ink);
        background:
          radial-gradient(circle at top left, rgba(194, 65, 12, 0.14), transparent 30%),
          linear-gradient(135deg, #f8f1e7, var(--bg));
        display: grid;
        place-items: center;
        padding: 24px;
      }

      main {
        width: min(760px, 100%);
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 20px;
        padding: 32px;
        box-shadow: 0 20px 60px rgba(31, 41, 55, 0.08);
      }

      h1 {
        margin: 0 0 8px;
        font-size: clamp(2rem, 4vw, 3rem);
      }

      p {
        margin: 0 0 20px;
        color: var(--muted);
        line-height: 1.5;
      }

      form {
        display: grid;
        gap: 14px;
      }

      textarea {
        width: 100%;
        min-height: 150px;
        resize: vertical;
        padding: 16px;
        border-radius: 14px;
        border: 1px solid var(--border);
        font: inherit;
        font-size: 1rem;
        background: #fff;
      }

      button {
        width: fit-content;
        border: 0;
        border-radius: 999px;
        padding: 12px 20px;
        font: inherit;
        font-weight: 700;
        color: #fff7ed;
        background: linear-gradient(135deg, var(--accent), var(--accent-strong));
        cursor: pointer;
      }

      .hint {
        font-size: 0.95rem;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Presidio Test</h1>
      <p>Digite um texto com dados sensíveis e envie para analisar e anonimizar no navegador.</p>
      <form action="/test" method="get">
        <textarea name="text">${defaultText}</textarea>
        <button type="submit">Testar anonimização</button>
      </form>
      <p class="hint">Exemplo: My name is John Doe and my phone is 999-999</p>
    </main>
  </body>
</html>`;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  if (url.pathname === "/") {
    const sampleText = "My name is John Doe and my phone is 999-999";
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(renderHomePage(sampleText));
    return;
  }

  if (url.pathname === "/test") {
    const text = url.searchParams.get("text") || "";

    if (!text.trim()) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Provide a text query parameter." }));
      return;
    }

    try {
      const result = await anonymize(text);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result, null, 2));
    } catch (error) {
      const details = error.response?.data || error.message;
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify(
          {
            error: "Presidio request failed",
            details
          },
          null,
          2
        )
      );
    }

    return;
  }

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      message: "Node.js app running",
      analyzerUrl: "http://presidio-analyzer:3000",
      anonymizerUrl: "http://presidio-anonymizer:3000"
    })
  );
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
