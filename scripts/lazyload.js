export function initLazyLoad(options = {}) {
    const container = options.container || document.getElementById('file-list');
    const threshold = options.threshold || 300; // 距离多少可视像素时加载

    if (!container) return;

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

    // 观察现有 img[data-src]
    container.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));

    // 监听未来可能插入的图片（MutationObserver）
    const mutationObserver = new MutationObserver(mutations => {
        mutations.forEach(m => {
            m.addedNodes.forEach(node => {
                if (node.nodeType === 1) { // 元素节点
                    node.querySelectorAll && node.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
                }
            });
        });
    });
    mutationObserver.observe(container, { childList: true, subtree: true });
}
