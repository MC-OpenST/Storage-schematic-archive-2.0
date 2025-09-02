const FILE_LIST_URL = "https://openst.weizhihan3.workers.dev/list";
const TAGS = ['大宗','空盒仓库','MIS多物品分类','MBS多种类潜影盒分类','细雪展示','SIS无实体输入','编码相关','远程大宗','不可堆叠分类','打包机','混杂打包','自适应打包机','地狱门加载器','分盒器','盒子分类','盒子合并','红石合成站','解码器','潜影盒展示','四边形大宗','整流器']; // 前端硬编码标签
const WORKER_BASE = "https://openst.weizhihan3.workers.dev";

async function loadFiles() {
    const filesRes = await fetch(FILE_LIST_URL);
    const files = await filesRes.json();

    const container = document.getElementById("file-list");
    const tagContainer = document.getElementById("tag-list");
    const searchInput = document.getElementById("search-input");

    // 渲染标签按钮
    TAGS.forEach(tag => {
        const btn = document.createElement("button");
        btn.textContent = tag;
        btn.addEventListener("click", () => filterFiles(tag));
        tagContainer.appendChild(btn);
    });
    // 添加清除筛选按钮
    const clearBtn = document.createElement("button");
    clearBtn.id = "clear-btn";
    clearBtn.textContent = "清除筛选";
    clearBtn.addEventListener("click", () => renderFiles(files));
    tagContainer.appendChild(clearBtn);

    function filterFiles(keyword) {
        container.innerHTML = "";
        const filtered = files.filter(f => f.name.includes(keyword));
        renderFiles(filtered);
    }

    function renderFiles(list) {
        container.innerHTML = "";
        list.forEach(file => {
            // 如果是 png 文件，直接跳过
            if(file.name.endsWith(".png")) return;

            const item = document.createElement("div");
            item.className = "file-item";

            const nameEl = document.createElement("div");
            nameEl.className = "filename";
            nameEl.textContent = file.name;
            item.appendChild(nameEl);

            const img = document.createElement("img");
            const pathParts = file.preview.split('/');
            const encodedPath = pathParts.map(encodeURIComponent).join('/');
            img.src = `${WORKER_BASE}/${encodedPath}`;
            img.width = 300;
            img.height = 200;
            img.addEventListener("click", () => showModal(img.src));
            item.appendChild(img);

            const btnContainer = document.createElement("div");

            // 下载按钮
            const downloadBtn = document.createElement("button");
            downloadBtn.textContent = "下载";
            // 根据 path 动态生成下载 URL
            downloadBtn.onclick = () => window.open(`https://openst.weizhihan3.workers.dev/dl/${file.path}`, "_blank");
            btnContainer.appendChild(downloadBtn);

            // 复制链接按钮
            const copyBtn = document.createElement("button");
            copyBtn.textContent = "复制链接";
            copyBtn.onclick = () => navigator.clipboard.writeText(`https://openst.weizhihan3.workers.dev/dl/${file.path}`);
            btnContainer.appendChild(copyBtn);

            if(file.schematio){
                const jumpBtn = document.createElement("a");
                jumpBtn.textContent = "3D预览";
                jumpBtn.href = file.schematio;
                jumpBtn.target = "_blank";
                btnContainer.appendChild(jumpBtn);
            }

            item.appendChild(btnContainer);
            container.appendChild(item);
        });
    }

    // 搜索功能
    searchInput.addEventListener("input", e => {
        const keyword = e.target.value.trim();
        container.innerHTML = ""; // **清空之前的卡片**
        if(keyword === "") renderFiles(files);
        else filterFiles(keyword);
    });

    renderFiles(files);
}

// 弹窗显示图片
function showModal(src){
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.style.cssText = `
        position:fixed; top:0; left:0; width:100%; height:100%;
        background: rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center;
    `;
    const img = document.createElement("img");
    img.src = src; // ⚡ 这里不要再 encode
    img.style.maxWidth = "90%";
    img.style.maxHeight = "90%";
    modal.appendChild(img);
    modal.addEventListener("click", ()=> modal.remove());
    document.body.appendChild(modal);
}

loadFiles();



