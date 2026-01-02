import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 仓库信息统一声明
const GITHUB_USER = "MC-OpenST";
const GITHUB_REPO = "Storage-schematic-archive-2.0";
const GITHUB_BASE_RAW = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/files`;

const repoRoot = path.resolve(__dirname, "..");
const filesDir = path.join(repoRoot, "files");
const imagesDir = path.join(filesDir, "images");
const dataDir = path.join(repoRoot, "data");
const mainIndexFile = path.join(dataDir, "index.json");

const batchSize = 30; // 每个分片 JSON 条数
const defaultPreview = "files/notFound.png";

// 异步递归扫描文件夹
async function walk(dir, baseDir = dir) {
    let filelist = [];
    const files = await fs.readdir(dir, { withFileTypes: true });
    for (const file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
            const nested = await walk(fullPath, baseDir);
            filelist = filelist.concat(nested);
        } else {
            filelist.push(path.relative(baseDir, fullPath).replace(/\\/g, "/"));
        }
    }
    return filelist;
}

// 构建图片 Map：basename -> preview path
async function buildImageMap() {
    const map = new Map();
    try {
        const imgs = await fs.readdir(imagesDir);
        imgs.forEach(img => {
            map.set(path.parse(img).name, `files/images/${img}`);
        });
    } catch {
        // imagesDir 不存在
    }
    return map;
}

// 生成分片 JSON
async function generateIndex() {
    await fs.mkdir(dataDir, { recursive: true });

    const allFiles = await walk(filesDir);
    const imageMap = await buildImageMap();

    const batches = [];
    for (let i = 0; i < allFiles.length; i += batchSize) {
        const batch = allFiles.slice(i, i + batchSize).map(f => {
            const ext = path.extname(f).toLowerCase();
            const name = path.basename(f, ext);
            const preview = imageMap.get(name) || defaultPreview;
            const rawUrl = `${GITHUB_BASE_RAW}/${f}`;
            const schematio = (ext === ".litematic" || ext === ".zip")
                ? `https://schemat.io/view?url=${rawUrl}`
                : null;

            return { name: path.basename(f), path: f, preview, rawUrl, schematio };
        });

        const batchFile = path.join(dataDir, `index-batch-${i / batchSize + 1}.json`);
        await fs.writeFile(batchFile, JSON.stringify(batch, null, 2));
        batches.push({ name: `Batch ${i / batchSize + 1}`, url: `data/${path.basename(batchFile)}` });
    }

    // 主 index.json，只包含分片信息
    await fs.writeFile(mainIndexFile, JSON.stringify(batches, null, 2));

    console.log(`生成完成，共 ${allFiles.length} 个文件，分 ${batches.length} 个批次`);
}

generateIndex().catch(err => {
    console.error(err);
    process.exit(1);
});
