import puppeteer from "puppeteer";
import { cloneDeep } from "lodash";
import {
  appendReport,
  isCleaningTime,
  formatHour,
  formatMinutes,
  formatSeconds,
  formatAmPm,
  sleep,
  appendLog,
  clean,
  goToSite,
  generateBrowser,
} from "./scriptUtils";
import { WAIT_TIME_IN_MINUTES } from "../../shared/sharedUtils";

export interface TestingOptions {
  iteration: number;
  dummyStories: Story[][];
}

export interface Story {
  headline: string | null;
  kicker: string | null;
}

export const generateDefaultStories = (
  defaultValue: string | null
): Story[] => {
  return [...Array(5)].map(() => {
    return {
      headline: defaultValue,
      kicker: defaultValue,
    };
  });
};

if (process.env.NODE_ENV !== "test") {
  const prevStories = generateDefaultStories("");
  const currStories = generateDefaultStories(null);
  const hasCleaned = false;
  loop({ prevStories, currStories, hasCleaned });
}

async function loop({
  prevStories,
  currStories,
  hasCleaned,
}: {
  prevStories: Story[];
  currStories: Story[];
  hasCleaned: boolean;
}) {
  const now = new Date();
  const browser = await generateBrowser();
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(2 * 60 * 1000);
  await goToSite(page);

  let checkingPrefix = "CHECKING";
  if (isCleaningTime()) {
    checkingPrefix = "MAINTENANCE WINDOW";
  }
  const checkingMessage = `${checkingPrefix}: ${formatHour(
    now
  )}:${formatMinutes(now)}:${formatSeconds(now)} ${formatAmPm(now)}`;
  console.log(checkingMessage);
  await appendLog(checkingMessage.concat("\n\n"));

  const {
    prevStories: nextPrevStories,
    currStories: nextCurrStories,
    hasCleaned: nextHasCleaned,
  } = await check({
    page,
    prevStories,
    currStories,
    hasCleaned,
  });
  await browser.close();

  const waitingMinutes =
    process.env.NODE_ENV === "dev" ? 0.1 : WAIT_TIME_IN_MINUTES;
  const waitingMessage = `WAITING ${waitingMinutes} MINUTES...`;
  console.log(waitingMessage);
  await appendLog(waitingMessage.concat("\n"));

  await sleep(waitingMinutes * 60 * 1000);
  loop({
    prevStories: nextPrevStories,
    currStories: nextCurrStories,
    hasCleaned: nextHasCleaned,
  });
}

// pass the stories as args to make testing easier
export default async function check({
  page,
  testingOptions,
  prevStories,
  currStories,
  hasCleaned,
}: {
  page: puppeteer.Page;
  testingOptions?: TestingOptions;
  prevStories: Story[];
  currStories: Story[];
  hasCleaned: boolean;
}) {
  // allows us to mutate where convenient in the function without affecting outer scopes
  prevStories = cloneDeep(prevStories);
  currStories = cloneDeep(currStories);

  if (isCleaningTime() && !hasCleaned) {
    await clean();
    hasCleaned = true;
    return { currStories, prevStories, hasCleaned };
  } else if (isCleaningTime()) {
    return { currStories, prevStories, hasCleaned };
  } else {
    hasCleaned = false;
  }

  let hasChanged = false;
  for (let i = 0; i < 5; i++) {
    const isLastIteration = i === 4;
    let currHeadline: string;
    let currKicker: string;

    if (process.env.NODE_ENV === "test" && testingOptions) {
      const { iteration, dummyStories } = testingOptions;
      currStories[i].headline = dummyStories[iteration][i].headline;
      currStories[i].kicker = dummyStories[iteration][i].kicker;
    } else {
      try {
        const headlineSelector = `.main-content .story-${i + 1} .title`;
        const headlineElement = await page.waitForSelector(headlineSelector);
        currHeadline = await page.evaluate((node: any) => {
          return node.innerText;
        }, headlineElement);
      } catch (error) {
        currHeadline = "";
      }
      currHeadline = currHeadline.replace(/:(?! )/g, ": ");

      try {
        const kickerSelector = `.main-content .story-${i + 1} .kicker-text`;
        const kickerElement = await page.waitForSelector(kickerSelector);
        currKicker = await page.evaluate((node: any) => {
          return node.innerText;
        }, kickerElement);
      } catch (error) {
        currKicker = "";
      }

      currStories[i].headline = currHeadline;
      currStories[i].kicker = currKicker;
    }

    if (
      prevStories[i].headline !== currStories[i].headline ||
      prevStories[i].kicker !== currStories[i].kicker
    ) {
      hasChanged = true;
    }

    if (isLastIteration && hasChanged) {
      const now = new Date();
      await appendReport({
        stories: currStories,
        date: now,
      });
    }
  }

  prevStories = [...currStories];
  currStories = generateDefaultStories(null);

  if (testingOptions) {
    testingOptions.iteration++;
  }

  return { currStories, prevStories, hasCleaned };
}
