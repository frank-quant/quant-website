import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import styles from './stats.module.css';

const StatsPage = () => {
  const [stats, setStats] = useState({
    totalVisits: 0,
    todayVisits: 0,
    pageVisits: {},
    lastVisit: null,
    visitHistory: [],
    uniqueVisitors: 0,
    regionStats: {}
  });

  useEffect(() => {
    // 确保在客户端环境中运行
    if (typeof window === 'undefined') {
      return;
    }

    // 从localStorage获取所有统计数据
    const getAllStats = () => {
      try {
        const visitStats = localStorage.getItem('visitStats');
        const advancedStats = localStorage.getItem('advancedVisitStats');
        
        if (visitStats) {
          const parsed = JSON.parse(visitStats);
          setStats(prev => ({
            ...prev,
            totalVisits: parsed.totalVisits || 0,
            todayVisits: parsed.todayVisits || 0,
            lastVisit: parsed.lastVisit || null
          }));
        }
        
        if (advancedStats) {
          const parsed = JSON.parse(advancedStats);
          setStats(prev => ({
            ...prev,
            pageVisits: parsed.pageVisits || {},
            visitHistory: parsed.visitHistory || [],
            uniqueVisitors: parsed.uniqueVisitors || 0,
            regionStats: parsed.regionStats || {}
          }));
        }
      } catch (error) {
        console.warn('Failed to get stats:', error);
      }
    };

    getAllStats();
  }, []);


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

  const getPopularPages = () => {
    return Object.entries(stats.pageVisits)
      .sort(([,a], [,b]) => b - a)
      .map(([path, visits]) => ({
        name: getPageName(path),
        path: path,
        visits: visits
      }));
  };

  const getDailyStats = () => {
    if (!stats.visitHistory) return [];
    
    const dailyVisits = {};
    stats.visitHistory.forEach(visit => {
      const date = visit.date;
      dailyVisits[date] = (dailyVisits[date] || 0) + 1;
    });
    
    return Object.entries(dailyVisits)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .slice(-7)
      .map(([date, visits]) => ({
        date: new Date(date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
        visits: visits
      }));
  };

  const getHourlyStats = () => {
    if (!stats.visitHistory) return [];
    
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

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTopRegions = () => {
    return Object.entries(stats.regionStats || {})
      .sort(([,a], [,b]) => b - a)
      .map(([region, count]) => ({
        region,
        count,
        percentage: ((count / stats.totalVisits) * 100).toFixed(1)
      }));
  };

  return (
    <Layout
      title="访问统计"
      description="网站访问统计数据">
      <main className="container margin-vert--lg">
        <div className={styles.header}>
          <h1>📊 网站访问统计</h1>
          <p className={styles.subtitle}>实时数据仪表盘</p>
        </div>

        {/* 核心指标 */}
        <div className="row margin-bottom--lg">
          <div className="col col--3">
            <div className="card">
              <div className="card__body text--center">
                <div className={styles.statIcon}>📊</div>
                <div className={styles.statNumber}>{stats.totalVisits}</div>
                <div className={styles.statLabel}>历史总访问</div>
              </div>
            </div>
          </div>
          <div className="col col--3">
            <div className="card">
              <div className="card__body text--center">
                <div className={styles.statIcon}>📅</div>
                <div className={styles.statNumber}>{stats.todayVisits}</div>
                <div className={styles.statLabel}>今日访问</div>
              </div>
            </div>
          </div>
          <div className="col col--3">
            <div className="card">
              <div className="card__body text--center">
                <div className={styles.statIcon}>👥</div>
                <div className={styles.statNumber}>{stats.uniqueVisitors}</div>
                <div className={styles.statLabel}>独立访客</div>
              </div>
            </div>
          </div>
          <div className="col col--3">
            <div className="card">
              <div className="card__body text--center">
                <div className={styles.statIcon}>📍</div>
                <div className={styles.statNumber}>{Object.keys(stats.pageVisits).length}</div>
                <div className={styles.statLabel}>访问页面数</div>
              </div>
            </div>
          </div>
        </div>

        {/* 每日趋势 */}
        <div className="row margin-bottom--lg">
          <div className="col">
            <div className="card">
              <div className="card__header">
                <h3>📈 最近7天访问趋势</h3>
              </div>
              <div className="card__body">
                <div className={styles.dailyChart}>
                  {getDailyStats().map((day, index) => (
                    <div key={index} className={styles.dailyItem}>
                      <div className={styles.dailyDate}>{day.date}</div>
                      <div className={styles.dailyBarContainer}>
                        <div 
                          className={styles.dailyBar} 
                          style={{width: `${Math.max((day.visits / Math.max(...getDailyStats().map(d => d.visits))) * 100, 2)}%`}}
                        >
                          <span className={styles.dailyValue}>{day.visits}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 热门页面和地区分布 */}
        <div className="row margin-bottom--lg">
          <div className="col col--6">
            <div className="card">
              <div className="card__header">
                <h3>📄 热门页面 TOP 5</h3>
              </div>
              <div className="card__body">
                <div className={styles.pageList}>
                  {getPopularPages().slice(0, 5).map((page, index) => (
                    <div key={index} className={styles.pageItem}>
                      <span className={styles.pageRank}>#{index + 1}</span>
                      <span className={styles.pageName}>{page.name}</span>
                      <span className={styles.pageVisits}>{page.visits}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="col col--6">
            <div className="card">
              <div className="card__header">
                <h3>🌍 访客地区分布</h3>
              </div>
              <div className="card__body">
                {getTopRegions().length > 0 ? (
                  <div className={styles.regionsList}>
                    {getTopRegions().slice(0, 5).map((region, index) => (
                      <div key={index} className={styles.regionItem}>
                        <span className={styles.regionRank}>#{index + 1}</span>
                        <span className={styles.regionName}>{region.region}</span>
                        <span className={styles.regionCount}>{region.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyText}>暂无地区数据</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 最近访问 */}
        <div className="row">
          <div className="col">
            <div className="card">
              <div className="card__header">
                <h3>🕒 最近访问记录</h3>
              </div>
              <div className="card__body">
                <div className={styles.historyList}>
                  {stats.visitHistory?.slice(-10).reverse().map((visit, index) => (
                    <div key={index} className={styles.historyItem}>
                      <span className={styles.historyPage}>{getPageName(visit.page)}</span>
                      <span className={styles.historyTime}>{formatTime(visit.timestamp)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default StatsPage;
