const FILE_LIST_URL = "data/index.json";
const TAGS = ['大宗','空盒仓库','MIS多物品分类','MBS多种类潜影盒分类','细雪展示','SIS无实体输入','编码相关','远程大宗','不可堆叠分类','打包机','混杂打包','自适应打包机','地狱门加载器','分盒器','盒子分类','盒子合并','红石合成站','解码器','潜影盒展示','四边形大宗','整流器','仓库成品','全物品单片']; // 前端

async function loadFiles() {
    const container = document.getElementById("file-list");
    const tagContainer = document.getElementById("tag-list");
    const searchInput = document.getElementById("search-input");

    // 1️⃣ 先 fetch 主 index.json（分批信息）
    const indexRes = await fetch(FILE_LIST_URL);
    const batches = await indexRes.json();

    // 2️⃣ fetch 每个批次 JSON 并合并到 allFiles
    let allFiles = [];
    for (const batch of batches) {
        const res = await fetch(batch.url);
        const files = await res.json();
        allFiles.push(...files);
    }

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
    clearBtn.addEventListener("click", () => renderFiles(allFiles));
    tagContainer.appendChild(clearBtn);

    function filterFiles(keyword) {
        container.innerHTML = "";
        const filtered = allFiles.filter(f => f.name.includes(keyword));
        renderFiles(filtered);
    }

    function renderFiles(list) {
        container.innerHTML = "";
        list.forEach(file => {
            if(file.name.endsWith(".png")) return;

            const item = document.createElement("div");
            item.className = "file-item";

            const nameEl = document.createElement("div");
            nameEl.className = "filename";
            nameEl.textContent = file.name;
            item.appendChild(nameEl);

            const imgUrl = file.preview;
            const img = document.createElement("img");
            img.src = imgUrl;
            img.width = 300;
            img.height = 200;
            img.addEventListener("click", () => showModal(img.src));
            item.appendChild(img);

            const btnContainer = document.createElement("div");

            // 下载按钮
            const downloadBtn = document.createElement("button");
            downloadBtn.textContent = "下载";
            downloadBtn.onclick = () => window.open(getDownloadUrl(file), "_blank");
            btnContainer.appendChild(downloadBtn);

            // 复制链接按钮
            const copyBtn = document.createElement("button");
            copyBtn.textContent = "复制链接";
            copyBtn.onclick = () => navigator.clipboard.writeText(getDownloadUrl(file));
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

            // ghfast切换按钮
            const switchLabel = document.createElement("label");
            const ghfastToggle = document.createElement("input");
            const sliderSpan = document.createElement("span");
            switchLabel.className = "switch";
            ghfastToggle.type = "checkbox";
            ghfastToggle.id = `ghfast-${file.name}`;
            sliderSpan.className = "slider round";

            switchLabel.appendChild(ghfastToggle);
            switchLabel.appendChild(sliderSpan);

            const ghfastText = document.createElement("span");
            let useGhfast = false;
            ghfastToggle.checked = false;
            ghfastText.textContent = ghfastToggle.checked ? "启用GitHub Proxy加速" : "使用GitHub raw原链接";

            ghfastToggle.addEventListener("change", () => {
                useGhfast = ghfastToggle.checked;
                ghfastText.textContent = useGhfast ? "启用GitHub Proxy加速" : "使用GitHub raw原链接";
            });

            btnContainer.appendChild(switchLabel);
            btnContainer.appendChild(ghfastText);

            function getDownloadUrl(file) {
                return useGhfast ? `https://ghfast.top/${file.rawUrl}` : file.rawUrl;
            }
        });
    }

    // 搜索功能
    searchInput.addEventListener("input", e => {
        const keyword = e.target.value.trim();
        container.innerHTML = "";
        if(keyword === "") renderFiles(allFiles);
        else filterFiles(keyword);
    });

    renderFiles(allFiles);
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
    img.src = src;
    img.style.maxWidth = "90%";
    img.style.maxHeight = "90%";
    modal.appendChild(img);
    modal.addEventListener("click", ()=> modal.remove());
    document.body.appendChild(modal);
}

loadFiles();
