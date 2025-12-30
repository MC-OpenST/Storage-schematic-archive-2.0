import os
import shutil
import subprocess
import tkinter as tk
from tkinter import filedialog, messagebox
from urllib.parse import urlparse

# -------------------- 配置目录 --------------------
LITEMATIC_DIR = "files/litematic"
IMAGE_DIR = "files/images"

# -------------------- GUI --------------------
root = tk.Tk()
root.title("Litematic 批量上传工具（带自动解析 URL）")

litematic_files = []
image_files = []

# Tkinter 变量
token_var = tk.StringVar()
repo_url_var = tk.StringVar()
tag_var = tk.StringVar()

# 选择 Litematic 文件
def select_litematic():
    global litematic_files
    files = filedialog.askopenfilenames(filetypes=[("Litematic & ZIP files", "*.litematic *.zip")])
    if files:
        litematic_files = list(files)
        litematic_listbox.delete(0, tk.END)
        for f in litematic_files:
            litematic_listbox.insert(tk.END, os.path.basename(f))

# 选择图片文件
def select_images():
    global image_files
    files = filedialog.askopenfilenames(filetypes=[("PNG files", "*.png")])
    if files:
        image_files = list(files)
        image_listbox.delete(0, tk.END)
        for f in image_files:
            image_listbox.insert(tk.END, os.path.basename(f))

# 从网页链接解析仓库 HTTPS URL 和分支
def parse_github_url(url):
    """
    支持两种格式：
    1. https://github.com/user/repo.git
    2. https://github.com/user/repo/tree/main/...
    返回 (repo_https_url, branch_name)
    """
    url = url.strip()
    if "github.com" not in url:
        return None, None
    parts = urlparse(url)
    path_parts = parts.path.strip("/").split("/")
    if len(path_parts) < 2:
        return None, None
    user, repo = path_parts[0], path_parts[1]
    if repo.endswith(".git"):
        repo_name = repo
    else:
        repo_name = repo + ".git"

    # 分支
    branch = "main"
    if len(path_parts) >= 4 and path_parts[2] == "tree":
        branch = path_parts[3]

    repo_https = f"https://{user}@github.com/{user}/{repo_name}"
    return repo_https, branch

# 上传逻辑
def upload_files():
    if not litematic_files:
        messagebox.showerror("错误", "请先选择 Litematic 文件")
        return
    token = token_var.get().strip()
    repo_input_url = repo_url_var.get().strip()
    tag = tag_var.get().strip()
    if not token or not repo_input_url:
        messagebox.showerror("错误", "请填写 GitHub Token 和仓库 URL")
        return

    # 解析仓库 URL 和分支
    parsed_url, branch = parse_github_url(repo_input_url)
    if not parsed_url:
        messagebox.showerror("错误", "仓库 URL 解析失败")
        return
    # 拼接 token
    token_repo_url = parsed_url.replace(f"https://{parsed_url.split('@')[0].split('https://')[1]}", f"https://{token}")

    try:
        for idx, lfile in enumerate(litematic_files):
            original_name = os.path.splitext(os.path.basename(lfile))[0]
            tag_str = f"[{tag}]" if tag else ""
            new_name = f"{original_name}{tag_str}"

            # 重命名 / 复制 litematic
            new_lfile_path = os.path.join(LITEMATIC_DIR, new_name + ".litematic")
            os.makedirs(LITEMATIC_DIR, exist_ok=True)
            shutil.copy(lfile, new_lfile_path)

            # 对应图片（按顺序匹配，如果选了图片）
            if idx < len(image_files):
                img_file = image_files[idx]
                new_img_path = os.path.join(IMAGE_DIR, new_name + ".png")
                os.makedirs(IMAGE_DIR, exist_ok=True)
                shutil.copy(img_file, new_img_path)

        # git 操作
        subprocess.run(["git", "add", LITEMATIC_DIR, IMAGE_DIR], check=True)
        commit_msg = f"Add {len(litematic_files)} litematic files"
        subprocess.run(["git", "commit", "-m", commit_msg], check=True)
        subprocess.run(["git", "push", token_repo_url, f"HEAD:{branch}"], check=True)

        messagebox.showinfo("完成", f"成功上传 {len(litematic_files)} 个文件！")
    except subprocess.CalledProcessError as e:
        messagebox.showerror("Git 错误", str(e))

# -------------------- GUI 布局 --------------------
tk.Label(root, text="GitHub Token:").grid(row=0, column=0, sticky="w")
tk.Entry(root, textvariable=token_var, width=50, show="*").grid(row=0, column=1)

tk.Label(root, text="仓库 URL:").grid(row=1, column=0, sticky="w")
tk.Entry(root, textvariable=repo_url_var, width=50).grid(row=1, column=1)

tk.Label(root, text="标签:").grid(row=2, column=0, sticky="w")
tk.Entry(root, textvariable=tag_var, width=50).grid(row=2, column=1)

# Litematic 文件
tk.Label(root, text="选择 Litematic 文件:").grid(row=3, column=0, sticky="w")
tk.Button(root, text="选择文件", command=select_litematic).grid(row=3, column=1, sticky="w")
litematic_listbox = tk.Listbox(root, width=60, height=5)
litematic_listbox.grid(row=4, column=0, columnspan=2)

# 图片文件
tk.Label(root, text="选择图片文件 (可选):").grid(row=5, column=0, sticky="w")
tk.Button(root, text="选择文件", command=select_images).grid(row=5, column=1, sticky="w")
image_listbox = tk.Listbox(root, width=60, height=5)
image_listbox.grid(row=6, column=0, columnspan=2)

# 上传按钮
tk.Button(root, text="上传", command=upload_files, bg="lightgreen", width=20).grid(row=7, column=0, columnspan=2, pady=10)

root.mainloop()
