import { ScrollRoot } from "../manager/_types";

export const isWindow = (r: ScrollRoot): r is Window =>
  (r as Window).window === r;
