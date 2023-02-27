import { writeFile } from "fs/promises";
import {
  logPath,
  reportPath,
  appendLog,
  readReport,
  appendReport,
  InEntry,
  writeReport,
  clean,
} from "./scriptUtils";
import { basicRead, mutateDate } from "./index.test";

describe("scriptUtils", () => {
  beforeEach(async () => {
    await writeFile(reportPath, "");
    await writeFile(logPath, "");
  });

  afterEach(async () => {
    await writeFile(reportPath, "");
    await writeFile(logPath, "");
  });

  describe("appendLog", () => {
    it("on an empty log, it should write to it", async () => {
      await appendLog("0");
      expect(await basicRead(logPath)).toBe("0");
    });

    it("when the log is already populated, should prepend to it", async () => {
      await writeFile(logPath, "0");
      await appendLog("1");
      expect(await basicRead(logPath)).toBe("10");
    });
  });

  describe("readReport", () => {
    it("with an empty report, should return an empty array", async () => {
      expect(await readReport()).toStrictEqual([]);
    });

    it("when populated, should return the entries", async () => {
      const date = new Date();
      const entries: InEntry[] = [
        { date, stories: [] },
        { date, stories: [] },
        { date, stories: [] },
      ];
      const outEntries = entries.map((entry) => ({
        ...entry,
        date: date.toISOString(),
      }));
      await writeFile(reportPath, JSON.stringify(entries));

      expect(await readReport()).toStrictEqual(outEntries);
    });
  });

  describe("writeReport", () => {
    it("with an empty report, it should write to the report", async () => {
      const entries: InEntry[] = [
        {
          date: new Date(),
          stories: [],
        },
      ];
      await writeReport(entries);
      expect(await basicRead(reportPath)).toStrictEqual(
        JSON.stringify(entries)
      );
    });

    it("when populated, it should overwrite the current report", async () => {
      const ogEntries: InEntry[] = [
        {
          date: new Date(),
          stories: [],
        },
      ];
      await writeReport(ogEntries);

      const newEntries: InEntry[] = [
        {
          date: new Date(),
          stories: [],
        },
      ];
      await writeReport(newEntries);

      expect(await basicRead(reportPath)).toStrictEqual(
        JSON.stringify(newEntries)
      );
    });
  });

  describe("appendReport", () => {
    it("on an empty report, it should write to it", async () => {
      const entry: InEntry = {
        date: new Date(),
        stories: [],
      };
      await appendReport(entry);
      expect(await basicRead(reportPath)).toStrictEqual(
        JSON.stringify([entry])
      );
    });

    it("when the report is already populated, should prepend to it", async () => {
      const ogEntry: InEntry = {
        date: new Date(),
        stories: [],
      };

      await appendReport(ogEntry);

      const newEntry: InEntry = {
        date: new Date(),
        stories: [],
      };

      await appendReport(newEntry);

      expect(await basicRead(reportPath)).toStrictEqual(
        JSON.stringify([newEntry, ogEntry])
      );
    });
  });

  describe("clean", () => {
    it("should reset the log", async () => {
      await appendLog("0");
      expect(await basicRead(logPath)).toBe("0");

      await clean();
      expect(await basicRead(logPath)).toBe("");
    });

    it("should filter out any days that are not today or yesterday", async () => {
      const today = mutateDate({
        date: new Date(),
        hours: 8,
        minutes: 0,
        month: 5,
        day: 13,
      });
      const yesterday = mutateDate({
        date: new Date(),
        hours: 8,
        minutes: 0,
        month: 5,
        day: 12,
      });
      const twoDaysAgo = mutateDate({
        date: new Date(),
        hours: 8,
        minutes: 0,
        month: 5,
        day: 11,
      });

      jest.useFakeTimers().setSystemTime(today);

      const todayEntry: InEntry = {
        date: today,
        stories: [],
      };
      const yesterdayEntry: InEntry = {
        date: yesterday,
        stories: [],
      };
      const twoDaysAgoEntry: InEntry = {
        date: twoDaysAgo,
        stories: [],
      };

      await writeReport([todayEntry, yesterdayEntry, twoDaysAgoEntry]);
      await clean();
      expect(await basicRead(reportPath)).toStrictEqual(
        JSON.stringify([todayEntry, yesterdayEntry])
      );
    });
  });
});
