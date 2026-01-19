# 网站访问统计功能说明

## 功能概述

本网站集成了完整的访问统计功能，可以实时追踪和分析用户访问数据，包括：

- 📊 **历史访问次数**：网站总访问量
- 📅 **今日访问次数**：当天访问量统计
- 👥 **独立访客数**：基于localStorage的唯一访客统计
- 📍 **页面访问统计**：各页面的访问量排行
- 🕒 **访问历史记录**：详细的访问时间线
- 📈 **访问趋势分析**：每日和每小时访问分布

## 组件说明

### 1. AdvancedVisitStats 组件
**位置**：`src/components/AdvancedVisitStats.js`

**功能**：
- 显示完整的访问统计数据
- 支持展开/收起详细信息
- 包含热门页面排行
- 今日访问趋势图表
- 最近访问记录

**使用场景**：
- 首页展示
- 统计页面
- 管理后台

### 2. SimpleVisitStats 组件
**位置**：`src/components/SimpleVisitStats.js`

**功能**：
- 简洁的访问统计显示
- 支持展开显示更多信息
- 适合侧边栏或页脚使用

**使用场景**：
- 侧边栏小部件
- 页脚统计
- 紧凑空间展示

### 3. useVisitStats 钩子
**位置**：`src/hooks/useVisitStats.js`

**功能**：
- 统一的访问统计数据管理
- 提供各种统计数据的计算方法
- 支持数据导出和重置

**使用场景**：
- 自定义统计组件
- 数据分析和处理
- 第三方集成

## 数据存储

### localStorage 键值
- `visitStats`：基础访问统计
  ```json
  {
    "totalVisits": 1234,
    "todayVisits": 56,
    "lastVisit": "Mon Jan 01 2024"
  }
  ```

- `advancedVisitStats`：高级访问统计
  ```json
  {
    "uniqueVisitors": 89,
    "pageVisits": {
      "/": 100,
      "/blog": 50,
      "/docs": 30
    },
    "visitHistory": [
      {
        "page": "/",
        "timestamp": "2024-01-01T10:00:00.000Z",
        "date": "Mon Jan 01 2024"
      }
    ],
    "currentPage": "/"
  }
  ```

- `visitorId`：访客唯一标识
  ```
  "visitor_1704067200000_abc123def"
  ```

## 使用方法

### 1. 在页面中使用 AdvancedVisitStats

```jsx
import AdvancedVisitStats from '@site/src/components/AdvancedVisitStats';

function MyPage() {
  return (
    <div>
      <h1>我的页面</h1>
      <AdvancedVisitStats />
    </div>
  );
}
```

### 2. 在侧边栏中使用 SimpleVisitStats

```jsx
import SimpleVisitStats from '@site/src/components/SimpleVisitStats';

function Sidebar() {
  return (
    <aside>
      <SimpleVisitStats />
      {/* 其他侧边栏内容 */}
    </aside>
  );
}
```

### 3. 使用 useVisitStats 钩子

```jsx
import { useVisitStats } from '@site/src/hooks/useVisitStats';

function CustomStatsComponent() {
  const { 
    stats, 
    isLoading, 
    getPopularPages, 
    getDailyStats,
    formatNumber 
  } = useVisitStats();

  if (isLoading) return <div>加载中...</div>;

  return (
    <div>
      <h2>自定义统计</h2>
      <p>总访问：{formatNumber(stats.totalVisits)}</p>
      <p>今日访问：{formatNumber(stats.todayVisits)}</p>
      
      <h3>热门页面</h3>
      {getPopularPages(3).map(page => (
        <div key={page.path}>
          {page.name}: {page.visits} 次
        </div>
      ))}
    </div>
  );
}
```

## 统计页面

访问 `/stats` 路径可以查看完整的统计管理页面，包括：

- 📈 **概览**：核心数据展示和趋势图表
- 📄 **页面分析**：各页面访问排行
- 📊 **趋势分析**：每日和每小时访问分布
- 🕒 **访问历史**：详细的访问记录
- 📋 **原始数据**：JSON格式的完整数据

## 功能特性

### 1. 实时更新
- 页面访问时自动更新统计数据
- 支持实时数据刷新

### 2. 数据持久化
- 使用localStorage存储，数据持久保存
- 支持数据导出为JSON文件

### 3. 响应式设计
- 适配桌面和移动设备
- 优雅的动画效果

### 4. 隐私保护
- 仅收集访问统计，不收集个人信息
- 数据存储在用户本地浏览器

### 5. 性能优化
- 限制历史记录数量（最多50条）
- 智能的数据更新机制

## 自定义配置

### 修改统计逻辑
在 `useVisitStats.js` 中可以自定义：
- 历史记录数量限制
- 访客识别方式
- 数据更新频率

### 样式定制
各组件都提供了CSS模块文件：
- `AdvancedVisitStats.module.css`
- `SimpleVisitStats.module.css`
- `stats.module.css`

### 页面名称映射
在 `getPageName` 函数中可以添加新的页面名称映射：

```javascript
const pageNames = {
  '/': '首页',
  '/blog': '博客',
  '/new-page': '新页面', // 添加新页面
  // ...
};
```

## 注意事项

1. **数据准确性**：基于localStorage的统计，清除浏览器数据会重置统计
2. **跨设备统计**：每个设备独立统计，不支持跨设备合并
3. **隐私考虑**：仅统计访问行为，不涉及用户隐私
4. **性能影响**：统计功能对网站性能影响极小

## 未来扩展

- [ ] 支持服务端数据存储
- [ ] 添加更多图表类型
- [ ] 支持数据筛选和搜索
- [ ] 集成第三方统计服务
- [ ] 添加访问路径分析
- [ ] 支持实时访客在线统计
