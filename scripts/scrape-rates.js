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

    // Debug: rate před kliknutím (ukazuje výchozí stav kalkulačky)
    const defaultRate = await page.evaluate(() => {
      const m = document.body.innerText.match(/(\d+[,.]\d{2})\s*%\s*p\.a/i);
      return m ? m[0] : null;
    });
    log(`  UniCredit default (bez kliknutí): ${defaultRate}`);

    // UC nabízí pouze 2/3/5 let — žádné 7/10
    const fixations = [
      { key: "fix_3", label: "3 roky" },
      { key: "fix_5", label: "5 let" },
    ];

    const rates = {};
    for (const { key, label } of fixations) {
      const clicked = await page.evaluate((target) => {
        const lo = target.toLowerCase();
        const walk = (el) => {
          const own = Array.from(el.childNodes)
            .filter((n) => n.nodeType === 3)
            .map((n) => n.textContent.trim())
            .filter((t) => t.length > 0)
            .join(" ");
          if (own.toLowerCase() === lo) {
            if (el.tagName === "OPTION" && el.parentElement) {
              // select + dispatch change tak aby se kalkulačka překreslila
              el.parentElement.value = el.value || el.textContent.trim();
              el.parentElement.dispatchEvent(new Event("change", { bubbles: true }));
              return { tag: "OPTION", val: el.value };
            }
            el.click();
            return { tag: el.tagName, cls: (el.className || "").toString().slice(0, 60) };
          }
          for (const child of el.children) {
            const r = walk(child);
            if (r) return r;
          }
          return null;
        };
        return walk(document.body);
      }, label);

      if (!clicked) {
        log(`  UniCredit: element pro "${label}" nenalezen`);
        continue;
      }
      log(`  UniCredit: kliknuto "${label}" (${clicked.tag} .${clicked.cls})`);
      await new Promise((r) => setTimeout(r, 1200));

      // Sazba se zobrazí jako X,XX % — hledat vše od 3% do 9% (hypotéky)
      const rateText = await page.evaluate(() => {
        const text = document.body.innerText;
        // Prefer "p.a." context, fallback to first matching XX,XX %
        const pa = text.match(/(\d+[,.]\d{2})\s*%\s*p\.a/i);
        if (pa) return pa[0];
        const generic = text.match(/[3-9][,.]\d{2}\s*%/);
        return generic ? generic[0] : null;
      });

      rates[key] = parseRate(rateText);
      log(`  UniCredit ${label}: ${rateText} → ${rates[key]}`);
    }

    if (!rates.fix_5) {
      const txt = await page.evaluate(() => document.body.innerText.slice(0, 1400));
      log(`  UniCredit fix_5 chybí. Text stránky:\n${txt}`);
      return null;
    }

    return {
      bank: "UniCredit Bank",
      fix_3: rates.fix_3 ?? rates.fix_5,
      fix_5: rates.fix_5,
      fix_7: rates.fix_5, // UC nemá 7/10 let fixaci
      fix_10: rates.fix_5,
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
