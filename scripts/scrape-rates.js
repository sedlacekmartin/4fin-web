/**
 * Mortgage rate scraper for 4fin-web
 *
 * Sources:
 *   1. hypoindex.cz  — primary, all banks in one table
 *   2. Air Bank      — direct, cross-check fix_5
 *
 * Run: node scrape-rates.js
 * Env: SUPABASE_URL, SUPABASE_SERVICE_KEY
 */

import puppeteer from "puppeteer";
import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Canonical bank names — map scraped strings (lowercase) to stored name
const BANK_MAP = {
  "air bank": "Air Bank",
  "airbank": "Air Bank",
  "česká spořitelna": "Česká spořitelna",
  "spořitelna": "Česká spořitelna",
  "raiffeisenbank": "Raiffeisenbank",
  "raiffeisen": "Raiffeisenbank",
  "čsob": "ČSOB / Hyp. banka",
  "csob": "ČSOB / Hyp. banka",
  "hypoteční banka": "ČSOB / Hyp. banka",
  "era": "ČSOB / Hyp. banka",
  "komerční banka": "Komerční banka",
  "kb": "Komerční banka",
  "moneta": "Moneta",
  "moneta money bank": "Moneta",
  "mbank": "mBank",
  "m bank": "mBank",
  "unicredit": "UniCredit Bank",
  "unicredit bank": "UniCredit Bank",
};

// Parse Czech "4,79 %" → 4.79
function parseRate(str) {
  if (!str) return null;
  const m = str.replace(/\s/g, "").match(/(\d+)[,.](\d{2})/);
  if (!m) return null;
  return parseFloat(`${m[1]}.${m[2]}`);
}

function normalizeBankName(raw) {
  const lower = raw.trim().toLowerCase();
  for (const [key, canonical] of Object.entries(BANK_MAP)) {
    if (lower.includes(key)) return canonical;
  }
  return null;
}

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

// ---------------------------------------------------------------------------
// Source 1: hypoindex.cz
// ---------------------------------------------------------------------------

async function scrapeHypoindex(page) {
  const URLS = [
    "https://www.hypoindex.cz/hypotecni-sazby/",
    "https://www.hypoindex.cz/srovnani-hypotecnich-bank/",
  ];

  for (const url of URLS) {
    log(`Hypoindex → ${url}`);
    try {
      await page.goto(url, { waitUntil: "networkidle2", timeout: 30_000 });
      // Give JS a bit more time to render tables
      await new Promise((r) => setTimeout(r, 2000));

      const result = await page.evaluate((bankMap) => {
        const rates = [];

        // Strategy A: find <table> with bank names + % values
        const tables = Array.from(document.querySelectorAll("table"));
        for (const table of tables) {
          const headers = Array.from(table.querySelectorAll("th")).map((th) =>
            th.textContent.trim().toLowerCase()
          );

          // Find column indices for fix periods
          const colFix3 = headers.findIndex((h) => h.includes("3"));
          const colFix5 = headers.findIndex((h) => h.includes("5"));
          const colFix7 = headers.findIndex((h) => h.includes("7"));
          const colFix10 = headers.findIndex(
            (h) => h.includes("10") || h.includes("10")
          );

          if (colFix5 < 0) continue; // not a rates table

          const rows = Array.from(table.querySelectorAll("tbody tr"));
          for (const row of rows) {
            const cells = Array.from(row.querySelectorAll("td")).map((td) =>
              td.textContent.trim()
            );
            if (cells.length < 2) continue;
            const bankName = cells[0];
            rates.push({
              bankRaw: bankName,
              fix_3: cells[colFix3] ?? null,
              fix_5: cells[colFix5] ?? null,
              fix_7: cells[colFix7] ?? null,
              fix_10: cells[colFix10] ?? null,
            });
          }
          if (rates.length > 0) return { rates, strategy: "table" };
        }

        // Strategy B: structured divs/list items with bank + rates
        const rateElements = Array.from(
          document.querySelectorAll(
            "[class*='rate'], [class*='bank'], [class*='sazb'], [data-bank]"
          )
        );
        const rowMap = {};
        for (const el of rateElements) {
          const text = el.textContent;
          // Look for bank name + adjacent percentages
          const pctMatches = [...text.matchAll(/(\d+[,.]\d{2})\s*%/g)];
          if (pctMatches.length >= 2) {
            // Likely a row with multiple rates
            for (const [key, canonical] of Object.entries(bankMap)) {
              if (text.toLowerCase().includes(key)) {
                if (!rowMap[canonical]) {
                  rowMap[canonical] = pctMatches.map((m) => m[0]);
                }
              }
            }
          }
        }
        const divRates = Object.entries(rowMap).map(([bank, vals]) => ({
          bankRaw: bank,
          fix_3: vals[0] ?? null,
          fix_5: vals[1] ?? null,
          fix_7: vals[2] ?? null,
          fix_10: vals[3] ?? null,
        }));
        if (divRates.length > 0) return { rates: divRates, strategy: "divs" };

        return { rates: [], strategy: "none" };
      }, BANK_MAP);

      log(`  → strategy: ${result.strategy}, rows: ${result.rates.length}`);

      const parsed = [];
      for (const row of result.rates) {
        const bank = normalizeBankName(row.bankRaw);
        if (!bank) continue;
        const fix_3 = parseRate(row.fix_3);
        const fix_5 = parseRate(row.fix_5);
        const fix_7 = parseRate(row.fix_7);
        const fix_10 = parseRate(row.fix_10);
        if (!fix_5) continue; // need at least fix_5
        parsed.push({ bank, fix_3: fix_3 ?? fix_5, fix_5, fix_7: fix_7 ?? fix_5, fix_10: fix_10 ?? fix_5 });
      }

      if (parsed.length >= 3) {
        log(`  → parsed ${parsed.length} banks`);
        return parsed;
      }
    } catch (err) {
      log(`  → error: ${err.message}`);
    }
  }

  log("Hypoindex → no usable data from any URL");
  return [];
}

// ---------------------------------------------------------------------------
// Source 2: Air Bank (direct, confirmed working)
// ---------------------------------------------------------------------------

async function scrapeAirBank(page) {
  log("Air Bank → https://www.airbank.cz/hypoteka/");
  try {
    await page.goto("https://www.airbank.cz/hypoteka/", {
      waitUntil: "networkidle2",
      timeout: 30_000,
    });
    await new Promise((r) => setTimeout(r, 1500));

    const result = await page.evaluate(() => {
      // Air Bank puts fixation options as buttons/tabs with rate values nearby
      const text = document.body.innerText;

      // Extract all "X let / X roky" + "X,XX %" pairs from the page
      const fixPatterns = [
        { label: "fix_3", regex: /3\s*rok[yu]?[\s\S]{0,60}?(\d+[,.]\d{2})\s*%/i },
        { label: "fix_5", regex: /5\s*let[\s\S]{0,60}?(\d+[,.]\d{2})\s*%/i },
        { label: "fix_7", regex: /7\s*let[\s\S]{0,60}?(\d+[,.]\d{2})\s*%/i },
        { label: "fix_10", regex: /10\s*let[\s\S]{0,60}?(\d+[,.]\d{2})\s*%/i },
      ];

      const rates = {};
      for (const { label, regex } of fixPatterns) {
        const m = text.match(regex);
        rates[label] = m ? m[1] : null;
      }
      return rates;
    });

    const fix_3 = parseRate(result.fix_3);
    const fix_5 = parseRate(result.fix_5);
    const fix_7 = parseRate(result.fix_7);
    const fix_10 = parseRate(result.fix_10);

    if (!fix_5) {
      log("Air Bank → could not extract fix_5, skipping");
      return null;
    }

    const entry = {
      bank: "Air Bank",
      fix_3: fix_3 ?? fix_5,
      fix_5,
      fix_7: fix_7 ?? fix_5,
      fix_10: fix_10 ?? fix_5,
    };
    log(`  → ${JSON.stringify(entry)}`);
    return entry;
  } catch (err) {
    log(`Air Bank → error: ${err.message}`);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Merge: if both sources have data for the same bank, average them
// ---------------------------------------------------------------------------

function mergeSources(primary, secondary) {
  const byBank = {};

  for (const r of primary) {
    byBank[r.bank] = { ...r, count: 1 };
  }

  for (const r of secondary) {
    if (!r) continue;
    if (byBank[r.bank]) {
      // Average
      const existing = byBank[r.bank];
      byBank[r.bank] = {
        bank: r.bank,
        fix_3: +((existing.fix_3 + r.fix_3) / 2).toFixed(2),
        fix_5: +((existing.fix_5 + r.fix_5) / 2).toFixed(2),
        fix_7: +((existing.fix_7 + r.fix_7) / 2).toFixed(2),
        fix_10: +((existing.fix_10 + r.fix_10) / 2).toFixed(2),
        count: existing.count + 1,
      };
      log(`  Averaged ${r.bank} from ${existing.count + 1} sources`);
    } else {
      byBank[r.bank] = { ...r, count: 1 };
    }
  }

  return Object.values(byBank).map(({ count: _c, ...rest }) => rest);
}

// ---------------------------------------------------------------------------
// Save to Supabase
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

  log(`Saving ${rows.length} banks to Supabase...`);
  const { error } = await supabase
    .from("rates")
    .upsert(rows, { onConflict: "bank" });

  if (error) {
    console.error("Supabase upsert error:", error.message);
    process.exit(1);
  }

  log("Saved OK");
  for (const r of rows) {
    log(`  ${r.bank}: ${r.fix_3} / ${r.fix_5} / ${r.fix_7} / ${r.fix_10}`);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  log("=== 4fin rate scraper starting ===");

  const browser = await puppeteer.launch({
    headless: "new",
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

  try {
    // Primary source
    const hypoindexRates = await scrapeHypoindex(page);

    // Secondary source (cross-check)
    const airBankRate = await scrapeAirBank(page);

    // If hypoindex returned Air Bank too, override with direct scrape (more accurate)
    const merged = mergeSources(hypoindexRates, [airBankRate]);

    log(`\nFinal dataset: ${merged.length} banks`);
    await saveRates(merged);
  } finally {
    await browser.close();
  }

  log("=== Done ===");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
