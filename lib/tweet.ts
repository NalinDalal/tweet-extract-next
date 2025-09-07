import { TwitterApi } from "twitter-api-v2";
import { createCanvas, loadImage } from "canvas";

// Parse Tweet ID from URL
export function getTweetIdFromUrl(url: string) {
  const regex = /\/status\/(\d+)/;
  const match = url.match(regex);
  if (match && match[1]) return match[1];
  throw new Error("Invalid Tweet URL");
}

// Fetch Tweet metadata
export async function fetchTweet(
  tweetId: string,
  client: TwitterApi,
): Promise<TweetData> {
  const tweet = await client.v2.singleTweet(tweetId, {
    expansions: ["author_id"],
    "user.fields": ["profile_image_url", "username", "name"],
  });

  if (!tweet.data) throw new Error("Tweet not found");
  const user = tweet.includes?.users?.[0];

  return {
    text: tweet.data.text,
    authorName: user?.name ?? "Unknown",
    authorUsername: user?.username ?? "unknown",
    profileImageUrl: user?.profile_image_url ?? "",
  };
}

export type TweetData = {
  text: string;
  authorName: string;
  authorUsername: string;
  profileImageUrl: string;
};

// Render tweet into PNG
export async function createTweetImage(tweetData: TweetData): Promise<Buffer> {
  const width = 800;
  const height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // background
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);

  // profile image
  if (tweetData.profileImageUrl) {
    const profileImg = await loadImage(tweetData.profileImageUrl);
    ctx.drawImage(profileImg, 30, 30, 64, 64);
  }

  // author name
  ctx.fillStyle = "#14171a";
  ctx.font = "bold 32px Arial";
  ctx.fillText(tweetData.authorName, 110, 65);

  // username
  ctx.fillStyle = "#657786";
  ctx.font = "24px Arial";
  ctx.fillText(`@${tweetData.authorUsername}`, 110, 95);

  // tweet text
  ctx.fillStyle = "#14171a";
  ctx.font = "28px Arial";

  const maxWidth = width - 60;
  const lineHeight = 36;
  const words = tweetData.text.split(" ");
  let line = "";
  let y = 140;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, 30, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, 30, y);

  return canvas.toBuffer("image/png");
}
