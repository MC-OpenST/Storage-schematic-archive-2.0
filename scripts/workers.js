addEventListener("fetch", event => {
  event.respondWith(handleRequest(event));
});

const REPO_RAW_JSON_URL = "https://raw.githubusercontent.com/MC-OpenST/Storage-schematic-archive-2.0/main/data/index.json";
const FILES_RAW_URL = "https://raw.githubusercontent.com/MC-OpenST/Storage-schematic-archive-2.0/main/files";

async function handleRequest(event) {
  const request = event.request;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // OPTIONS 预检请求
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "*"
      }
    });
  }

  // /list 返回 JSON 文件列表
  if (pathname.startsWith("/list")) {
    const cache = caches.default;
    let response = await cache.match(request);
    if (!response) {
      const githubResponse = await fetch(REPO_RAW_JSON_URL, {
        headers: { "Accept": "application/vnd.github.v3.raw" }
      });
      const data = await githubResponse.text();
      response = new Response(data, {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS"
        }
      });
      event.waitUntil(cache.put(request, response.clone()));
    }
    return response;
  }

  // /dl/<file> 下载文件（代理 GitHub raw）
  if (pathname.startsWith("/dl/")) {
    const filePath = pathname.replace("/dl/", "");
    const downloadUrl = `${FILES_RAW_URL}/${encodeURIComponent(filePath)}`; // <-- encodeURIComponent
    const fileRes = await fetch(downloadUrl);
    return new Response(fileRes.body, {
        headers: {
            "Content-Type": fileRes.headers.get("content-type") || "application/octet-stream",
            "Content-Disposition": `attachment; filename="${filePath.split("/").pop()}"`,
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS"
        }
    });
  }

  // /files/<file> 代理 GitHub raw 文件
  if (pathname.startsWith("/files/")) {
    const filePath = pathname.replace("/files/", "");
    const fileUrl = `${FILES_RAW_URL}/${encodeURIComponent(filePath)}`; // <-- encodeURIComponent
    const fileRes = await fetch(fileUrl);
    return new Response(fileRes.body, {
        headers: {
            "Content-Type": fileRes.headers.get("content-type") || "application/octet-stream",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS"
        }
    });
  }

  return new Response("Not found", {
    status: 404,
    headers: { "Access-Control-Allow-Origin": "*" }
  });
}

