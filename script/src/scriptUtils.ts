import path from "path";
import { appendFile, writeFile, readFile, readdir, rm } from "fs/promises";
import { existsSync } from "fs";
import puppeteer from "puppeteer";
import { Story } from "./index";
import { OutEntry } from "../../shared/sharedUtils";

export interface InEntry {
  date: Date;
  stories: Story[];
}

export const reportPath = path.join(__dirname, "../../shared/report.json");
export const logPath = path.join(__dirname, "../../shared/log.txt");
export const devProfilesPath = path.join(__dirname, "../devProfiles");

async function maybeCreateFile(path: string) {
  if (!existsSync(path)) {
    await writeFile(path, "");
  }
}

export async function clean() {
  await maybeCreateFile(reportPath);
  await maybeCreateFile(logPath);

  try {
    await writeFile(logPath, "");
  } catch (error) {
    console.error({ error });
  }

  if (process.env.NODE_ENV === "prod") {
    let fileNames: string[] = [];
    try {
      fileNames = await readdir(devProfilesPath);
    } catch (error) {}

    for (let i = 0; i < fileNames.length; i++) {
      try {
        await rm(path.join(devProfilesPath, fileNames[i]), {
          recursive: true,
          force: true,
          maxRetries: 5,
        });
      } catch (error) {
        console.error({ error });
      }
    }
  }

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const allReport = await readReport();
  const filteredReport = allReport.filter((entry) => {
    return (
      new Date(entry.date).toDateString() === today.toDateString() ||
      new Date(entry.date).toDateString() === yesterday.toDateString()
    );
  });
  const hydratedReport = filteredReport.map((entry) => ({
    ...entry,
    date: new Date(entry.date),
  }));
  await writeReport(hydratedReport);
}

export async function appendLog(content: string) {
  await maybeCreateFile(logPath);

  let currentLog = "";
  try {
    currentLog = (await readFile(logPath)).toString();
  } catch (error) {}

  try {
    await writeFile(logPath, content);
    await appendFile(logPath, currentLog);
  } catch (error) {
    console.error({ error });
  }
}

export async function readReport() {
  let rawData = "";
  try {
    rawData = (await readFile(reportPath)).toString();
  } catch (err) {}

  let parsedData: OutEntry[] = [];
  if (rawData) {
    parsedData = JSON.parse(rawData);
  }

  return parsedData;
}

export async function writeReport(report: InEntry[]) {
  await maybeCreateFile(reportPath);

  try {
    await writeFile(reportPath, JSON.stringify(report));
  } catch (err) {
    console.error({ err });
  }
}

export async function appendReport(entry: InEntry) {
  await maybeCreateFile(reportPath);

  const parsedData = await readReport();
  const hydratedData: InEntry[] = parsedData.map((entry) => ({
    ...entry,
    date: new Date(entry.date),
  }));
  const newData = [entry].concat(hydratedData);
  try {
    await writeReport(newData);
  } catch (err) {
    console.error({ err });
  }
}

export function formatHour(date: Date) {
  if (date.getHours() === 0) return 12;
  return date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
}

export function formatMinutes(date: Date) {
  return date.getMinutes().toLocaleString("en-US", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
}

export function formatSeconds(date: Date) {
  return date.getSeconds().toLocaleString("en-US", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
}

export function formatAmPm(date: Date) {
  return date.getHours() >= 12 ? "PM" : "AM";
}

export async function sleep(timeInMs: number) {
  return new Promise((r) => setTimeout(r, timeInMs));
}

export async function generateBrowser() {
  return puppeteer.launch({
    userDataDir: devProfilesPath,
    headless: process.env.NODE_ENV === "prod",
    timeout: 2 * 60 * 1000,
  });
}

export async function goToSite(page: puppeteer.Page) {
  await page.goto("", {
    waitUntil: "domcontentloaded",
  });
}

export function isCleaningTime() {
  const now = new Date();
  return (
    now.getHours() === 3 && now.getMinutes() >= 30 && now.getMinutes() <= 45
  );
}
