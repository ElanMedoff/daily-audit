import { useEffect, useState, useContext } from "react";
import myFetch from "#utils/myFetch";
import { GlobalStateContext } from "#src/App";
import styles from "#comps/styles.css";
import Alert from "@mui/material/Alert";
import { useNavigate } from "react-router-dom";
import {
  OutEntry,
  formatAmPm,
  formatHour,
  formatMinutes,
} from "../../../shared/sharedUtils";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";

export default function Report() {
  const globalState = useContext(GlobalStateContext);
  const [report, setReport] = useState<OutEntry[] | null>(null);
  const [error, setError] = useState("");
  const navigateTo = useNavigate();

  useEffect(() => {
    const abortController = new AbortController();

    const load = async () => {
      await myFetch<"report">({
        endpoint: "report",
        method: "GET",
        onSuccess: ({ message }) => {
          globalState?.setIsLoggedIn(true);
          if (typeof message !== "string") {
            setReport(message);
          }
        },
        onError: ({ message }) => {
          if (typeof message === "string") {
            setError(message);
          }
          navigateTo("/");
          setReport([]);
        },
        signal: abortController.signal,
      });
    };

    load();

    return () => {
      abortController.abort();
    };
  }, [globalState, navigateTo]);

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (report === null) return null;

  const todayReport = report.filter(
    ({ date }) => new Date(date).toDateString() === today.toDateString()
  );
  const yesterdayReport = report.filter(
    ({ date }) => new Date(date).toDateString() === yesterday.toDateString()
  );

  const renderReport = (day: Date, report: OutEntry[]) => {
    if (!report.length) return;

    return (
      <>
        {report.map((entry, i) => {
          const date = new Date(entry.date);
          const formattedTime = `${formatHour(date)}:${formatMinutes(
            date
          )} ${formatAmPm(date)}`;

          return (
            <div key={i} className={styles.preLine}>
              <article>
                <div>{formattedTime}</div>
                {entry.stories.map((story, j) => {
                  return (
                    <div key={j}>{`${j + 1}. ${story.kicker}: ${
                      story.headline
                    }`}</div>
                  );
                })}
              </article>
              {/* fixes issues pasting with outlook */}
              {"\n"}
            </div>
          );
        })}
        <div>{day.toDateString()}</div>
      </>
    );
  };

  return (
    <div className={styles.wrapper}>
      <Stack spacing={4}>
        <Alert severity="error" sx={{ fontSize: 14 }}>
          Hi all, <br />
          With me leaving and the new homepage going live in a few days, it
          looks like daily-audit's time has come to an end — it'll be shutting
          down on <strong>Friday, January 27th at 11PM ET</strong>. Thanks for
          all of the kind comments since its release — I've really appreciated
          all of the feedback. Wishing everyone the best with the launch of the
          new site, and please let me know if you have any questions.
        </Alert>
        <span>{renderReport(today, todayReport)}</span>
        <Divider />
        <span>{renderReport(yesterday, yesterdayReport)}</span>
        {error && <Alert severity="error">{error}</Alert>}
      </Stack>
    </div>
  );
}
