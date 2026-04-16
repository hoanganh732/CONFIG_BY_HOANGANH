```js
// === hoanganh OPTIMIZED (NO LOGIC CHANGE) ===

if (!$response.body) $done({});

// chỉ chạy với youtube api
if (!$request.url.includes("youtubei")) {
  $done({});
}

let obj;
try {
  obj = JSON.parse($response.body);
} catch {
  $done({});
}

// ===== FAST DELETE (GIỮ NGUYÊN HÀNH VI) =====
const adKeys = ["adPlacements", "playerAds", "adSlots", "ads"];

// stack thay recursion (NHANH HƠN)
const stack = [obj];

while (stack.length) {
  const current = stack.pop();

  if (!current || typeof current !== "object") continue;

  // xoá ads (giữ logic cũ)
  for (let i = 0; i < adKeys.length; i++) {
    if (current[adKeys[i]]) delete current[adKeys[i]];
  }

  // duyệt object (tối ưu)
  const values = Object.values(current);
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (v && typeof v === "object") {
      stack.push(v);
    }
  }
}

// ===== FILTER LOGIC GIỮ NGUYÊN =====
function cleanArray(arr) {
  if (!Array.isArray(arr)) return arr;

  const res = [];
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];

    // giữ nguyên logic hoanganh (không thay đổi điều kiện)
    if (
      item?.richItemRenderer ||
      item?.videoRenderer ||
      item?.compactVideoRenderer ||
      item?.gridVideoRenderer
    ) {
      res.push(item);
    } else if (
      item?.promotedSparklesWebRenderer ||
      item?.adSlotRenderer ||
      item?.bannerRenderer ||
      item?.compactPromotedVideoRenderer
    ) {
      continue;
    } else {
      res.push(item);
    }
  }

  return res;
}

// ===== APPLY hoanganh =====
try {
  const tabs =
    obj?.contents?.twoColumnBrowseResultsRenderer?.tabs;

  if (tabs) {
    for (let i = 0; i < tabs.length; i++) {
      const contents =
        tabs[i]?.tabRenderer?.content?.richGridRenderer?.contents;

      if (contents) {
        tabs[i].tabRenderer.content.richGridRenderer.contents =
          cleanArray(contents);
      }
    }
  }
} catch {}

// continuation
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
          cleanArray(items);
      }
    }
  }
} catch {}

$done({ body: JSON.stringify(obj) });
```
