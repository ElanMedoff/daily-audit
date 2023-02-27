import { readFile } from "fs/promises";
import { write, dbPath, init, del } from "./apiUtils";

export const basicRead = async () => {
  const rawData = await readFile(dbPath);
  const parsedData: { token: string; expiration: string }[] = JSON.parse(
    rawData.toString()
  );
  return parsedData.map(({ token, expiration }) => ({
    token,
    expiration: new Date(expiration),
  }));
};

describe("write", () => {
  beforeEach(() => {
    init();
  });

  afterAll(() => {
    init();
  });

  it("should write to the db", async () => {
    const now = new Date();
    const session = { token: "token", expiration: now };
    expect(await basicRead()).toStrictEqual([]);
    await write(session);
    expect(await basicRead()).toStrictEqual([session]);
  });

  describe("with future expiration dates", () => {
    it("should write to the db", async () => {
      const now = new Date();
      const soon = new Date();
      soon.setTime(now.getTime() + 60 * 1000);
      const session0 = { token: "token0", expiration: soon };
      const session1 = { token: "token1", expiration: soon };
      const session2 = { token: "token2", expiration: soon };

      expect(await basicRead()).toStrictEqual([]);
      await write(session0);
      expect(await basicRead()).toStrictEqual([session0]);
      await write(session1);
      expect(await basicRead()).toStrictEqual([session0, session1]);
      await write(session2);
      expect(await basicRead()).toStrictEqual([session0, session1, session2]);
    });
  });

  describe("with past expiration dates", () => {
    beforeEach(() => {
      const now = new Date();
      const farFuture = new Date();
      farFuture.setTime(now.getTime() + 60 * 60 * 1000);
      jest.useFakeTimers().setSystemTime(farFuture);
    });

    it("should clear from the db", async () => {
      const now = new Date();
      const soon = new Date();
      const farFuture = new Date();
      soon.setTime(now.getTime() + 60 * 1000);
      farFuture.setTime(now.getTime() + 60 * 60 * 1000);
      const session0 = { token: "token0", expiration: soon };
      const session1 = { token: "token1", expiration: soon };
      const session2 = { token: "token2", expiration: soon };

      expect(await basicRead()).toStrictEqual([]);
      await write(session0);
      expect(await basicRead()).toStrictEqual([session0]);
      await write(session1);
      expect(await basicRead()).toStrictEqual([session0, session1]);

      jest.useFakeTimers().setSystemTime(farFuture);

      await write(session2);
      expect(await basicRead()).toStrictEqual([session2]);
    });
  });
});

describe("del", () => {
  beforeEach(() => {
    init();
  });

  it("should delete from the db", async () => {
    const now = new Date();
    const soon = new Date();
    soon.setTime(now.getTime() + 60 * 1000);
    const session0 = { token: "token0", expiration: soon };
    const session1 = { token: "token1", expiration: soon };
    expect(await basicRead()).toStrictEqual([]);
    await write(session0);
    await write(session1);
    expect(await basicRead()).toStrictEqual([session0, session1]);

    await del(session0.token);
    expect(await basicRead()).toStrictEqual([session1]);
  });

  describe("when the session is not in the db", () => {
    it("should handle gracefully", async () => {
      const now = new Date();
      expect(await basicRead()).toStrictEqual([]);
      const session = { token: "token", expiration: now };
      await del(session.token);
      expect(await basicRead()).toStrictEqual([]);
    });
  });
});
