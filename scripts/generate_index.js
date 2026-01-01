import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 仓库根目录
const repoRoot = path.resolve(__dirname, "..");

const filesDir = path.join(repoRoot, "files");
const litematicDir = path.join(filesDir, "litematic");
const imagesDir = path.join(filesDir, "images");
const indexFile = path.join(repoRoot, "data", "index.json");

// 保证目录存在
if (!fs.existsSync(filesDir)) {
    console.error("files 目录不存在: ", filesDir);
    process.exit(1);
}

// 递归收集文件
function walk(dir, filelist = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filepath = path.join(dir, file);
        const stat = fs.statSync(filepath);

        if (stat.isDirectory()) {
            walk(filepath, filelist);
        } else {
            filelist.push(path.relative(filesDir, filepath).replace(/\\/g, "/"));
        }
    });
    return filelist;
}

const allFiles = walk(filesDir);

// 默认预览图
const defaultPreview = "files/notFound.png";

// 匹配函数：查找同名图片
function findPreview(baseName) {
    if (!fs.existsSync(imagesDir)) return defaultPreview;
    const candidates = fs.readdirSync(imagesDir);
    const match = candidates.find(img => path.parse(img).name === baseName);
    return match ? `files/images/${match}` : defaultPreview;
}

// 生成 schemat.io 链接
function schematioUrl(filePath) {
    const repo = "Storage-schematic-archive-2.0";
    const user = "MC-OpenST";
    return `https://schemat.io/view?url=https://raw.githubusercontent.com/${user}/${repo}/main/files/${filePath}`;
}

// 生成 index 数据
const indexData = allFiles.map(f => {
    const ext = path.extname(f).toLowerCase();
    const name = path.basename(f, ext);

    let preview = defaultPreview;
    let schematio = null;

    if (ext === ".litematic" || ext === ".zip") {
        preview = findPreview(name);
        schematio = schematioUrl(f);
    }

    const repo = "Storage-schematic-archive-2.0";
    const user = "MC-OpenST";
    const rawUrl = `https://raw.githubusercontent.com/${user}/${repo}/main/files/${f}`;

    return {
        name: path.basename(f),
        path: f,
        rawUrl, // GitHub 原始地址
        preview,
        schematio
    };
});

// 写入 index.json
fs.mkdirSync(path.dirname(indexFile), { recursive: true });
fs.writeFileSync(indexFile, JSON.stringify(indexData, null, 2));

console.log(`生成完成，共收录 ${allFiles.length} 个文件`);

