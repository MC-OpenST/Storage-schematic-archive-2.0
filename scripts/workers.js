// 作者的独白
/* 由于之前我没注意转码所带来的文本解释问题，导致了下载时的转码变成了文本，在测试的时候我才注意到qwq。最后紧急修改至二进制源文件下载。不然原本的2.4kb文件变成14b文件那谁能理解，就剩个标题了pwp */ 

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event));
});

const REPO_RAW_JSON_URL =
  "https://raw.githubusercontent.com/MC-OpenST/Storage-schematic-archive-2.0/main/data/index.json";
const FILES_RAW_URL =
  "https://raw.githubusercontent.com/MC-OpenST/Storage-schematic-archive-2.0/main/files";

// 保留路径里的 /，只对每一段进行 encode
function encodePathPreserveSlash(path) {
  return path.split("/").map(encodeURIComponent).join("/");
}

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
        "Access-Control-Allow-Headers": "*",
      },
    });
  }

  // /list 返回 JSON 文件列表
  if (pathname.startsWith("/list")) {
    const cache = caches.default;
    let response = await cache.match(request);
    if (!response) {
      const githubResponse = await fetch(REPO_RAW_JSON_URL, {
        headers: { Accept: "application/vnd.github.v3.raw" },
      });
      const data = await githubResponse.text();
      response = new Response(data, {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
        },
      });
      event.waitUntil(cache.put(request, response.clone()));
    }
    return response;
  }

  // /dl/<file> 下载文件（代理 GitHub raw）
  if (pathname.startsWith("/dl/")) {
    const filePath = pathname.replace("/dl/", "");
    const downloadUrl = `${FILES_RAW_URL}/${filePath}`; // 不做 encodeURIComponent
    const fileRes = await fetch(downloadUrl);
    return new Response(fileRes.body, {
        headers: {
            "Content-Type": fileRes.headers.get("content-type") || "application/octet-stream",
            "Content-Disposition": `attachment; filename="${decodeURIComponent(filePath.split("/").pop())}"`,
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS"
        }
    });
}

  // /files/<file> 直接代理 GitHub raw 文件
  if (pathname.startsWith("/files/")) {
    const filePath = pathname.replace("/files/", "");
    const fileUrl = `${FILES_RAW_URL}/${encodePathPreserveSlash(filePath)}`;
    const fileRes = await fetch(fileUrl);

    if (!fileRes.ok) {
      return new Response("File not found", { status: 404 });
    }

    const arrayBuffer = await fileRes.arrayBuffer();
    return new Response(arrayBuffer, {
      headers: {
        "Content-Type":
          fileRes.headers.get("content-type") || "application/octet-stream",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
    });
  }

  return new Response("Not found", {
    status: 404,
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}
