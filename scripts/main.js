const FILE_LIST_URL = "data/index.json";
const TAGS = ['大宗','盒仓','MIS','MBS','细雪展示']; // 前端硬编码标签

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

            // 走本地 files 路径
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
            // 滑块部分
            const switchLabel = document.createElement("label");
            const ghfastToggle = document.createElement("input");
            const sliderSpan = document.createElement("span");
            switchLabel.className = "switch";
            ghfastToggle.type = "checkbox";
            ghfastToggle.id = `ghfast-${file.name}`;
            sliderSpan.className = "slider round";

            switchLabel.appendChild(ghfastToggle);
            switchLabel.appendChild(sliderSpan);

            // 文本 label
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
            // 获取下载链接
            function getDownloadUrl(file) {
                return useGhfast ? `https://ghfast.top/${file.rawUrl}` : file.rawUrl;
            }
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
    img.src = src; // 这里不要 encode
    img.style.maxWidth = "90%";
    img.style.maxHeight = "90%";
    modal.appendChild(img);
    modal.addEventListener("click", ()=> modal.remove());
    document.body.appendChild(modal);
}

loadFiles();
