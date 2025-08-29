async function loadFiles() {
    const res = await fetch("https://<worker-domain>/list");
    const files = await res.json();

    const tags = [...new Set(files.map(f=>f.tag))];
    const tagsContainer = document.getElementById("tags");
    tagsContainer.innerHTML = "";
    tags.forEach(tag=>{
        const btn = document.createElement("button");
        btn.textContent = tag;
        btn.onclick = ()=>renderFiles(files.filter(f=>f.tag===tag));
        tagsContainer.appendChild(btn);
    });

    renderFiles(files);

    document.getElementById("search").oninput = e=>{
        const keyword = e.target.value.toLowerCase();
        renderFiles(files.filter(f=>f.name.toLowerCase().includes(keyword)));
    };
}

function renderFiles(files) {
    const container = document.getElementById("file-grid");
    container.innerHTML = "";
    files.forEach(f=>{
        const card = document.createElement("div");
        card.className = "file-card";

        const title = document.createElement("div");
        title.className = "filename";
        title.textContent = f.name;
        card.appendChild(title);

        // 缩略图
        if(f.preview){
            const img = document.createElement("img");
            img.src = f.preview;
            card.appendChild(img);
        }

        // 下载按钮
        const downloadBtn = document.createElement("button");
        downloadBtn.textContent="下载";
        downloadBtn.onclick = ()=>window.open(f.download,"_blank");
        card.appendChild(downloadBtn);

        // 复制链接按钮
        const copyBtn = document.createElement("button");
        copyBtn.textContent="复制链接";
        copyBtn.onclick = ()=>navigator.clipboard.writeText(f.download);
        card.appendChild(copyBtn);

        // 3D 预览按钮
        if(f.schemat){
            const schematBtn = document.createElement("button");
            schematBtn.textContent = "3D 预览";
            schematBtn.onclick = ()=>window.open(f.schemat, "_blank");
            card.appendChild(schematBtn);
        }

        container.appendChild(card);
    });
}

loadFiles();
