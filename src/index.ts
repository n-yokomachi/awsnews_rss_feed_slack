import Parser from "rss-parser";
import dayjs from "dayjs";
import { CfnSolution } from "aws-cdk-lib/aws-personalize";
import { getEnv } from "./env";
import { feeds } from "./feed";
import { isNewItem, isValidItem } from "./lib/validate";
import { translate } from "./lib/translate";
import { buildMessageBody, notify } from "./lib/notify";

const parser = new Parser({
  customFields: {
    item: ["description"],
  },
});

export const handler = async () => {
  const nowDate = dayjs();
  console.log(`nowDate : ${nowDate}`);
  const { SLACK_INCOMING_WEBHOOK_URL, DRY_RUN } = getEnv();

  await Promise.all(
    feeds.map(async (feed) => {
      console.info(`Now processing ${feed.title}`);

      /* フィード内のアイテムが最新情報かチェック */
      const posts = await parser.parseURL(feed.url);
      const bitsForFilter = await Promise.all(
        posts.items.map(
          async (item) =>
            isValidItem(item) &&
            (await isNewItem({
              title: item.title!,
              nowDate,
              pubDate: dayjs(item.pubDate),
            }))
        )
      );

      /* タイトルを翻訳して最新情報のみの通知用リストを作成 */
      const filterdPosts = posts.items.filter(() => bitsForFilter.shift());
      const newPosts = await Promise.all(
        filterdPosts.map(async (item) => ({
          feed: feed.title!,
          title: (await translate(item.title!))!,
          rawTitle: item.title!,
          link: item.link!,
          description: item.description!,
          rawDescription: item.description!,
          pubDate: item.pubDate!,
        }))
      );

      /* Slackに通知する */
      console.info(`Found ${newPosts.length} new items!`);
      if (newPosts.length > 0) {
        const body = buildMessageBody({
          source: feed.title,
          posts: newPosts,
        });

        if (!DRY_RUN) {
          await notify({
            url: SLACK_INCOMING_WEBHOOK_URL,
            body,
          });
        } else {
          console.info("DRY_RUN is true. Skip notification.");
          console.info(JSON.stringify(body));
        }
      }
    })
  );
};
