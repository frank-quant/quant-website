import React, { useState, useEffect } from 'react';
import { useVisitStats } from '@site/src/hooks/useVisitStats';
import { getVisitorLocation, getRegionDisplayName } from '@site/src/utils/getLocation';
import styles from './CompactVisitStats.module.css';

const CompactVisitStats = () => {
  const { stats, isLoading } = useVisitStats();
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // 确保在客户端环境中运行
    if (typeof window === 'undefined') {
      return;
    }

    // 在组件加载时更新地理位置（如果还没有的话）
    const updateLocationIfNeeded = async () => {
      try {
        const advancedStats = localStorage.getItem('advancedVisitStats');
        if (advancedStats) {
          const parsed = JSON.parse(advancedStats);
          // 如果地区统计为空或很少，尝试获取当前位置
          if (!parsed.regionStats || Object.keys(parsed.regionStats).length === 0) {
            const location = await getVisitorLocation();
            const regionName = getRegionDisplayName(location);
            
            // 更新地区统计
            const updatedRegionStats = { ...(parsed.regionStats || {}) };
            if (!updatedRegionStats[regionName]) {
              updatedRegionStats[regionName] = 0;
            }
            updatedRegionStats[regionName] += 1;
            
            // 保存更新后的统计
            localStorage.setItem('advancedVisitStats', JSON.stringify({
              ...parsed,
              regionStats: updatedRegionStats
            }));
          }
        }
      } catch (error) {
        console.warn('Failed to update location:', error);
      }
    };

    // 延迟执行，避免阻塞页面加载
    setTimeout(updateLocationIfNeeded, 1000);
  }, []);

  const getPopularPages = () => {
    return Object.entries(stats.pageVisits)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([path, visits]) => ({
        name: getPageName(path),
        visits: visits
      }));
  };

  const getTopRegions = () => {
    return Object.entries(stats.regionStats || {})
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([region, count]) => ({
        region,
        count
      }));
  };

  const getPageName = (path) => {
    const pageNames = {
      '/': '首页',
      '/blog': '博客',
      '/docs': '文档',
      '/about': '关于',
      '/quant-website/': '首页',
      '/quant-website/blog': '博客',
      '/quant-website/docs': '文档',
      '/quant-website/about': '关于',
      '/stats': '统计'
    };
    return pageNames[path] || path;
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  if (isLoading) {
    return (
      <div className={styles.compactStats}>
        <div className={styles.loading}>加载中...</div>
      </div>
    );
  }

  return (
    <div className={styles.compactStats}>
      {/* 主要统计数字 */}
      <div className={styles.mainStats}>
        <div className={styles.statItem}>
          <span className={styles.statIcon}>👥</span>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{formatNumber(stats.uniqueVisitors)}</div>
            <div className={styles.statLabel}>访问人数</div>
          </div>
        </div>
        
        <div className={styles.statItem}>
          <span className={styles.statIcon}>📊</span>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{formatNumber(stats.totalVisits)}</div>
            <div className={styles.statLabel}>访问人次</div>
          </div>
        </div>
        
        <div className={styles.statItem}>
          <span className={styles.statIcon}>📅</span>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{formatNumber(stats.todayVisits)}</div>
            <div className={styles.statLabel}>今日</div>
          </div>
        </div>
      </div>

      {/* 展开/收起按钮 */}
      <div className={styles.expandSection}>
        <button 
          className={styles.expandButton}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? '收起详情' : '查看详情'}
          <span className={styles.expandIcon}>
            {isExpanded ? '▲' : '▼'}
          </span>
        </button>
      </div>

      {/* 展开的详细信息 */}
      {isExpanded && (
        <div className={styles.expandedContent}>
          <div className={styles.topRegions}>
            <h4>🌍 Top5 访问地区</h4>
            <div className={styles.regionList}>
              {getTopRegions().length > 0 ? (
                getTopRegions().map((item, index) => (
                  <div key={index} className={styles.regionItem}>
                    <span className={styles.regionRank}>#{index + 1}</span>
                    <span className={styles.regionName}>{item.region}</span>
                    <span className={styles.regionCount}>{item.count}次</span>
                  </div>
                ))
              ) : (
                <div className={styles.noData}>暂无地区数据</div>
              )}
            </div>
          </div>
          <div className={styles.popularPages}>
            <h4>热门页面</h4>
            <div className={styles.pageList}>
              {getPopularPages().map((page, index) => (
                <div key={index} className={styles.pageItem}>
                  <span className={styles.pageName}>{page.name}</span>
                  <span className={styles.pageVisits}>{page.visits}次</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompactVisitStats;
