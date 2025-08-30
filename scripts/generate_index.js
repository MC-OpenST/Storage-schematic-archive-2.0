const fs = require("fs");
const path = require("path");

const filesDir = path.join(process.cwd(), 'files');
const indexFile = path.join(process.cwd(), 'data/index.json');
const defaultPreview = 'files/notFound.png';

function walk(dir, tag) {
    let results = [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            results = results.concat(walk(filePath, file));
        } else {
            const ext = path.extname(file).toLowerCase();
            const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
            results.push({
                name: file,
                path: relativePath,
                size: stat.size,
                tag: tag,
                ext: ext
            });
        }
    }
    return results;
}

// 遍历所有文件
const allFiles = walk(filesDir, '');

// 构建图片查找表
const imageExtensions = ['.jpg', '.png', '.gif', '.webp'];
const litematicExtensions = ['.litematic'];
const imageMap = {};
allFiles.forEach(f => {
    const baseName = path.basename(f.name, f.ext);
    const folder = path.dirname(f.path);
    if (imageExtensions.includes(f.ext)) {
        if (!imageMap[baseName]) imageMap[baseName] = [];
        imageMap[baseName].push({ path: f.path, folder });
    }
});

// 生成 index.json
const index = allFiles.map(f => {
    let preview = null;
    let schemat = null;
    const baseName = path.basename(f.name, f.ext);
    const folder = path.dirname(f.path);

    if (imageExtensions.includes(f.ext)) {
        preview = `https://raw.githubusercontent.com/<user>/<repo>/main/${f.path}`;
    } else if (litematicExtensions.includes(f.ext)) {
        schemat = `https://schemat.io/view?url=https://raw.githubusercontent.com/<user>/<repo>/main/${f.path}`;
        // 尝试匹配图片
        if (imageMap[baseName]) {
            const img = imageMap[baseName].find(i => i.folder !== folder);
            if (img) preview = `https://raw.githubusercontent.com/<user>/<repo>/main/${img.path}`;
        }
        if (!preview) preview = `https://raw.githubusercontent.com/<user>/<repo>/main/${defaultPreview}`;
    } else {
        preview = `https://raw.githubusercontent.com/<user>/<repo>/main/${defaultPreview}`;
    }

    return {
        name: f.name,
        path: f.path,
        size: f.size,
        tag: f.tag,
        download: `https://raw.githubusercontent.com/<user>/<repo>/main/${f.path}`,
        preview,
        schemat
    };
});

fs.mkdirSync(path.dirname(indexFile), { recursive: true });
fs.writeFileSync(indexFile, JSON.stringify(index, null, 2));
console.log('index.json generated with default preview and schemat.io!');



