import React, { useState, useEffect } from 'react';
import styles from './VisitStats.module.css';

const VisitStats = () => {
  const [stats, setStats] = useState({
    totalVisits: 0,
    todayVisits: 0,
    lastVisit: null
  });

  useEffect(() => {
    // 从localStorage获取访问统计
    const getVisitStats = () => {
      const storedStats = localStorage.getItem('visitStats');
      const today = new Date().toDateString();
      
      if (storedStats) {
        const parsedStats = JSON.parse(storedStats);
        
        // 检查是否是今天第一次访问
        if (parsedStats.lastVisit === today) {
          // 今天已经访问过，增加今日访问次数
          parsedStats.todayVisits += 1;
        } else {
          // 今天第一次访问
          parsedStats.todayVisits = 1;
          parsedStats.lastVisit = today;
        }
        
        // 增加总访问次数
        parsedStats.totalVisits += 1;
        
        // 保存更新后的统计
        localStorage.setItem('visitStats', JSON.stringify(parsedStats));
        setStats(parsedStats);
      } else {
        // 第一次访问
        const newStats = {
          totalVisits: 1,
          todayVisits: 1,
          lastVisit: today
        };
        localStorage.setItem('visitStats', JSON.stringify(newStats));
        setStats(newStats);
      }
    };

    getVisitStats();
  }, []);

  return (
    <div className={styles.visitStats}>
      <div className={styles.statItem}>
        <div className={styles.statIcon}>📊</div>
        <div className={styles.statContent}>
          <div className={styles.statNumber}>{stats.totalVisits}</div>
          <div className={styles.statLabel}>历史访问</div>
        </div>
      </div>
      <div className={styles.statItem}>
        <div className={styles.statIcon}>📅</div>
        <div className={styles.statContent}>
          <div className={styles.statNumber}>{stats.todayVisits}</div>
          <div className={styles.statLabel}>今日访问</div>
        </div>
      </div>
    </div>
  );
};

export default VisitStats;
