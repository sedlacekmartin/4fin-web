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
    bank: "Česká spořitelna",
    url: "https://www.csas.cz/cs/osobni-finance/hypoteky/hypoteka",
    wait: 5000,
    patterns: {
      fix_3: /3\s*rok[yu]?[\s\S]{0,150}?(\d+[,.]\d{2})\s*%/i,
      fix_5: /5\s*let[\s\S]{0,150}?(\d+[,.]\d{2})\s*%/i,
      fix_7: /7\s*let[\s\S]{0,150}?(\d+[,.]\d{2})\s*%/i,
      fix_10: /10\s*let[\s\S]{0,150}?(\d+[,.]\d{2})\s*%/i,
    },
  },
  // Raiffeisenbank handled by scrapeRB() below
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

// ---------------------------------------------------------------------------
// Raiffeisenbank — klikni na každé tlačítko fixace, přečti sazbu
// ---------------------------------------------------------------------------

async function scrapeRB(page) {
  const url = "https://www.rb.cz/osobni/hypoteky/hypoteka-na-bydleni";
  log(`Raiffeisenbank → ${url}`);
  try {
    // Kalkulačka je v iframe — navigujeme přímo tam
    const calcUrl = "https://hypoteka.rb.cz/embedded-calc?busProdSubTp=RML_CLAS";
    log(`  → iframe kalkulačka: ${calcUrl}`);
    await page.goto(calcUrl, { waitUntil: "networkidle2", timeout: 30_000 });
    await acceptCookies(page);
    await new Promise((r) => setTimeout(r, 3000));

    // MUI Select pro fixaci — kliknout, vybrat option, přečíst sazbu
    const fixations = [
      { key: "fix_3", label: "3 roky" },
      { key: "fix_5", label: "5 let" },
      { key: "fix_7", label: "7 let" },
      { key: "fix_10", label: "10 let" },
    ];

    const rates = {};
    for (const { key, label } of fixations) {
      // Otevři MUI dropdown
      await page.click("div.MuiSelect-select");
      await new Promise((r) => setTimeout(r, 600));

      // Klikni na správnou option v dropdown listu
      const clicked = await page.evaluate((target) => {
        const opts = Array.from(document.querySelectorAll("li[role='option']"));
        const opt = opts.find((el) => el.textContent.trim() === target);
        if (opt) { opt.click(); return true; }
        // fallback: hledej v celém dokumentu
        const all = Array.from(document.querySelectorAll("li, [role='option']"));
        const found = all.find((el) => el.textContent.trim() === target);
        if (found) { found.click(); return true; }
        return false;
      }, label);

      if (!clicked) {
        log(`  RB: option "${label}" nenalezena`);
        continue;
      }

      await new Promise((r) => setTimeout(r, 700));

      // Přečti první SPAN s hodnotou (sazba, ne RPSN)
      const rateText = await page.evaluate(() => {
        const els = document.querySelectorAll("span.CalculatorResultSectionItemContainer-value");
        return els[0] ? els[0].textContent.trim() : null;
      });

      rates[key] = parseRate(rateText);
      log(`  RB ${label}: ${rateText} → ${rates[key]}`);
    }

    if (!rates.fix_5) {
      log("  RB: fix_5 se nepodařilo extrahovat");
      return null;
    }

    return {
      bank: "Raiffeisenbank",
      fix_3: rates.fix_3 ?? rates.fix_5,
      fix_5: rates.fix_5,
      fix_7: rates.fix_7 ?? rates.fix_5,
      fix_10: rates.fix_10 ?? rates.fix_5,
    };
  } catch (err) {
    log(`  → error: ${err.message}`);
    return null;
  }
}

async function acceptCookies(page) {
  try {
    const clicked = await page.evaluate(() => {
      const keywords = ["souhlasím a pokračovat", "přijmout vše", "accept all", "povolit vše", "souhlasím", "přijmout cookies"];
      const btns = Array.from(document.querySelectorAll("button, a[role='button']"));
      for (const btn of btns) {
        if (keywords.some((k) => btn.textContent.trim().toLowerCase().startsWith(k))) {
          btn.click();
          return btn.textContent.trim();
        }
      }
      return null;
    });
    if (clicked) {
      log(`  Cookie consent: kliknuto "${clicked}"`);
      await new Promise((r) => setTimeout(r, 1500));
    }
  } catch {}
}

async function scrapeBank(page, config) {
  log(`${config.bank} → ${config.url}`);
  try {
    await page.goto(config.url, { waitUntil: "networkidle2", timeout: 30_000 });
    await acceptCookies(page);
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
// UniCredit — klikni na každou fixaci, přečti sazbu
// ---------------------------------------------------------------------------

async function scrapeUniCredit(page) {
  const url =
    "https://www.unicreditbank.cz/cs/obcane/hypoteky/hypoteka-nove-penize.html";
  log(`UniCredit Bank → ${url}`);
  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30_000 });
    await acceptCookies(page);
    await new Promise((r) => setTimeout(r, 3000));

    // Debug: dump DOM info to find fixation buttons
    const domInfo = await page.evaluate(() => {
      const info = [];

      // Collect all buttons and links with "let"/"rok" in text
      const candidates = Array.from(
        document.querySelectorAll(
          "button, a, [role='tab'], [role='button'], li, label, input[type='radio']"
        )
      );
      for (const el of candidates) {
        const t = el.textContent.trim();
        if (/\d+\s*(let|rok[yu]?)/i.test(t) && t.length < 30) {
          info.push({
            tag: el.tagName,
            text: t,
            cls: el.className,
            role: el.getAttribute("role"),
            id: el.id,
          });
        }
      }

      // Also dump first 800 chars of innerText
      return {
        buttons: info.slice(0, 20),
        text: document.body.innerText.slice(0, 800),
      };
    });

    log(
      `  UniCredit DOM candidates:\n${JSON.stringify(domInfo.buttons, null, 2)}`
    );
    log(`  UniCredit text snippet:\n${domInfo.text}`);

    // Fixace: zkusíme kliknout na tlačítko/tab podle textu
    const fixations = [
      { key: "fix_3", labels: ["3 roky", "3 rok", "3 let"] },
      { key: "fix_5", labels: ["5 let"] },
      { key: "fix_7", labels: ["7 let"] },
      { key: "fix_10", labels: ["10 let"] },
    ];

    const rates = {};
    for (const { key, labels } of fixations) {
      const clicked = await page.evaluate((targetLabels) => {
        const els = Array.from(
          document.querySelectorAll(
            "button, a, [role='tab'], [role='button'], li, label"
          )
        );
        for (const label of targetLabels) {
          const el = els.find(
            (e) =>
              e.textContent.trim().toLowerCase() === label.toLowerCase() ||
              e.textContent.trim().toLowerCase().startsWith(label.toLowerCase())
          );
          if (el) {
            el.click();
            return el.textContent.trim();
          }
        }
        return null;
      }, labels);

      if (!clicked) {
        log(`  UniCredit: žádný element pro ${labels[0]} nenalezen`);
        continue;
      }

      log(`  UniCredit: kliknuto "${clicked}"`);
      await new Promise((r) => setTimeout(r, 1000));

      // Přečti sazbu — zkusit různé selektory
      const rateText = await page.evaluate(() => {
        // Hledáme číslo ve formátu X,XX % nebo X.XX %
        const selectors = [
          "[class*='rate']",
          "[class*='sazb']",
          "[class*='interest']",
          "[class*='urok']",
          "[class*='result']",
          "[class*='value']",
          "[class*='percent']",
        ];

        for (const sel of selectors) {
          const els = Array.from(document.querySelectorAll(sel));
          for (const el of els) {
            const t = el.textContent.trim();
            if (/^\d+[,.]\d{2}\s*%/.test(t)) return t;
          }
        }

        // Fallback: regex na celý text
        const m = document.body.innerText.match(/(\d+[,.]\d{2})\s*%\s*p\.a/i);
        return m ? m[0] : null;
      });

      rates[key] = parseRate(rateText);
      log(`  UniCredit ${labels[0]}: ${rateText} → ${rates[key]}`);
    }

    if (!rates.fix_5) {
      log("  UniCredit: fix_5 se nepodařilo extrahovat");
      return null;
    }

    return {
      bank: "UniCredit Bank",
      fix_3: rates.fix_3 ?? rates.fix_5,
      fix_5: rates.fix_5,
      fix_7: rates.fix_7 ?? rates.fix_5,
      fix_10: rates.fix_10 ?? rates.fix_5,
    };
  } catch (err) {
    log(`  UniCredit → error: ${err.message}`);
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

    const rb = await scrapeRB(page);
    if (rb) results.push(rb);

    const uc = await scrapeUniCredit(page);
    if (uc) results.push(uc);

    log(`\nScraped ${results.length}/${BANKS.length + 2} banks successfully.`);
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
