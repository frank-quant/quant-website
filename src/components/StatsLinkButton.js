import React, { useState, useEffect } from 'react';
import Link from '@docusaurus/Link';
import styles from './StatsLinkButton.module.css';

const StatsLinkButton = () => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // 获取页面滚动位置
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // 如果滚动到距离底部200px以内，显示按钮
      if (scrollTop + windowHeight >= documentHeight - 200) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // 初始检查
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!showButton) {
    return null;
  }

  return (
    <Link to="/stats" className={styles.statsButton}>
      📊 访问详情
    </Link>
  );
};

export default StatsLinkButton;

