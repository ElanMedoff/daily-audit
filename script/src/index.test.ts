import check, { generateDefaultStories, Story } from "./index";
import { logPath, reportPath } from "./scriptUtils";
import puppeteer from "puppeteer";
import { writeFile, readFile } from "fs/promises";

export const basicRead = async (path: string) => {
  return (await readFile(path)).toString();
};

export const mutateDate = ({
  date,
  hours,
  minutes,
  month,
  day,
}: {
  date: Date;
  hours: number;
  minutes: number;
  month: number;
  day: number;
}) => {
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setMonth(month);
  date.setDate(day);
  date.setFullYear(2022);
  return date;
};

describe("check", () => {
  let dummyStories: Story[][];

  const page = {
    setDefaultNavigationTimeout: jest.fn(),
    goTo: jest.fn().mockResolvedValue({}),
    waitForSelector: jest.fn().mockResolvedValue({}),
    evaluate: jest.fn().mockResolvedValue({}),
  } as any as puppeteer.Page;

  beforeEach(async () => {
    await writeFile(reportPath, "");
    await writeFile(logPath, "");

    jest.useFakeTimers().setSystemTime(
      mutateDate({
        date: new Date(),
        hours: 8,
        minutes: 0,
        month: 5,
        day: 13,
      })
    );
  });

  afterEach(async () => {
    await writeFile(reportPath, "");
    await writeFile(logPath, "");
  });

  describe("report", () => {
    describe("first iteration", () => {
      beforeEach(() => {
        dummyStories = [
          [
            { headline: "headline1", kicker: "kicker1" },
            { headline: "headline2", kicker: "kicker2" },
            { headline: "headline3", kicker: "kicker3" },
            { headline: "headline4", kicker: "kicker4" },
            { headline: "headline5", kicker: "kicker5" },
          ],
        ];
      });

      it("should print the stories and write the date", async () => {
        const prevStories = generateDefaultStories("");
        const currStories = generateDefaultStories(null);
        const hasCleaned = false;
        const testingOptions = { iteration: 0, dummyStories };
        let ret = {
          prevStories,
          currStories,
          hasCleaned,
        };

        for (let i = 0; i < dummyStories.length; i++) {
          ret = await check({
            page,
            prevStories: ret.prevStories,
            currStories: ret.currStories,
            hasCleaned: ret.hasCleaned,
            testingOptions,
          });
        }

        const report = JSON.parse(await basicRead(reportPath));
        expect(report[0].date).toMatch(/2022-06-13(.*)/);
        expect(report[0].stories).toStrictEqual([
          { headline: "headline1", kicker: "kicker1" },
          { headline: "headline2", kicker: "kicker2" },
          { headline: "headline3", kicker: "kicker3" },
          { headline: "headline4", kicker: "kicker4" },
          { headline: "headline5", kicker: "kicker5" },
        ]);
      });
    });

    describe("when no story changes", () => {
      beforeEach(() => {
        dummyStories = [
          [
            { headline: "headline1", kicker: "kicker1" },
            { headline: "headline2", kicker: "kicker2" },
            { headline: "headline3", kicker: "kicker3" },
            { headline: "headline4", kicker: "kicker4" },
            { headline: "headline5", kicker: "kicker5" },
          ],
          [
            { headline: "headline1", kicker: "kicker1" },
            { headline: "headline2", kicker: "kicker2" },
            { headline: "headline3", kicker: "kicker3" },
            { headline: "headline4", kicker: "kicker4" },
            { headline: "headline5", kicker: "kicker5" },
          ],
          [
            { headline: "headline1", kicker: "kicker1" },
            { headline: "headline2", kicker: "kicker2" },
            { headline: "headline3", kicker: "kicker3" },
            { headline: "headline4", kicker: "kicker4" },
            { headline: "headline5", kicker: "kicker5" },
          ],
        ];
      });

      it("should only print once", async () => {
        const prevStories = generateDefaultStories("");
        const currStories = generateDefaultStories(null);
        const hasCleaned = false;
        const testingOptions = { iteration: 0, dummyStories };
        let ret = {
          prevStories,
          currStories,
          hasCleaned,
        };

        for (let i = 0; i < dummyStories.length; i++) {
          ret = await check({
            page,
            prevStories: ret.prevStories,
            currStories: ret.currStories,
            hasCleaned: ret.hasCleaned,
            testingOptions,
          });
        }

        const report = JSON.parse(await basicRead(reportPath));
        expect(report[0].date).toMatch(/2022-06-13(.*)/);
        expect(report[0].stories).toStrictEqual([
          { headline: "headline1", kicker: "kicker1" },
          { headline: "headline2", kicker: "kicker2" },
          { headline: "headline3", kicker: "kicker3" },
          { headline: "headline4", kicker: "kicker4" },
          { headline: "headline5", kicker: "kicker5" },
        ]);
      });
    });

    describe("when one story changes", () => {
      beforeEach(() => {
        dummyStories = [
          [
            { headline: "headline1", kicker: "kicker1" },
            { headline: "headline2", kicker: "kicker2" },
            { headline: "headline3", kicker: "kicker3" },
            { headline: "headline4", kicker: "kicker4" },
            { headline: "headline5", kicker: "kicker5" },
          ],
          [
            { headline: "headline1", kicker: "kicker1" },
            { headline: "headline2", kicker: "kicker2" },
            { headline: "headline3", kicker: "kicker3" },
            { headline: "headline4", kicker: "kicker4" },
            { headline: "NEW", kicker: "kicker5" },
          ],
        ];
      });

      it("should print twice", async () => {
        const prevStories = generateDefaultStories("");
        const currStories = generateDefaultStories(null);
        const hasCleaned = false;
        const testingOptions = { iteration: 0, dummyStories };
        let ret = {
          prevStories,
          currStories,
          hasCleaned,
        };

        for (let i = 0; i < dummyStories.length; i++) {
          ret = await check({
            page,
            prevStories: ret.prevStories,
            currStories: ret.currStories,
            hasCleaned: ret.hasCleaned,
            testingOptions,
          });
        }

        const report = JSON.parse(await basicRead(reportPath));
        expect(report[0].date).toMatch(/2022-06-13(.*)/);
        expect(report[1].date).toMatch(/2022-06-13(.*)/);
        expect(report[0].stories).toStrictEqual([
          { headline: "headline1", kicker: "kicker1" },
          { headline: "headline2", kicker: "kicker2" },
          { headline: "headline3", kicker: "kicker3" },
          { headline: "headline4", kicker: "kicker4" },
          { headline: "NEW", kicker: "kicker5" },
        ]);
        expect(report[1].stories).toStrictEqual([
          { headline: "headline1", kicker: "kicker1" },
          { headline: "headline2", kicker: "kicker2" },
          { headline: "headline3", kicker: "kicker3" },
          { headline: "headline4", kicker: "kicker4" },
          { headline: "headline5", kicker: "kicker5" },
        ]);
      });
    });

    describe("when one kicker changes", () => {
      beforeEach(() => {
        dummyStories = [
          [
            { headline: "headline1", kicker: "kicker1" },
            { headline: "headline2", kicker: "kicker2" },
            { headline: "headline3", kicker: "kicker3" },
            { headline: "headline4", kicker: "kicker4" },
            { headline: "headline5", kicker: "kicker5" },
          ],
          [
            { headline: "headline1", kicker: "kicker1" },
            { headline: "headline2", kicker: "kicker2" },
            { headline: "headline3", kicker: "kicker3" },
            { headline: "headline4", kicker: "kicker4" },
            { headline: "headline5", kicker: "NEW" },
          ],
        ];
      });

      it("should print twice", async () => {
        const prevStories = generateDefaultStories("");
        const currStories = generateDefaultStories(null);
        const hasCleaned = false;
        const testingOptions = { iteration: 0, dummyStories };
        let ret = {
          prevStories,
          currStories,
          hasCleaned,
        };

        for (let i = 0; i < dummyStories.length; i++) {
          ret = await check({
            page,
            prevStories: ret.prevStories,
            currStories: ret.currStories,
            hasCleaned: ret.hasCleaned,
            testingOptions,
          });
        }

        const report = JSON.parse(await basicRead(reportPath));
        expect(report[0].date).toMatch(/2022-06-13(.*)/);
        expect(report[1].date).toMatch(/2022-06-13(.*)/);
        expect(report[0].stories).toStrictEqual([
          { headline: "headline1", kicker: "kicker1" },
          { headline: "headline2", kicker: "kicker2" },
          { headline: "headline3", kicker: "kicker3" },
          { headline: "headline4", kicker: "kicker4" },
          { headline: "headline5", kicker: "NEW" },
        ]);
        expect(report[1].stories).toStrictEqual([
          { headline: "headline1", kicker: "kicker1" },
          { headline: "headline2", kicker: "kicker2" },
          { headline: "headline3", kicker: "kicker3" },
          { headline: "headline4", kicker: "kicker4" },
          { headline: "headline5", kicker: "kicker5" },
        ]);
      });
    });
  });

  describe("cleaning", () => {
    describe("one days worth of report", () => {
      beforeEach(() => {
        dummyStories = [
          [
            { headline: "headline1", kicker: "kicker1" },
            { headline: "headline2", kicker: "kicker2" },
            { headline: "headline3", kicker: "kicker3" },
            { headline: "headline4", kicker: "kicker4" },
            { headline: "headline5", kicker: "kicker5" },
          ],
          [
            { headline: "headline1", kicker: "kicker1" },
            { headline: "headline2", kicker: "kicker2" },
            { headline: "headline3", kicker: "kicker3" },
            { headline: "headline4", kicker: "kicker4" },
            { headline: "headline5", kicker: "NEW" },
          ],
        ];
      });

      it("should keep the previous day", async () => {
        const prevStories = generateDefaultStories("");
        const currStories = generateDefaultStories(null);
        const hasCleaned = false;
        const testingOptions = { iteration: 0, dummyStories };

        let ret = {
          prevStories,
          currStories,
          hasCleaned,
        };

        ret = await check({
          page,
          prevStories: ret.prevStories,
          currStories: ret.currStories,
          hasCleaned: ret.hasCleaned,
          testingOptions,
        });

        jest.useFakeTimers().setSystemTime(
          mutateDate({
            date: new Date(),
            hours: 3,
            minutes: 35,
            month: 5,
            day: 14,
          })
        );

        ret = await check({
          page,
          prevStories: ret.prevStories,
          currStories: ret.currStories,
          hasCleaned: ret.hasCleaned,
          testingOptions,
        });

        jest.useFakeTimers().setSystemTime(
          mutateDate({
            date: new Date(),
            hours: 0,
            minutes: 50,
            month: 5,
            day: 14,
          })
        );

        ret = await check({
          page,
          prevStories: ret.prevStories,
          currStories: ret.currStories,
          hasCleaned: ret.hasCleaned,
          testingOptions,
        });

        const report = JSON.parse(await basicRead(reportPath));
        expect(report[0].date).toMatch(/2022-06-14(.*)/);
        expect(report[1].date).toMatch(/2022-06-13(.*)/);
        expect(report[0].stories).toStrictEqual([
          { headline: "headline1", kicker: "kicker1" },
          { headline: "headline2", kicker: "kicker2" },
          { headline: "headline3", kicker: "kicker3" },
          { headline: "headline4", kicker: "kicker4" },
          { headline: "headline5", kicker: "NEW" },
        ]);
        expect(report[1].stories).toStrictEqual([
          { headline: "headline1", kicker: "kicker1" },
          { headline: "headline2", kicker: "kicker2" },
          { headline: "headline3", kicker: "kicker3" },
          { headline: "headline4", kicker: "kicker4" },
          { headline: "headline5", kicker: "kicker5" },
        ]);
      });
    });
  });
});
