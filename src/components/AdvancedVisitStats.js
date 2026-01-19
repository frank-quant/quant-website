import React, { useState, useEffect } from 'react';
import styles from './AdvancedVisitStats.module.css';

const AdvancedVisitStats = () => {
  const [stats, setStats] = useState({
    totalVisits: 0,
    todayVisits: 0,
    pageVisits: {},
    lastVisit: null,
    currentPage: '',
    visitHistory: [],
    uniqueVisitors: 0
  });

  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // 确保在客户端环境中运行
    if (typeof window === 'undefined') {
      return;
    }

    // 获取当前页面路径
    const currentPage = window.location.pathname;
    
    // 从localStorage获取访问统计
    const getVisitStats = () => {
      try {
        const storedStats = localStorage.getItem('advancedVisitStats');
        const today = new Date().toDateString();
        const now = new Date().toISOString();
        
        if (storedStats) {
          const parsedStats = JSON.parse(storedStats);
          
          // 检查是否是今天第一次访问
          if (parsedStats.lastVisit === today) {
            parsedStats.todayVisits += 1;
          } else {
            parsedStats.todayVisits = 1;
            parsedStats.lastVisit = today;
          }
          
          // 增加总访问次数
          parsedStats.totalVisits += 1;
          
          // 更新页面访问统计
          if (!parsedStats.pageVisits[currentPage]) {
            parsedStats.pageVisits[currentPage] = 0;
          }
          parsedStats.pageVisits[currentPage] += 1;
          
          // 更新当前页面
          parsedStats.currentPage = currentPage;
          
          // 添加访问历史记录
          if (!parsedStats.visitHistory) {
            parsedStats.visitHistory = [];
          }
          parsedStats.visitHistory.push({
            page: currentPage,
            timestamp: now,
            date: today
          });
          
          // 限制历史记录数量
          if (parsedStats.visitHistory.length > 50) {
            parsedStats.visitHistory = parsedStats.visitHistory.slice(-50);
          }
          
          // 计算独立访客数（基于localStorage）
          const visitorId = localStorage.getItem('visitorId');
          if (!visitorId) {
            const newVisitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('visitorId', newVisitorId);
            parsedStats.uniqueVisitors = (parsedStats.uniqueVisitors || 0) + 1;
          }
          
          // 保存更新后的统计
          localStorage.setItem('advancedVisitStats', JSON.stringify(parsedStats));
          setStats(parsedStats);
        } else {
          // 第一次访问
          const visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          localStorage.setItem('visitorId', visitorId);
          
          const newStats = {
            totalVisits: 1,
            todayVisits: 1,
            pageVisits: { [currentPage]: 1 },
            lastVisit: today,
            currentPage: currentPage,
            visitHistory: [{
              page: currentPage,
              timestamp: now,
              date: today
            }],
            uniqueVisitors: 1
          };
          localStorage.setItem('advancedVisitStats', JSON.stringify(newStats));
          setStats(newStats);
        }
      } catch (error) {
        console.warn('Failed to get visit stats:', error);
      }
    };

    getVisitStats();
  }, []);

  // 获取页面名称
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
      '/stats': '访问统计'
    };
    return pageNames[path] || path;
  };

  // 获取最受欢迎的页面
  const getPopularPages = () => {
    return Object.entries(stats.pageVisits)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([path, visits]) => ({
        name: getPageName(path),
        path: path,
        visits: visits
      }));
  };

  // 获取今日访问趋势
  const getTodayTrend = () => {
    if (!stats.visitHistory) return [];
    
    const today = new Date().toDateString();
    const todayVisits = stats.visitHistory.filter(visit => visit.date === today);
    
    // 按小时分组
    const hourlyVisits = {};
    todayVisits.forEach(visit => {
      const hour = new Date(visit.timestamp).getHours();
      hourlyVisits[hour] = (hourlyVisits[hour] || 0) + 1;
    });
    
    return Array.from({length: 24}, (_, i) => ({
      hour: i,
      visits: hourlyVisits[i] || 0
    }));
  };

  // 格式化时间
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.advancedStats}>
      <div className={styles.mainStats}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📊</div>
          <div className={styles.statInfo}>
            <div className={styles.statNumber}>{stats.totalVisits}</div>
            <div className={styles.statLabel}>历史访问</div>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📅</div>
          <div className={styles.statInfo}>
            <div className={styles.statNumber}>{stats.todayVisits}</div>
            <div className={styles.statLabel}>今日访问</div>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>👥</div>
          <div className={styles.statInfo}>
            <div className={styles.statNumber}>{stats.uniqueVisitors}</div>
            <div className={styles.statLabel}>独立访客</div>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📍</div>
          <div className={styles.statInfo}>
            <div className={styles.statNumber}>{Object.keys(stats.pageVisits).length}</div>
            <div className={styles.statLabel}>访问页面</div>
          </div>
        </div>
      </div>

      <div className={styles.popularPages}>
        <div className={styles.sectionHeader}>
          <h4>🔥 热门页面</h4>
          <button 
            className={styles.toggleButton}
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? '收起' : '详情'}
          </button>
        </div>
        <div className={styles.pageList}>
          {getPopularPages().map((page, index) => (
            <div key={index} className={styles.pageItem}>
              <div className={styles.pageRank}>#{index + 1}</div>
              <div className={styles.pageInfo}>
                <span className={styles.pageName}>{page.name}</span>
                {showDetails && (
                  <span className={styles.pagePath}>{page.path}</span>
                )}
              </div>
              <span className={styles.pageVisits}>{page.visits} 次</span>
            </div>
          ))}
        </div>
      </div>

      {showDetails && (
        <>
          <div className={styles.todayTrend}>
            <h4>📈 今日访问趋势</h4>
            <div className={styles.trendChart}>
              {getTodayTrend().map((data, index) => (
                <div key={index} className={styles.trendBar}>
                  <div 
                    className={styles.bar} 
                    style={{height: `${Math.max(data.visits * 20, 4)}px`}}
                  ></div>
                  <span className={styles.hourLabel}>{data.hour}:00</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.recentVisits}>
            <h4>🕒 最近访问</h4>
            <div className={styles.visitList}>
              {stats.visitHistory?.slice(-5).reverse().map((visit, index) => (
                <div key={index} className={styles.visitItem}>
                  <span className={styles.visitPage}>{getPageName(visit.page)}</span>
                  <span className={styles.visitTime}>{formatTime(visit.timestamp)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className={styles.currentPage}>
        <span className={styles.currentLabel}>当前页面：</span>
        <span className={styles.currentName}>{getPageName(stats.currentPage)}</span>
      </div>

      <div className={styles.actions}>
        <a href="/stats" className={styles.actionLink}>
          📊 查看详细统计
        </a>
      </div>
    </div>
  );
};

export default AdvancedVisitStats;
