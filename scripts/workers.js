addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request));
});

const GITHUB_TOKEN = "<YOUR_GITHUB_TOKEN>";
const REPO_RAW_JSON_URL = "https://raw.githubusercontent.com/<user>/<repo>/main/data/index.json";

async function handleRequest(request) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/list")) {
        const cache = caches.default;
        let response = await cache.match(request);
        if (!response) {
            const githubResponse = await fetch(REPO_RAW_JSON_URL, {
                headers: {
                    "Authorization": `token ${GITHUB_TOKEN}`,
                    "Accept": "application/vnd.github.v3.raw"
                }
            });
            const data = await githubResponse.text();
            response = new Response(data, { headers: { "Content-Type": "application/json" } });
            event.waitUntil(cache.put(request, response.clone()));
        }
        return response;
    }

    if (url.pathname.startsWith("/dl/")) {
        const filePath = url.pathname.replace("/dl/", "");
        const downloadUrl = `https://raw.githubusercontent.com/<user>/<repo>/main/files/${filePath}`;
        return Response.redirect(downloadUrl, 302);
    }

    return new Response("Not found", { status: 404 });
}
