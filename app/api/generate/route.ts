import { NextRequest, NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";
import { getTweetIdFromUrl, fetchTweet, createTweetImage } from "@/lib/tweet";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");
    const bearer = searchParams.get("bearer");

    if (!url) {
      return NextResponse.json({ error: "Missing url param" }, { status: 400 });
    }

    const token = bearer || process.env.BEARER_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "No bearer token provided" },
        { status: 400 },
      );
    }

    const client = new TwitterApi(token);
    const tweetId = getTweetIdFromUrl(url);
    const tweetData = await fetchTweet(tweetId, client);
    const buffer = await createTweetImage(tweetData);

    // ✅ Convert Buffer → Uint8Array (valid BodyInit)
    return new Response(new Uint8Array(buffer), {
      headers: { "Content-Type": "image/png" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
