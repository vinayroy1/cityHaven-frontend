import { NextRequest, NextResponse } from "next/server";
import { getAllTopSeoUrls, SITE_URL } from "@/constants/seo";

const INDEXNOW_KEY = "a0c7e5b29f1d43a88b6c4e09f5127d3e";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

export async function GET(request: NextRequest) {
  return handleForceCrawl(request);
}

export async function POST(request: NextRequest) {
  return handleForceCrawl(request);
}

async function handleForceCrawl(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filterIntent = searchParams.get("intent")?.toLowerCase();
    const filterCity = searchParams.get("city")?.toLowerCase();

    let allUrls = getAllTopSeoUrls();

    if (filterIntent) {
      allUrls = allUrls.filter((u) => u.includes(`/${filterIntent}`));
    }
    if (filterCity) {
      allUrls = allUrls.filter((u) => u.includes(`/${filterCity}`));
    }

    // Always ensure homepage is included
    if (!allUrls.includes(`${SITE_URL}/`)) {
      allUrls.unshift(`${SITE_URL}/`);
    }

    // 1. Submit batch to IndexNow (Bing, Yandex, Seznam, Naver)
    let indexNowResult: { status: number; message: string } = {
      status: 0,
      message: "pending",
    };

    try {
      const payload = {
        host: "awasio.com",
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: allUrls,
      };

      const res = await fetch(INDEXNOW_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      indexNowResult = {
        status: res.status,
        message:
          res.status === 200 || res.status === 202
            ? "Successfully pushed to IndexNow (Bing, Yandex, etc.) for instant crawling."
            : `IndexNow returned status ${res.status}`,
      };
    } catch (err: unknown) {
      indexNowResult = {
        status: 500,
        message: err instanceof Error ? err.message : "IndexNow push failed",
      };
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      totalUrls: allUrls.length,
      indexNow: indexNowResult,
      googleIndexing: {
        status: "ready",
        info: "To forcefully push to Google, run 'npm run seo:google' with your Google Search Console Service Account JSON credentials.",
      },
      urls: allUrls,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
