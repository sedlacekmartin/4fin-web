/**
 * Mortgage rate scraper for 4fin-web
 * Scrapes each bank's mortgage page directly using regex on rendered text.
 *
 * Run: node scrape-rates.js
 * Env: SUPABASE_URL, SUPABASE_SERVICE_KEY, PUPPETEER_EXECUTABLE_PATH (optional)
 */

import puppeteer from "puppeteer";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

// Parse Czech "4,79 %" or "4.79%" → 4.79
function parseRate(str) {
  if (!str) return null;
  const m = str.replace(/\s/g, "").match(/(\d+)[,.](\d{2})/);
  if (!m) return null;
  return parseFloat(`${m[1]}.${m[2]}`);
}

// ---------------------------------------------------------------------------
// Bank configs — url + custom extractor or generic regex patterns
// ---------------------------------------------------------------------------

// Banks with working regex-based scrapers
const BANKS = [
  {
    bank: "Air Bank",
    url: "https://www.airbank.cz/hypoteka/",
    patterns: {
      fix_3: /3\s*rok[yu]?[\s\S]{0,80}?(\d+[,.]\d{2})\s*%/i,
      fix_5: /5\s*let[\s\S]{0,80}?(\d+[,.]\d{2})\s*%/i,
      fix_7: /7\s*let[\s\S]{0,80}?(\d+[,.]\d{2})\s*%/i,
      fix_10: /10\s*let[\s\S]{0,80}?(\d+[,.]\d{2})\s*%/i,
    },
  },
  {
    bank: "ČSOB / Hyp. banka",
    url: "https://www.csob.cz/lide/bydleni/hypoteka",
    wait: 5000, // kalkulačka se renderuje pomaleji
    patterns: {
      fix_3: /3\s*rok[yu]?[\s\S]{0,150}?(\d+[,.]\d{2})\s*%/i,
      fix_5: /5\s*let[\s\S]{0,150}?(\d+[,.]\d{2})\s*%/i,
      fix_7: /7\s*let[\s\S]{0,150}?(\d+[,.]\d{2})\s*%/i,
      fix_10: /10\s*let[\s\S]{0,150}?(\d+[,.]\d{2})\s*%/i,
    },
  },
  {
    // KB nabízí fixace 1-5 let; fix_7 a fix_10 se dosadí z fix_5
    bank: "Komerční banka",
    url: "https://www.kb.cz/cs/obcane/pujcky/hypoteky/hypoteka",
    patterns: {
      fix_3: /3\s*(?:rok[yu]?|let[a-z]*)[\s\S]{0,50}?(\d+[,.]\d{2})\s*%/i,
      fix_5: /5\s*let[\s\S]{0,50}?(\d+[,.]\d{2})\s*%/i,
      fix_7: null,
      fix_10: null,
    },
  },
];

// ---------------------------------------------------------------------------
// Generic bank scraper
// ---------------------------------------------------------------------------

async function scrapeBank(page, config) {
  log(`${config.bank} → ${config.url}`);
  try {
    await page.goto(config.url, { waitUntil: "networkidle2", timeout: 30_000 });
    await new Promise((r) => setTimeout(r, config.wait ?? 2000));

    const text = await page.evaluate(() => document.body.innerText);

    // Serialize patterns to strings for transfer into browser context
    const results = {};
    for (const [key, regex] of Object.entries(config.patterns)) {
      if (!regex) { results[key] = null; continue; }
      const m = text.match(regex);
      results[key] = m ? m[1] : null;
    }

    const fix_3 = parseRate(results.fix_3);
    const fix_5 = parseRate(results.fix_5);
    const fix_7 = parseRate(results.fix_7);
    const fix_10 = parseRate(results.fix_10);

    if (!fix_5) {
      // Debug: dump first 600 chars so we can tune the regex
      log(`  → no fix_5 found. Page snippet:\n${text.slice(0, 600)}`);
      return null;
    }

    const entry = {
      bank: config.bank,
      fix_3: fix_3 ?? fix_5,
      fix_5,
      fix_7: fix_7 ?? fix_5,
      fix_10: fix_10 ?? fix_5,
    };
    log(`  → ${JSON.stringify(entry)}`);
    return entry;
  } catch (err) {
    log(`  → error: ${err.message}`);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Save to Supabase — delete existing rows for these banks, then insert
// ---------------------------------------------------------------------------

async function saveRates(rates) {
  if (rates.length === 0) {
    log("Nothing to save.");
    return;
  }

  const rows = rates.map((r) => ({
    ...r,
    updated_at: new Date().toISOString(),
  }));

  log(`\nSaving ${rows.length} banks to Supabase...`);

  const banks = rows.map((r) => r.bank);
  const { error: delError } = await supabase.from("rates").delete().in("bank", banks);
  if (delError) {
    console.error("Supabase delete error:", delError.message);
    process.exit(1);
  }

  const { error: insError } = await supabase.from("rates").insert(rows);
  if (insError) {
    console.error("Supabase insert error:", insError.message);
    process.exit(1);
  }

  log("Saved OK:");
  for (const r of rows) {
    log(`  ${r.bank.padEnd(22)} fix3=${r.fix_3}  fix5=${r.fix_5}  fix7=${r.fix_7}  fix10=${r.fix_10}`);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  log("=== 4fin rate scraper starting ===");

  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
  );
  await page.setViewport({ width: 1440, height: 900 });

  const results = [];

  try {
    for (const config of BANKS) {
      const entry = await scrapeBank(page, config);
      if (entry) results.push(entry);
    }

    log(`\nScraped ${results.length}/${BANKS.length} banks successfully.`);
    await saveRates(results);
  } finally {
    await browser.close();
  }

  log("=== Done ===");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
