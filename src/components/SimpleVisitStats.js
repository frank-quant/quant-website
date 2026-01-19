import React, { useState, useEffect } from 'react';
import styles from './SimpleVisitStats.module.css';

const SimpleVisitStats = () => {
  const [stats, setStats] = useState({
    totalVisits: 0,
    todayVisits: 0,
    uniqueVisitors: 0
  });

  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // 确保在客户端环境中运行
    if (typeof window === 'undefined') {
      return;
    }

    // 从localStorage获取访问统计
    const getVisitStats = () => {
      try {
        const visitStats = localStorage.getItem('visitStats');
        const advancedStats = localStorage.getItem('advancedVisitStats');
        
        let totalVisits = 0;
        let todayVisits = 0;
        let uniqueVisitors = 0;
        
        if (visitStats) {
          const parsed = JSON.parse(visitStats);
          totalVisits = parsed.totalVisits || 0;
          todayVisits = parsed.todayVisits || 0;
        }
        
        if (advancedStats) {
          const parsed = JSON.parse(advancedStats);
          uniqueVisitors = parsed.uniqueVisitors || 0;
        }
        
        setStats({
          totalVisits,
          todayVisits,
          uniqueVisitors
        });
      } catch (error) {
        console.warn('Failed to get visit stats:', error);
      }
    };

    getVisitStats();
    
    // 每30秒更新一次数据
    const interval = setInterval(getVisitStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className={styles.simpleStats}>
      <div className={styles.statsHeader}>
        <span className={styles.headerIcon}>📊</span>
        <span className={styles.headerTitle}>访问统计</span>
        <button 
          className={styles.expandButton}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>
      
      <div className={styles.statsContent}>
        <div className={styles.statItem}>
          <div className={styles.statIcon}>👥</div>
          <div className={styles.statInfo}>
            <div className={styles.statNumber}>{formatNumber(stats.totalVisits)}</div>
            <div className={styles.statLabel}>总访问</div>
          </div>
        </div>
        
        <div className={styles.statItem}>
          <div className={styles.statIcon}>📅</div>
          <div className={styles.statInfo}>
            <div className={styles.statNumber}>{formatNumber(stats.todayVisits)}</div>
            <div className={styles.statLabel}>今日</div>
          </div>
        </div>
        
        {isExpanded && (
          <div className={styles.statItem}>
            <div className={styles.statIcon}>👤</div>
            <div className={styles.statInfo}>
              <div className={styles.statNumber}>{formatNumber(stats.uniqueVisitors)}</div>
              <div className={styles.statLabel}>访客</div>
            </div>
          </div>
        )}
      </div>
      
      {isExpanded && (
        <div className={styles.statsFooter}>
          <a href="/stats" className={styles.detailLink}>
            查看详情 →
          </a>
        </div>
      )}
    </div>
  );
};

export default SimpleVisitStats;
