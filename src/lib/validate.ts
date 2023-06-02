import * as dayjs from "dayjs";
import * as Parser from "rss-parser";
import { fetchHistoryByTitle } from "./history";

/* 新しい記事かチェック */
export const isNewItem = async (options: {
  title: string;
  pubDate: dayjs.Dayjs;
  nowDate: dayjs.Dayjs;
}) => {
  /* 前日の同時刻～今日の現在時刻までの間に更新された記事をチェック */
  if (options.pubDate.isBefore(options.nowDate.subtract(1, "day"))) {
    return false;
  }
  return true;
};

/* feedの形式チェック */
export const isValidItem = (
  feedItem: {
    description: any;
  } & Parser.Item
) => {
  if (
    !feedItem.title ||
    !feedItem.link ||
    !feedItem.description ||
    !feedItem.pubDate
  ) {
    console.warn("Invalid feed item:", feedItem);
  }
  return true;
};
