import express, { Response as ExpressResponse } from "express";
import path from "path";
import crypto from "crypto";
import { readFileSync, existsSync } from "fs";
import { writeFile } from "fs/promises";
import { del, write, read } from "../db/apiUtils";
import isLoggedIn from "../middleware/isLoggedIn";
import { OutEntry, Response } from "../../../shared/sharedUtils";
import dotenv from "dotenv";

dotenv.config({
  path: path.join(__dirname, "../../.env"),
});

const router = express.Router();

router.get(
  "/isLoggedIn",
  async (req, res: ExpressResponse<Response<string>>) => {
    if (!req.cookies.sessionToken) {
      return res
        .status(401)
        .json({ message: "No cookie provided, please log in." });
    }

    const currTokens = await read();
    if (currTokens.some(({ token }) => token === req.cookies.sessionToken)) {
      return res.status(200).json({ message: "Successfully logged in!" });
    }

    return res.status(401).json({ message: "Invalid cookie, please log in." });
  }
);

router.post("/login", async (req, res: ExpressResponse<Response<string>>) => {
  if (!req.body.password) {
    return res.status(401).json({ message: "No password provided." });
  }

  if (req.body.password === process.env.PASSWORD || process.env.NODE_ENV === "dev") {
    const sessionToken = crypto.randomBytes(64).toString("hex");

    if (req.cookies.sessionToken) {
      await del(req.cookies.sessionToken);
    }

    const maxAge =
      process.env.NODE_ENV === "dev" ? 2 * 60 * 1000 : 12 * 60 * 60 * 1000;

    const oldDate = new Date();
    const newDate = new Date();
    newDate.setTime(oldDate.getTime() + maxAge);
    await write({ token: sessionToken, expiration: newDate });

    res.cookie("sessionToken", sessionToken, {
      maxAge,
      httpOnly: true,
      sameSite: true,
    });

    return res
      .status(200)
      .json({ message: "Password accepted, session created!" });
  } else {
    return res.status(401).json({ message: "Incorrect password provided." });
  }
});

router.get("/logout", async (req, res: ExpressResponse<Response<string>>) => {
  if (req.cookies.sessionToken) {
    // gracefully handles deleting a cookie not in the database
    await del(req.cookies.sessionToken);
  }

  res.clearCookie("sessionToken", {
    httpOnly: true,
    sameSite: true,
  });
  return res.status(200).json({ message: "Logged out." });
});

router.get(
  "/report",
  isLoggedIn,
  async (_, res: ExpressResponse<Response<string | OutEntry[]>>) => {
    const filePath = path.join(__dirname, "../../../shared/report.json");

    if (!existsSync(filePath)) {
      await writeFile(filePath, "");
    }

    const fileContent = JSON.parse(readFileSync(filePath).toString());
    return res.status(200).json({ message: fileContent });
  }
);

router.get(
  "/log",
  isLoggedIn,
  async (_, res: ExpressResponse<Response<string>>) => {
    const filePath = path.join(__dirname, "../../../shared/log.txt");

    if (!existsSync(filePath)) {
      await writeFile(filePath, "");
    }

    const fileContent = readFileSync(filePath).toString();
    return res.status(200).json({ message: fileContent });
  }
);

export default router;
