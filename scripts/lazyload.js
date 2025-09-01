export function initLazyLoad(options = {}) {
    const container = options.container || document.getElementById('file-list');
    const threshold = options.threshold || 300; // 距离可视区多少像素时加载

    if (!container) return;

    const images = container.querySelectorAll('img[data-src]');

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                obs.unobserve(img);
            }
        });
    }, { rootMargin: `${threshold}px` });

    images.forEach(img => observer.observe(img));
}
