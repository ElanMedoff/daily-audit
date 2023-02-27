import { Request, Response, NextFunction } from "express";
import { read } from "../db/apiUtils";

export default async function isLoggedIn(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.cookies.sessionToken) {
    return res
      .status(401)
      .json({ message: "Session expired, no cookie. Please log in!" });
  }

  const currTokens = await read();
  if (currTokens.some(({ token }) => token === req.cookies.sessionToken)) {
    return next();
  } else {
    return res.status(401).json({ message: "Fake session detected." });
  }
}
