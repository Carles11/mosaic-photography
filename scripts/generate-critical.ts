import fs from "fs";
import path from "path";
import { spawn } from "child_process";
// @ts-expect-error - runtime dependency injected via devDependencies
import penthouse from "penthouse";
import puppeteer from "puppeteer";
import fetch, { Response } from "node-fetch";

// Minimal script to build the project, start a production server, fetch
// the homepage, and extract critical CSS using penthouse. Writes the
// compiled critical CSS to src/critical-above-the-fold.css

const OUT_FILE = path.resolve(process.cwd(), "src/critical-above-the-fold.css");
const BACKUP_FILE = path.resolve(
  process.cwd(),
  "src/critical-above-the-fold.css.bak",
);
const HOST = process.env.HOST || "http://localhost";
const PORT = process.env.PORT || "3000";
const URL = `${HOST}:${PORT}/`;

function runCommand(
  cmd: string,
  args: string[],
  opts: Record<string, unknown> = {},
) {
  return new Promise<void>((resolve, reject) => {
    const p = spawn(cmd, args, {
      stdio: "inherit",
      shell: true,
      ...opts,
    } as import("child_process").SpawnOptions);
    p.on("exit", (code: number | null) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(" ")} exited with ${code}`));
    });
  });
}

async function waitForServer(url: string, timeout = 20_000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res: Response = await fetch(url, { method: "GET" });
      if (
        res &&
        (res.status === 200 || res.status === 301 || res.status === 302)
      )
        return;
    } catch {
      // ignore and retry
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("Timed out waiting for server");
}

(async () => {
  try {
    console.log("Running next build...");
    await runCommand("npx", ["next", "build"]);

    console.log("Checking for existing server on", URL);
    let server: import("child_process").ChildProcess | null = null;
    let serverStarted = false;
    try {
      await waitForServer(URL, 3000);
      console.log("Found running server at", URL, "- reusing it");
    } catch (e) {
      console.log(
        "No running server found, starting production server (next start)...",
        e,
      );
      server = spawn("npx", ["next", "start", "-p", PORT], {
        shell: true,
        stdio: "inherit",
      });
      serverStarted = true;

      try {
        await waitForServer(URL);
      } catch (err) {
        if (server) server.kill();
        throw err;
      }
    }

    console.log("Launching headless browser to collect stylesheet URLs...");
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto(URL, { waitUntil: "networkidle2" });

    // Collect stylesheets that are part of the site
    const hrefs: string[] = await page.evaluate(() =>
      Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(
        (l) => (l as HTMLLinkElement).href,
      ),
    );

    // Filter _next/static/css files (compiled css)
    const cssFiles = hrefs.filter((h) => /_next\/static\/css\/.+\.css/.test(h));
    console.log("Found compiled CSS files:", cssFiles);

    if (cssFiles.length === 0) {
      console.warn(
        "No compiled CSS files found. Penthouse will run against the full page HTML.",
      );
    }

    // Get HTML for page as the 'content' for penthouse
    const content = await page.content();

    // Fetch compiled CSS files' contents and concatenate them so penthouse
    // receives raw CSS instead of a URL (avoids Windows path issues).
    let concatenatedCss = "";
    if (cssFiles.length > 0) {
      for (const cssHref of cssFiles) {
        try {
          const res = await fetch(cssHref);
          if (res.ok) {
            const text = await res.text();
            concatenatedCss += "\n/* " + cssHref + " */\n" + text;
          } else {
            console.warn("Failed to fetch", cssHref, res.status);
          }
        } catch (e) {
          console.warn("Error fetching", cssHref, e);
        }
      }
    }

    await browser.close();

    const penthouseOpts: Record<string, unknown> = {
      url: URL,
      width: 1300,
      height: 900,
      timeout: 30000,
    };

    if (concatenatedCss) {
      penthouseOpts.cssString = concatenatedCss;
    } else {
      penthouseOpts.html = content;
    }

    console.log("Running penthouse to extract critical CSS...");
    const criticalCss = await penthouse(penthouseOpts);

    // Backup existing file
    if (fs.existsSync(OUT_FILE)) {
      fs.copyFileSync(OUT_FILE, BACKUP_FILE);
      console.log("Backed up existing critical CSS to", BACKUP_FILE);
    }

    fs.writeFileSync(OUT_FILE, criticalCss, "utf8");
    console.log("Wrote critical CSS to", OUT_FILE);

    // Cleanup server if we started it
    if (serverStarted && server) {
      server.kill();
      console.log("Server stopped. Done.");
    } else {
      console.log("Left existing server running. Done.");
    }
  } catch (err) {
    console.error("Error during critical CSS generation:", err);
    process.exit(1);
  }
})();
