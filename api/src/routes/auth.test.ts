import path from "path";
import request from "supertest";
import { writeFile } from "fs/promises";
import express, { Express } from "express";
import cookieParser from "cookie-parser";
import authRouter from "./auth";
import { init, write } from "../db/apiUtils";
import { basicRead } from "../db/apiUtils.test";

const reportPath = path.join(__dirname, "../../../shared/report.json");
const logPath = path.join(__dirname, "../../../shared/log.txt");

describe("router", () => {
  let app: Express;

  beforeEach(async () => {
    init();
    await writeFile(reportPath, "[]");
    await writeFile(logPath, "fake log");
  });

  beforeAll(() => {
    app = express();
    app.use(cookieParser());
    app.use(express.json());
    app.use("/", authRouter);
  });

  afterAll(() => {
    init();
  });

  describe("/isLoggedIn", () => {
    describe("when there is no cookie", () => {
      it("should respond with a 401", async () => {
        const response = await request(app).get("/isLoggedIn").send();
        expect(response.statusCode).toBe(401);
      });
    });

    describe("when there is a cookie", () => {
      describe("when the cookie is not in the db", () => {
        it("should respond with a 401", async () => {
          const response = await request(app)
            .get("/isLoggedIn")
            .set("Cookie", ["sessionToken=123"])
            .send();
          expect(response.statusCode).toBe(401);
        });
      });

      describe("when the cookie is in the db", () => {
        beforeEach(async () => {
          const session = { token: "123", expiration: new Date() };
          await write(session);
        });

        it("should respond with a 200", async () => {
          const response = await request(app)
            .get("/isLoggedIn")
            .set("Cookie", ["sessionToken=123"])
            .send();
          expect(response.statusCode).toBe(200);
        });
      });
    });
  });

  describe("/login", () => {
    describe("when there is no password", () => {
      it("should respond with a 401", async () => {
        const response = await request(app).post("/login").send();
        expect(response.statusCode).toBe(401);
      });
    });

    describe("when there is a password", () => {
      describe("if the password is incorrect", () => {
        it("should respond with a 401", async () => {
          const response = await request(app)
            .post("/login")
            .send({ password: "123" });
          expect(response.statusCode).toBe(401);
        });
      });

      describe("if the password is correct", () => {
        it("should send a cookie, respond with a 200, and write to the db", async () => {
          const response = await request(app)
            .post("/login")
            .send({ password: process.env.PASSWORD })
            .expect("set-cookie", /sessionToken=(.*)/);
          expect(response.statusCode).toBe(200);
          expect((await basicRead()).length).toBe(1);
        });
      });
    });
  });

  describe("/logout", () => {
    describe("when there is no cookie", () => {
      it("should return a 200 and clear the cookie", async () => {
        const response = await request(app)
          .get("/logout")
          .expect("set-cookie", /sessionToken=;(.*)/);
        expect(response.statusCode).toBe(200);
      });
    });

    describe("if there is a cookie", () => {
      beforeEach(async () => {
        const session = { token: "123", expiration: new Date() };
        await write(session);
      });

      it("should return a 200 and clear the cookie", async () => {
        expect((await basicRead()).length).toBe(1);
        const response = await request(app)
          .get("/logout")
          .set("Cookie", ["sessionToken=123"])
          .expect("set-cookie", /sessionToken=;(.*)/);
        expect(response.statusCode).toBe(200);
        expect((await basicRead()).length).toBe(0);
      });
    });
  });

  describe("/report", () => {
    describe("when there is no cookie", () => {
      it("should return a 401", async () => {
        const response = await request(app).get("/report").send();
        expect(response.statusCode).toBe(401);
      });
    });

    describe("when there is a cookie", () => {
      describe("when the cookie is not in the db", () => {
        it("should return a 401", async () => {
          const response = await request(app)
            .get("/report")
            .set("Cookie", ["sessionToken=123"])
            .send();
          expect(response.statusCode).toBe(401);
        });
      });

      describe("when the cookie is in the db", () => {
        beforeEach(async () => {
          const session = { token: "123", expiration: new Date() };
          await write(session);
        });

        it("should return the report", async () => {
          const response = await request(app)
            .get("/report")
            .set("Cookie", ["sessionToken=123"]);
          expect(response.statusCode).toBe(200);
          expect(response.body).toStrictEqual({ message: [] });
        });
      });
    });
  });

  describe("/log", () => {
    describe("when there is no cookie", () => {
      it("should return a 401", async () => {
        const response = await request(app).get("/log").send();
        expect(response.statusCode).toBe(401);
      });
    });

    describe("when there is a cookie", () => {
      describe("when the cookie is not in the db", () => {
        it("should return a 401", async () => {
          const response = await request(app)
            .get("/log")
            .set("Cookie", ["sessionToken=123"])
            .send();
          expect(response.statusCode).toBe(401);
        });
      });

      describe("when the cookie is in the db", () => {
        beforeEach(async () => {
          const session = { token: "123", expiration: new Date() };
          await write(session);
        });

        it("should return the log", async () => {
          const response = await request(app)
            .get("/log")
            .set("Cookie", ["sessionToken=123"]);
          expect(response.statusCode).toBe(200);
          expect(response.body).toStrictEqual({ message: "fake log" });
        });
      });
    });
  });
});
