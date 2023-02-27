import { useState, useContext } from "react";
import { GlobalStateContext } from "#src/App";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Button,
  Alert,
  useScrollTrigger,
  Slide,
  Collapse,
  IconButton,
  Typography,
} from "@mui/material";
import myFetch from "#utils/myFetch";
import styles from "./styles.css";
import robot from "../../../favicon/android-chrome-512x512.png";
import { Close } from "@mui/icons-material";

function HideOnScroll({ children }: { children: React.ReactElement }) {
  const trigger = useScrollTrigger();
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

export default function Navbar() {
  const [success, setSuccess] = useState("");
  const globalState = useContext(GlobalStateContext);
  const navigateTo = useNavigate();

  const handleLogoutClick = async () => {
    await myFetch<"logout">({
      endpoint: "logout",
      method: "GET",
      onSuccess: ({ message }) => {
        setSuccess(message);
        globalState?.setIsLoggedIn(false);
        navigateTo("/");

        setTimeout(() => {
          setSuccess("");
        }, 4000);
      },
    });
  };

  return (
    <>
      <HideOnScroll>
        <AppBar position="static">
          <Toolbar>
            <button className={styles.headerWrapper}>
              <div className={styles.header}>
                <Typography variant="h6">daily-audit</Typography>
              </div>
              <img className={styles.robot} src={robot} />
            </button>
            <Button
              size="small"
              color="inherit"
              variant="outlined"
              onClick={handleLogoutClick}
              disabled={!globalState?.isLoggedIn}
            >
              logout
            </Button>
          </Toolbar>
        </AppBar>
      </HideOnScroll>
      <div className={styles.alertWrapper}>
        <Collapse in={!!success}>
          <Alert
            className={styles.alert}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  setSuccess("");
                }}
              >
                <Close fontSize="inherit" />
              </IconButton>
            }
          >
            {success}
          </Alert>
        </Collapse>
      </div>
    </>
  );
}
