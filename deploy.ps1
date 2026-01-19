# 优化的 Docusaurus 部署脚本
# 保留 .git 目录，避免重复初始化，提升部署速度

Write-Host "开始构建网站..." -ForegroundColor Green
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "构建失败！" -ForegroundColor Red
    exit 1
}

Write-Host "进入 build 目录..." -ForegroundColor Green
cd build

# 检查是否已有 .git 目录
if (Test-Path .git) {
    Write-Host "检测到现有 .git 目录，保留并更新..." -ForegroundColor Yellow
    
    # 确保在 gh-pages 分支
    git checkout gh-pages 2>$null
    if ($LASTEXITCODE -ne 0) {
        git checkout -b gh-pages
    }
    
    # 添加所有更改
    git add .
    
    # 检查是否有更改
    $status = git status --porcelain
    if ($status) {
        git commit -m "Deploy website - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    } else {
        Write-Host "没有更改，跳过提交" -ForegroundColor Yellow
    }
} else {
    Write-Host "初始化新的 git 仓库..." -ForegroundColor Yellow
    git init
    git checkout -b gh-pages
    git add .
    git commit -m "Deploy website - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}

# 设置远程仓库（如果不存在）
$remote = git remote get-url origin 2>$null
if (-not $remote) {
    Write-Host "添加远程仓库..." -ForegroundColor Yellow
    git remote add origin https://github.com/frank-quant/quant-website.git
} else {
    Write-Host "远程仓库已存在: $remote" -ForegroundColor Yellow
}

Write-Host "推送到 GitHub Pages..." -ForegroundColor Green
git push -f origin gh-pages

if ($LASTEXITCODE -eq 0) {
    Write-Host "部署成功！" -ForegroundColor Green
} else {
    Write-Host "推送失败！" -ForegroundColor Red
    exit 1
}

cd ..
