```js
// === YOUTUBE ADS CLEANER (HYBRID FIX FULL) ===

if (!$response.body) $done({});

// chỉ xử lý API YouTube
if (!$request.url.includes("youtubei")) {
  $done({});
}

let obj;
try {
  obj = JSON.parse($response.body);
} catch {
  $done({});
}

// ===== 1. XOÁ ADS TOP LEVEL =====
delete obj.adPlacements;
delete obj.playerAds;
delete obj.adSlots;
delete obj.ads;

// ===== 2. CLEAN PLAYER =====
if (obj.playerResponse) {
  delete obj.playerResponse.adPlacements;
  delete obj.playerResponse.playerAds;
}

// ===== 3. FILTER CHUẨN (NÂNG CẤP) =====
function cleanItems(arr) {
  if (!Array.isArray(arr)) return arr;

  const res = [];

  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];

    // ===== BLOCK ADS =====
    if (
      item?.promotedSparklesWebRenderer ||
      item?.adSlotRenderer ||
      item?.bannerRenderer ||
      item?.statementBannerRenderer ||
      item?.richSectionRenderer || // NEW ADS
      item?.compactPromotedVideoRenderer
    ) {
      continue;
    }

    // ===== BLOCK FAKE VIDEO ADS =====
    if (
      item?.richItemRenderer?.content?.videoRenderer?.adBadge ||
      item?.richItemRenderer?.content?.videoRenderer?.thumbnailOverlays?.some(o =>
        o?.thumbnailOverlayTimeStatusRenderer?.style === "LIVE"
      )
    ) {
      continue;
    }

    // ===== KEEP VALID =====
    res.push(item);
  }

  return res;
}

// ===== 4. HOME FEED =====
try {
  const tabs = obj?.contents?.twoColumnBrowseResultsRenderer?.tabs;

  if (tabs) {
    for (let i = 0; i < tabs.length; i++) {
      const contents =
        tabs[i]?.tabRenderer?.content?.richGridRenderer?.contents;

      if (contents) {
        tabs[i].tabRenderer.content.richGridRenderer.contents =
          cleanItems(contents);
      }
    }
  }
} catch {}

// ===== 5. CONTINUATION =====
try {
  const actions =
    obj?.onResponseReceivedActions ||
    obj?.onResponseReceivedEndpoints;

  if (actions) {
    for (let i = 0; i < actions.length; i++) {
      const items =
        actions[i]?.appendContinuationItemsAction?.continuationItems;

      if (items) {
        actions[i].appendContinuationItemsAction.continuationItems =
          cleanItems(items);
      }
    }
  }
} catch {}

// ===== 6. SEARCH RESULTS (THÊM) =====
try {
  const contents =
    obj?.contents?.twoColumnSearchResultsRenderer?.primaryContents
      ?.sectionListRenderer?.contents;

  if (contents) {
    for (let i = 0; i < contents.length; i++) {
      const items =
        contents[i]?.itemSectionRenderer?.contents;

      if (items) {
        contents[i].itemSectionRenderer.contents =
          cleanItems(items);
      }
    }
  }
} catch {}

// ===== DONE =====
$done({ body: JSON.stringify(obj) });
```
