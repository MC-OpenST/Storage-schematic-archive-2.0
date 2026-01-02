export function initLazyLoad(options = {}) {
    const container = options.container || document.getElementById('file-list');
    const threshold = options.threshold || 300; // 提前加载距离
    if (!container) return;

    const images = new Set();

    // IntersectionObserver 懒加载
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                obs.unobserve(img);
            }
        });
    }, { rootMargin: `${threshold}px` });

    // 注册新图片
    function observeImg(img) {
        if (img && img.dataset.src) {
            images.add(img);
            observer.observe(img);
        }
    }

    // 初始图片
    container.querySelectorAll('img[data-src]').forEach(observeImg);

    // 监听 DOM 新增
    const mutationObserver = new MutationObserver(mutations => {
        mutations.forEach(m => {
            m.addedNodes.forEach(node => {
                if (node.nodeType === 1) {
                    if (node.matches('.file-item')) {
                        node.querySelectorAll('img[data-src]').forEach(observeImg);
                    } else {
                        node.querySelectorAll('.file-item img[data-src]').forEach(observeImg);
                    }
                }
            });
        });
    });
    mutationObserver.observe(container, { childList: true, subtree: true });

    // 卸载不可见图片
    function unloadOffscreenImages() {
        const viewportTop = window.scrollY;
        const viewportBottom = viewportTop + window.innerHeight;

        images.forEach(img => {
            const item = img.closest('.file-item');
            if (!item) return;

            const rect = item.getBoundingClientRect();
            const itemTop = rect.top + window.scrollY;
            const itemBottom = itemTop + rect.height;

            if (itemBottom < viewportTop || itemTop > viewportBottom) {
                // 卸载图片，保留路径
                if (img.src) {
                    img.dataset.src = img.src;
                    img.src = "";
                    observer.observe(img); // 重新纳入懒加载
                }
            } else {
                // 回填可见图片
                if (!img.src && img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            }
        });
    }

    // 停止滚动后卸载
    let scrollTimer;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(unloadOffscreenImages, 150);
    });
}
