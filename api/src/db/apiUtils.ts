import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export interface Session {
  token: string;
  expiration: Date;
}

const dbPath = path.join(__dirname, "db.json");

async function maybeCreateFile(path: string) {
  if (!existsSync(path)) {
    await writeFile(path, "");
  }
}

export async function init() {
  try {
    await writeFile(dbPath, JSON.stringify([]));
  } catch (err) {
    console.log(err);
  }
}

export async function write(session: Session) {
  try {
    const currSessions = await read();

    const now = new Date();
    const nonExpiredSessions = currSessions.filter(
      ({ expiration }) => expiration > now
    );

    const newSessions = nonExpiredSessions.concat([session]);
    await writeFile(dbPath, JSON.stringify(newSessions));
  } catch (err) {
    console.log(err);
  }
}

export async function read() {
  try {
    await maybeCreateFile(dbPath);
    let rawData = "";
    try {
      rawData = (await readFile(dbPath)).toString();
    } catch (err) {}

    let parsedData: { token: string; expiration: string }[] = [];
    if (rawData) {
      parsedData = JSON.parse(rawData);
    }

    const revivedData: Session[] = parsedData.map(({ token, expiration }) => ({
      token,
      expiration: new Date(expiration),
    }));

    return revivedData;
  } catch (err) {
    console.log(err);
    return [];
  }
}

export async function del(sessionTokenToDelete: Session["token"]) {
  try {
    const currSessions = await read();
    const foundSession = currSessions.find(
      ({ token }) => token === sessionTokenToDelete
    );
    if (!foundSession) {
      return;
    }

    const newSessions = currSessions.filter(
      ({ token }) => token !== sessionTokenToDelete
    );
    await writeFile(dbPath, JSON.stringify(newSessions));
  } catch (err) {
    console.log(err);
  }
}

export { dbPath };
