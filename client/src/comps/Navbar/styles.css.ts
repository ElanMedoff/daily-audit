import { style } from "@vanilla-extract/css";

const link = style({
  textDecoration: "none",
  color: "white",
});

const alertWrapper = style({
  position: "absolute",
  bottom: 48,
  right: 48,
});

const alert = style({
  width: 250,
});

const headerWrapper = style({
  marginRight: "auto",
  display: "flex",
  alignItems: "center",
  gap: 12,
  background: "none",
  border: "none",
  color: "inherit",
  cursor: "pointer",
});

const robot = style({
  width: 28,
  height: 28,
});

const header = style({
  "@media": {
    "screen and (max-width: 450px)": {
      display: "none",
    },
  },
});

const styles = {
  alertWrapper,
  link,
  alert,
  headerWrapper,
  robot,
  header,
};
export default styles;
