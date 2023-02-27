import { Story } from "../script/src";

export interface OutEntry {
  date: string;
  stories: Story[];
}

export interface Response<T> {
  message: T;
}

export function formatMinutes(date: Date) {
  return date.getMinutes().toLocaleString("en-US", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
}

export function formatHour(date: Date) {
  if (date.getHours() === 0) return 12;
  return date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
}

export function formatAmPm(date: Date) {
  return date.getHours() >= 12 ? "PM" : "AM";
}

export const WAIT_TIME_IN_MINUTES = 3;
