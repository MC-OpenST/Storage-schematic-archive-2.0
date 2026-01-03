// config.js

// 弹窗
export function showModal(src) {
    const modal = document.createElement("div");
    modal.className = "modal";
    const img = document.createElement("img");
    img.src = src;
    modal.appendChild(img);

    const closeBtn = document.createElement("button");
    closeBtn.className = "close-btn";
    closeBtn.textContent = "✕";

    // 阻止背景滑动
    function preventTouchMove(e) { e.preventDefault(); }

    closeBtn.onclick = () => {
        modal.remove();
        document.body.style.overflow = "";
        document.body.removeEventListener("touchmove", preventTouchMove, { passive: false });
    };
    modal.appendChild(closeBtn);

    // 禁止页面滚动
    document.body.style.overflow = "hidden";
    document.body.addEventListener("touchmove", preventTouchMove, { passive: false });

    document.body.appendChild(modal);
}

// 分页渲染（不生成底部分页按钮）
export function renderPage(list, renderFiles, container, pageSize = 6) {
    let currentPage = 1;
    let currentList = list.slice(); // 当前显示列表
    let onPageChange = null;

    function totalPages() {
        return Math.max(1, Math.ceil(currentList.length / pageSize));
    }

    function showPage(page) {
        if (page < 1) page = 1;
        if (page > totalPages()) page = totalPages();
        currentPage = page;
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        renderFiles(currentList.slice(start, end), container);
        if (typeof onPageChange === "function") onPageChange(currentPage, totalPages());
    }

    showPage(1); // 初始化第一页

    return {
        show: showPage,
        filter(keyword) {
            currentList = keyword ? list.filter(f => f.name.includes(keyword)) : list.slice();
            showPage(1);
        },
        setPageChangeCallback(cb) { onPageChange = cb; },
        get currentPage() { return currentPage; },
        get totalPages() { return totalPages(); }
    };
}

// 响应式网格（仅初始化，不干预列数）
export function applyResponsiveGrid(container) {
    container.style.display = "grid";
    container.style.gridAutoRows = "1.5fr";
    container.style.boxSizing = "border-box";
}

const sidebar = document.querySelector(".sidebar");
const overlay = document.getElementById("sidebar-overlay");
const cardContainer = document.querySelector(".card-container");

// 创建浮动按钮
const toggleBtn = document.createElement("button");
toggleBtn.className = "sidebar-toggle";
toggleBtn.textContent = "☰"; // 菜单图标
document.body.appendChild(toggleBtn);

// 点击按钮：打开/关闭侧栏 + 显示模糊遮罩
toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open"); // 滑出
    overlay.classList.toggle("active"); // 背景模糊
});

// 点击遮罩关闭侧栏
overlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
});

// 点击卡片区关闭侧栏（同时隐藏遮罩）
cardContainer.addEventListener("click", () => {
    if (sidebar.classList.contains("open")) {
        sidebar.classList.remove("open");
        overlay.classList.remove("active");
    }
});

