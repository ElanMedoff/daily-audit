import { style } from "@vanilla-extract/css";

const wrapper = style({
  marginTop: 72,
  display: "flex",
  flexDirection: "column",
});

const form = style({
  display: "flex",
  flexWrap: "wrap-reverse",
  justifyContent: "center",
  gap: 16,
});

const alert = style({
  maxWidth: 500,
  margin: "0 auto",
  marginTop: 32,
});

const input = style({
  width: 375,
});

const styles = {
  wrapper,
  form,
  alert,
  input,
};

export default styles;
