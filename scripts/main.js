import { showModal, renderPage, applyResponsiveGrid } from "./config.js";

const FILE_LIST_URL = "data/index.json";
const TAGS = [
    '大宗','空盒仓库','MIS多物品分类','MBS多种类潜影盒分类',
    '细雪展示','SIS无实体输入','编码相关','远程大宗','不可堆叠分类',
    '打包机','混杂打包','自适应打包机','地狱门加载器','分盒器',
    '盒子分类','盒子合并','红石合成站','解码器','潜影盒展示',
    '四边形大宗','整流器','仓库成品','全物品单片'
];

async function loadFiles() {
    const container = document.getElementById("file-list");
    const tagContainer = document.getElementById("tag-list");
    const searchInput = document.getElementById("search-input");
    const prevBtn = document.getElementById("prev-page");
    const nextBtn = document.getElementById("next-page");
    const pageInput = document.getElementById("page-input");
    const pageInfo = document.getElementById("page-info");
    const clearBtn = document.getElementById("clear-btn");

    // 读取 index.json
    const indexRes = await fetch(FILE_LIST_URL);
    const batches = await indexRes.json();

    let allFiles = [];
    for (const batch of batches) {
        const res = await fetch(new URL(batch.url, window.location.href));
        const files = await res.json();
        allFiles.push(...files);
    }

    // 过滤 png
    let visibleFiles = allFiles.filter(f => !f.name.endsWith(".png"));

    applyResponsiveGrid(container);

    // 渲染卡片
    function renderFiles(list) {
        container.innerHTML = "";
        list.forEach(file => {
            const item = document.createElement("div");
            item.className = "file-item";

            const nameEl = document.createElement("div");
            nameEl.className = "filename";
            nameEl.textContent = file.name;
            item.appendChild(nameEl);

            const img = document.createElement("img");
            img.src = file.preview;
            img.addEventListener("click", () => showModal(img.src));
            item.appendChild(img);

            const btnContainer = document.createElement("div");
            let useGhfast = false;

            const downloadBtn = document.createElement("button");
            downloadBtn.textContent = "下载";
            downloadBtn.onclick = () => window.open(useGhfast ? `https://ghfast.top/${file.rawUrl}` : file.rawUrl, "_blank");
            btnContainer.appendChild(downloadBtn);

            const copyBtn = document.createElement("button");
            copyBtn.textContent = "复制链接";
            copyBtn.onclick = () => navigator.clipboard.writeText(useGhfast ? `https://ghfast.top/${file.rawUrl}` : file.rawUrl);
            btnContainer.appendChild(copyBtn);

            const switchLabel = document.createElement("label");
            switchLabel.className = "switch";
            const ghfastToggle = document.createElement("input");
            ghfastToggle.type = "checkbox";
            const sliderSpan = document.createElement("span");
            sliderSpan.className = "slider round";
            switchLabel.appendChild(ghfastToggle);
            switchLabel.appendChild(sliderSpan);
            btnContainer.appendChild(switchLabel);

            const ghfastText = document.createElement("span");
            ghfastText.textContent = "使用GitHub raw原链接";
            ghfastToggle.addEventListener("change", () => {
                useGhfast = ghfastToggle.checked;
                ghfastText.textContent = useGhfast ? "启用GitHub Proxy加速" : "使用GitHub raw原链接";
            });
            btnContainer.appendChild(ghfastText);

            item.appendChild(btnContainer);
            container.appendChild(item);
        });
    }

    // 分页
    const pageController = renderPage(visibleFiles, renderFiles, container, 6);

    // 更新 sidebar 页码
    function updateSidebar(curr, total) {
        pageInput.value = curr;
        pageInfo.textContent = `/ ${total}`;
    }
    pageController.setPageChangeCallback(updateSidebar);

    // 搜索
    searchInput.addEventListener("input", e => {
        pageController.filter(e.target.value.trim());
    });

    // 标签
    TAGS.forEach(tag => {
        const btn = document.createElement("button");
        btn.textContent = tag;
        btn.addEventListener("click", () => {
            pageController.filter(tag);
        });
        tagContainer.appendChild(btn);
    });

    // 清除筛选
    clearBtn.addEventListener("click", () => pageController.filter(""));

    // 左右跳页
    prevBtn.addEventListener("click", () => pageController.show(Math.max(1, pageController.currentPage - 1)));
    nextBtn.addEventListener("click", () => pageController.show(Math.min(pageController.totalPages, pageController.currentPage + 1)));

    // 输入跳页
    pageInput.addEventListener("change", () => {
        let val = parseInt(pageInput.value);
        if (isNaN(val) || val < 1) val = 1;
        if (val > pageController.totalPages) val = pageController.totalPages;
        pageController.show(val);
    });
}

loadFiles();
