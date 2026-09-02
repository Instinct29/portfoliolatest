/**
 * Capture 16:9 homepage screenshots for portfolio project thumbnails.
 * Run: node scripts/capture-project-shots.mjs
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const projectDir = path.join(process.cwd(), "public", "projects");
const orgDir = path.join(process.cwd(), "public", "images", "orgs");

/** name -> URL. atomix uses HashTrust (internal product). */
const targets = [
  { name: "hashtrust", url: "https://hashtrust.in" },
  { name: "atomix", url: "https://hashtrust.in" },
  { name: "fetch-ai", url: "https://fetch.ai" },
  { name: "asi-create", url: "https://asicreate.io/" },
  { name: "property-finder", url: "https://www.propertyfinder.ae/" },
  { name: "imavatar", url: "https://imavatar.com/" },
  { name: "claymango", url: "https://claymango.com" },
  { name: "claymango-platform", url: "https://claymango.com" },
];

fs.mkdirSync(projectDir, { recursive: true });
fs.mkdirSync(orgDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

for (const { name, url } of targets) {
  try {
    console.log(`Capturing ${name} from ${url}`);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.waitForTimeout(3000);
    const projectPath = path.join(projectDir, `${name}.webp`);
    await page.screenshot({ path: projectPath, type: "webp", quality: 88 });
    const orgNames = new Set([
      "hashtrust",
      "fetch-ai",
      "asi-create",
      "property-finder",
      "imavatar",
      "claymango",
    ]);
    if (orgNames.has(name)) {
      const orgPath = path.join(orgDir, `${name}.webp`);
      fs.copyFileSync(projectPath, orgPath);
    }
    console.log(`  saved ${projectPath}`);
  } catch (e) {
    console.error(`  FAIL ${name}:`, e.message);
  }
}

await browser.close();
console.log("Done.");
