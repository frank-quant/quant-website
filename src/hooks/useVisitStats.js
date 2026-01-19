import { useState, useEffect } from 'react';
import { getVisitorLocation, getRegionDisplayName } from '@site/src/utils/getLocation';

export const useVisitStats = () => {
  const [stats, setStats] = useState({
    totalVisits: 0,
    todayVisits: 0,
    uniqueVisitors: 0,
    pageVisits: {},
    lastVisit: null,
    currentPage: '',
    visitHistory: [],
    regionStats: {} // 地区统计 { region: count }
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const updateVisitStats = () => {
      const currentPage = window.location.pathname;
      const today = new Date().toDateString();
      const now = new Date().toISOString();
      
      // 获取现有统计数据
      const visitStats = localStorage.getItem('visitStats');
      const advancedStats = localStorage.getItem('advancedVisitStats');
      
      let newStats = {
        totalVisits: 0,
        todayVisits: 0,
        uniqueVisitors: 0,
        pageVisits: {},
        lastVisit: null,
        currentPage: currentPage,
        visitHistory: [],
        regionStats: {}
      };
      
      // 合并基础统计数据
      if (visitStats) {
        const parsed = JSON.parse(visitStats);
        newStats.totalVisits = parsed.totalVisits || 0;
        newStats.todayVisits = parsed.todayVisits || 0;
        newStats.lastVisit = parsed.lastVisit || null;
      }
      
      // 合并高级统计数据
      if (advancedStats) {
        const parsed = JSON.parse(advancedStats);
        newStats.uniqueVisitors = parsed.uniqueVisitors || 0;
        newStats.pageVisits = parsed.pageVisits || {};
        newStats.visitHistory = parsed.visitHistory || [];
        newStats.regionStats = parsed.regionStats || {};
      }
      
      // 更新访问计数
      if (newStats.lastVisit === today) {
        newStats.todayVisits += 1;
      } else {
        newStats.todayVisits = 1;
        newStats.lastVisit = today;
      }
      
      newStats.totalVisits += 1;
      
      // 更新页面访问统计
      if (!newStats.pageVisits[currentPage]) {
        newStats.pageVisits[currentPage] = 0;
      }
      newStats.pageVisits[currentPage] += 1;
      
      // 添加访问历史记录
      newStats.visitHistory.push({
        page: currentPage,
        timestamp: now,
        date: today
      });
      
      // 限制历史记录数量
      if (newStats.visitHistory.length > 50) {
        newStats.visitHistory = newStats.visitHistory.slice(-50);
      }
      
      // 检查独立访客
      const visitorId = localStorage.getItem('visitorId');
      if (!visitorId) {
        const newVisitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('visitorId', newVisitorId);
        newStats.uniqueVisitors += 1;
      }
      
      // 保存更新后的统计（先保存基础数据）
      localStorage.setItem('visitStats', JSON.stringify({
        totalVisits: newStats.totalVisits,
        todayVisits: newStats.todayVisits,
        lastVisit: newStats.lastVisit
      }));
      
      localStorage.setItem('advancedVisitStats', JSON.stringify({
        uniqueVisitors: newStats.uniqueVisitors,
        pageVisits: newStats.pageVisits,
        visitHistory: newStats.visitHistory,
        currentPage: newStats.currentPage,
        regionStats: newStats.regionStats
      }));
      
      setStats(newStats);
      setIsLoading(false);
      
      // 异步获取地理位置（不阻塞主流程）
      getVisitorLocation()
        .then(location => {
          const regionName = getRegionDisplayName(location);
          
          // 更新地区统计
          const updatedStats = { ...newStats };
          if (!updatedStats.regionStats[regionName]) {
            updatedStats.regionStats[regionName] = 0;
          }
          updatedStats.regionStats[regionName] += 1;
          
          // 保存更新后的地区统计
          const currentAdvancedStats = localStorage.getItem('advancedVisitStats');
          if (currentAdvancedStats) {
            const parsed = JSON.parse(currentAdvancedStats);
            localStorage.setItem('advancedVisitStats', JSON.stringify({
              ...parsed,
              regionStats: updatedStats.regionStats
            }));
            
            // 更新状态
            setStats(updatedStats);
          }
        })
        .catch(error => {
          console.warn('Failed to get visitor location:', error);
        });
    };

    updateVisitStats();
  }, []);

  const resetStats = () => {
    localStorage.removeItem('visitStats');
    localStorage.removeItem('advancedVisitStats');
    localStorage.removeItem('visitorId');
    setStats({
      totalVisits: 0,
      todayVisits: 0,
      uniqueVisitors: 0,
      pageVisits: {},
      lastVisit: null,
      currentPage: window.location.pathname,
      visitHistory: [],
      regionStats: {}
    });
  };

  const exportStats = () => {
    const dataStr = JSON.stringify(stats, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `visit-stats-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getPopularPages = (limit = 5) => {
    return Object.entries(stats.pageVisits)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([path, visits]) => ({
        path,
        visits,
        name: getPageName(path)
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
      '/stats': '访问统计'
    };
    return pageNames[path] || path;
  };

  const getDailyStats = (days = 7) => {
    const dailyVisits = {};
    stats.visitHistory.forEach(visit => {
      const date = visit.date;
      dailyVisits[date] = (dailyVisits[date] || 0) + 1;
    });
    
    return Object.entries(dailyVisits)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .slice(-days)
      .map(([date, visits]) => ({
        date: new Date(date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
        visits
      }));
  };

  const getHourlyStats = () => {
    const hourlyVisits = {};
    stats.visitHistory.forEach(visit => {
      const hour = new Date(visit.timestamp).getHours();
      hourlyVisits[hour] = (hourlyVisits[hour] || 0) + 1;
    });
    
    return Array.from({length: 24}, (_, i) => ({
      hour: i,
      visits: hourlyVisits[i] || 0
    }));
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getTopRegions = (limit = 5) => {
    return Object.entries(stats.regionStats || {})
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([region, count]) => ({
        region,
        count
      }));
  };

  return {
    stats,
    isLoading,
    resetStats,
    exportStats,
    getPopularPages,
    getDailyStats,
    getHourlyStats,
    getPageName,
    formatNumber,
    getTopRegions
  };
};
