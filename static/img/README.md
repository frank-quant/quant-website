# 图片资源说明

## 头像替换指南

当前使用的头像文件：`avatar.png`

### 如何替换为真实头像：

1. **准备头像图片**
   - 建议尺寸：120x120 像素或更大
   - 格式：JPG、PNG 或 SVG
   - 建议使用正方形图片

2. **替换步骤**
   - 将您的头像文件重命名为 `avatar.jpg` 或 `avatar.png`
   - 替换 `static/img/` 目录下的文件
   - 更新 `docs/about/intro.md` 中的图片路径

3. **更新代码**
   在 `docs/about/intro.md` 中找到这一行：
   ```html
   <img src="/img/avatar.png" alt="Frank Quant 创始人" ... />
   ```
   
   根据您的文件格式修改为：
   ```html
   <img src="/img/avatar.jpg" alt="Frank Quant 创始人" ... />
   ```
   或保持PNG格式：
   ```html
   <img src="/img/avatar.png" alt="Frank Quant 创始人" ... />
   ```

### 当前头像说明
- 使用 PNG 格式，确保在不同分辨率下都清晰显示
- 使用 Frank Quant 品牌色彩 (#25c2a0)
- 包含字母 "F" 作为占位符
- 尺寸：120x120 像素，圆形设计

## 头像生成器

如果还没有 `avatar.png` 文件，可以使用 `avatar-generator.html` 来生成：

1. 在浏览器中打开 `avatar-generator.html`
2. 右键点击显示的头像
3. 选择"另存为图片"
4. 保存为 `avatar.png`
5. 将文件放到 `static/img/` 目录下
