import { OutEntry, Response } from "../../../shared/sharedUtils";

type Endpoint = "isLoggedIn" | "login" | "logout" | "report" | "log";

export default async function myFetch<T extends Endpoint>({
  endpoint,
  method,
  password,
  onSuccess,
  onError,
  signal,
}: {
  endpoint: Endpoint;
  method: "GET" | "POST";
  password?: string;
  onSuccess?: (
    data: Response<T extends "report" ? OutEntry[] | string : string>
  ) => void;
  onError?: (
    data: Response<T extends "report" ? OutEntry[] | string : string>
  ) => void;
  signal?: AbortSignal;
}) {
  const headers = new Headers();
  if (endpoint === "log") {
    headers.append("Content-Type", "text/plain");
  } else {
    headers.append("Content-Type", "application/json");
  }

  const init: RequestInit = {
    headers,
    method,
    credentials: "include",
    body: password ? JSON.stringify({ password }) : undefined,
    signal,
  };

  const root = import.meta.env.DEV ? "localhost:8080" : "";
  const protocol = window.location.protocol === "https:" ? "https" : "http";
  console.log(`${protocol}://${root}/api/${endpoint}`);

  try {
    const response = await fetch(`${protocol}://${root}/api/${endpoint}`, init);
    const data: Response<T extends "report" ? OutEntry[] | string : string> =
      await response.json();

    if (response.status < 300) {
      onSuccess?.(data);
    } else {
      onError?.(data);
    }
  } catch (e) {
    console.error(e);
  }
}
