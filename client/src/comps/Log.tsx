import { useEffect, useState, useContext } from "react";
import myFetch from "#utils/myFetch";
import styles from "#comps/styles.css";
import { GlobalStateContext } from "#src/App";
import Alert from "@mui/material/Alert";
import { useNavigate } from "react-router-dom";

export default function Log() {
  const globalState = useContext(GlobalStateContext);
  const [log, setLog] = useState("");
  const [error, setError] = useState("");
  const navigateTo = useNavigate();

  useEffect(() => {
    const abortController = new AbortController();

    const load = async () => {
      await myFetch<"log">({
        endpoint: "log",
        method: "GET",
        onSuccess: ({ message }) => {
          globalState?.setIsLoggedIn(true);
          setLog(message);
        },
        onError: ({ message }) => {
          setError(message);
          navigateTo("/");
          setLog("");
        },
        signal: abortController.signal,
      });
    };

    load();

    return () => {
      abortController.abort();
    };
  }, [globalState, navigateTo]);

  return (
    <div className={styles.wrapper}>
      <div
        dangerouslySetInnerHTML={{
          __html: log.replace(/(?:\r\n|\r|\n)/g, "<br>"),
        }}
      />
      {error && <Alert severity="error">{error}</Alert>}
    </div>
  );
}
