#!/bin/bash
# 优化的 Docusaurus 部署脚本（Linux/Mac 版本）
# 保留 .git 目录，避免重复初始化，提升部署速度

set -e

echo "开始构建网站..."
npm run build

echo "进入 build 目录..."
cd build

# 检查是否已有 .git 目录
if [ -d .git ]; then
    echo "检测到现有 .git 目录，保留并更新..."
    
    # 确保在 gh-pages 分支
    git checkout gh-pages 2>/dev/null || git checkout -b gh-pages
    
    # 添加所有更改
    git add .
    
    # 检查是否有更改
    if [ -n "$(git status --porcelain)" ]; then
        git commit -m "Deploy website - $(date '+%Y-%m-%d %H:%M:%S')"
    else
        echo "没有更改，跳过提交"
    fi
else
    echo "初始化新的 git 仓库..."
    git init
    git checkout -b gh-pages
    git add .
    git commit -m "Deploy website - $(date '+%Y-%m-%d %H:%M:%S')"
fi

# 设置远程仓库（如果不存在）
if ! git remote get-url origin &>/dev/null; then
    echo "添加远程仓库..."
    git remote add origin https://github.com/frank-quant/quant-website.git
else
    echo "远程仓库已存在: $(git remote get-url origin)"
fi

echo "推送到 GitHub Pages..."
git push -f origin gh-pages

echo "部署成功！"
cd ..

