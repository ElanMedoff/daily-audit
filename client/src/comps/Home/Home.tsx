import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import styles from "./styles.css";
import myFetch from "#utils/myFetch";
import { GlobalStateContext } from "#src/App";
import {
  Button,
  Alert,
  IconButton,
  FormControl,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Collapse,
} from "@mui/material";
import { Visibility, VisibilityOff, Close } from "@mui/icons-material";

const MyAlert = ({
  message,
  color,
  setMessage,
}: {
  message: string;
  color: "success" | "error";
  setMessage: Dispatch<SetStateAction<string>>;
}) => {
  return (
    <Collapse in={!!message}>
      <Alert
        className={styles.alert}
        severity={color}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={() => {
              setMessage("");
            }}
          >
            <Close fontSize="inherit" />
          </IconButton>
        }
      >
        {message}
      </Alert>
    </Collapse>
  );
};

export default function Home() {
  const globalState = useContext(GlobalStateContext);
  const [input, setInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const navigateTo = useNavigate();

  useEffect(() => {
    const abortController = new AbortController();

    const load = async () => {
      await myFetch<"isLoggedIn">({
        endpoint: "isLoggedIn",
        method: "GET",
        onSuccess: ({ message }) => {
          setSuccess(message);
          globalState?.setIsLoggedIn(true);
          navigateTo("/report");

          setTimeout(() => {
            setSuccess("");
          }, 4000);
        },
        onError: () => {
          globalState?.setIsLoggedIn(false);
        },
        signal: abortController.signal,
      });
    };

    load();

    return () => {
      abortController.abort();
    };
  }, [globalState, navigateTo, setSuccess]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    await myFetch<"login">({
      endpoint: "login",
      method: "POST",
      password: input,
      onError: ({ message }) => {
        setError(message);

        setTimeout(() => {
          setError("");
        }, 4000);
      },
      onSuccess: () => {
        globalState?.setIsLoggedIn(true);
        navigateTo("/report");
      },
    });
  };

  return (
    <div className={styles.wrapper}>
      <form onSubmit={onSubmit} className={styles.form}>
        <FormControl variant="outlined">
          <InputLabel>Password</InputLabel>
          <OutlinedInput
            autoFocus
            className={styles.input}
            type={showPassword ? "text" : "password"}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError("");
              setSuccess("");
            }}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            }
            label="Password"
            fullWidth
          />
        </FormControl>
        <Button
          size="medium"
          variant="outlined"
          type="submit"
          disabled={globalState?.isLoggedIn}
        >
          submit
        </Button>
      </form>
      <MyAlert message={success} color="success" setMessage={setSuccess} />
      <MyAlert message={error} color="error" setMessage={setError} />
    </div>
  );
}
