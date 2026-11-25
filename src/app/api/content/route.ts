import { NextResponse } from "next/server";
import { PRAYERS } from "@/lib/practice/prayers";
import { MEDITATIONS } from "@/lib/practice/meditations";
import { DAILY_VERSES } from "@/lib/practice/verses";
import { STORIES } from "@/lib/learn/jataka";
import clips from "@/lib/cms/clip-manifest.json";
import storyClips from "@/lib/cms/story-clips.json";

// Published content for the Android app. The app ships with the content of
// its build and checks here on launch, so prayers, meditations, verses, stories and
// voice clips published in the CMS reach it without a store update. Built
// once per deploy (a CMS publish triggers a deploy).
export const dynamic = "force-static";

export function GET() {
  const body = { prayers: PRAYERS, meditations: MEDITATIONS, verses: DAILY_VERSES, stories: STORIES, clips, storyClips };
  const version = Buffer.from(JSON.stringify(body)).length.toString(36) + "-" + simpleHash(JSON.stringify(body));
  return NextResponse.json({ version, ...body }, { headers: { "Cache-Control": "public, max-age=300" } });
}

function simpleHash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}
