import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './blog.module.css';

const BlogThemes = [
  {
    id: 'quant-strategy',
    title: '📊 量化策略',
    description: '量化交易策略研究和开发',
    color: '#1890ff',
    icon: '📊',
    articleCount: 2,
    articles: [
      {
        title: 'GPT-5 一小时写的量化策略',
        description: '使用GPT-5在短短一小时内开发了一个完整的量化交易策略，展示了AI在量化交易中的强大潜力。',
        link: '/blog/gpt5-quant-strategy',
        date: '2025-08-11'
      },
      {
        title: 'DeFi量化策略研究',
        description: '去中心化金融（DeFi）为量化交易带来了全新的机会和挑战。本文将深入探讨DeFi量化策略的设计和实施。',
        link: '/blog/defi-quant-strategies',
        date: '2025-01-20'
      }
    ]
  },
  {
    id: 'llm-application',
    title: '🤖 LLM应用',
    description: '大语言模型在量化交易中的应用',
    color: '#52c41a',
    icon: '🤖',
    articleCount: 1,
    articles: [
      {
        title: 'Cursor开了会员用不了gpt5',
        description: '最近在使用Cursor时遇到了一个问题：虽然已经开通了会员，但是无法使用GPT-5功能。',
        link: '/blog/cursor-gpt5-issue',
        date: '2025-08-11'
      }
    ]
  },
  {
    id: 'live-trading',
    title: '📈 实盘记录',
    description: '实盘交易记录和复盘分析',
    color: '#fa8c16',
    icon: '📈',
    articleCount: 1,
    articles: [
      {
        title: '比特币突破策略实盘复盘',
        description: '本次实盘交易基于比特币价格突破策略，在关键阻力位突破时进行做多操作。',
        link: '/blog/btc-breakout-strategy-review',
        date: '2025-08-15'
      }
    ]
  },
  {
    id: 'tech-sharing',
    title: '💻 技术分享',
    description: '技术分享和教程',
    color: '#722ed1',
    icon: '💻',
    articleCount: 1,
    articles: [
      {
        title: '机器学习在量化交易中的应用',
        description: '机器学习技术正在 revolutionizing 量化交易领域，为传统策略带来了新的可能性。',
        link: '/blog/machine-learning-quant',
        date: '2025-01-15'
      }
    ]
  },
  {
    id: 'market-analysis',
    title: '📰 市场分析',
    description: '市场分析和观点',
    color: '#eb2f96',
    icon: '📰',
    articleCount: 1,
    articles: [
      {
        title: '欢迎来到Frank Quant',
        description: '欢迎来到我的加密货币量化交易研究平台！这里将记录我的量化交易学习、研究和实盘交易经验。',
        link: '/blog/welcome-2024',
        date: '2024-12-01'
      }
    ]
  }
];

function ThemeCard({theme}) {
  return (
    <Link to={`/blog/theme/${theme.id}`} className={styles.themeCard}>
      <div className={styles.themeHeader}>
        <div className={styles.themeIcon} style={{backgroundColor: theme.color}}>
          {theme.icon}
        </div>
        <div className={styles.themeInfo}>
          <h3>{theme.title}</h3>
          <p>{theme.description}</p>
        </div>
        <div className={styles.articleCount}>
          {theme.articleCount} 篇文章
        </div>
      </div>
      <div className={styles.themePreview}>
        <h4>最新文章</h4>
        <div className={styles.previewArticle}>
          <span className={styles.articleTitle}>{theme.articles[0].title}</span>
          <span className={styles.articleDate}>{theme.articles[0].date}</span>
        </div>
      </div>
    </Link>
  );
}

export default function Blog() {
  const {siteConfig} = useDocusaurusContext();
  
  return (
    <Layout
      title="博客"
      description="Frank Quant的量化交易博客，分享策略研究、技术心得和实盘经验">
      <main className={styles.blogMain}>
        <div className={styles.container}>
          <div className={styles.hero}>
            <h1>📝 Frank Quant 博客</h1>
            <p>分享量化交易策略研究、技术心得和实盘经验</p>
          </div>

          <section className={styles.themesSection}>
            <h2>📂 按主题浏览</h2>
            <div className={styles.themesGrid}>
              {BlogThemes.map((theme, idx) => (
                <ThemeCard key={idx} theme={theme} />
              ))}
            </div>
          </section>

          <section className={styles.statsSection}>
            <h2>📊 博客统计</h2>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>5</div>
                <div className={styles.statLabel}>主题分类</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>6</div>
                <div className={styles.statLabel}>文章总数</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>2</div>
                <div className={styles.statLabel}>量化策略</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>1</div>
                <div className={styles.statLabel}>实盘记录</div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}
