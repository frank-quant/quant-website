import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';
import styles from './theme.module.css';

const ThemeData = {
  'quant-strategy': {
    id: 'quant-strategy',
    title: '📊 量化策略',
    description: '量化交易策略研究和开发',
    color: '#1890ff',
    icon: '📊',
    articles: [
      {
        title: 'GPT-5 一小时写的量化策略',
        description: '使用GPT-5在短短一小时内开发了一个完整的量化交易策略，展示了AI在量化交易中的强大潜力。',
        link: '/blog/gpt5-quant-strategy',
        date: '2025-08-11',
        tags: ['量化策略', 'LLM应用', 'GPT-5', '自动化']
      },
      {
        title: 'DeFi量化策略研究',
        description: '去中心化金融（DeFi）为量化交易带来了全新的机会和挑战。本文将深入探讨DeFi量化策略的设计和实施。',
        link: '/blog/defi-quant-strategies',
        date: '2025-01-20',
        tags: ['量化策略', 'DeFi', '流动性挖矿', '套利', '技术分享']
      }
    ]
  },
  'llm-application': {
    id: 'llm-application',
    title: '🤖 LLM应用',
    description: '大语言模型在量化交易中的应用',
    color: '#52c41a',
    icon: '🤖',
    articles: [
      {
        title: 'Cursor开了会员用不了gpt5',
        description: '最近在使用Cursor时遇到了一个问题：虽然已经开通了会员，但是无法使用GPT-5功能。',
        link: '/blog/cursor-gpt5-issue',
        date: '2025-08-11',
        tags: ['LLM应用', 'Cursor', 'GPT-5', '技术分享']
      }
    ]
  },
  'live-trading': {
    id: 'live-trading',
    title: '📈 实盘记录',
    description: '实盘交易记录和复盘分析',
    color: '#fa8c16',
    icon: '📈',
    articles: [
      {
        title: '比特币突破策略实盘复盘',
        description: '本次实盘交易基于比特币价格突破策略，在关键阻力位突破时进行做多操作。',
        link: '/blog/btc-breakout-strategy-review',
        date: '2025-08-15',
        tags: ['实盘记录', '量化策略', '比特币', '突破策略']
      }
    ]
  },
  'tech-sharing': {
    id: 'tech-sharing',
    title: '💻 技术分享',
    description: '技术分享和教程',
    color: '#722ed1',
    icon: '💻',
    articles: [
      {
        title: '机器学习在量化交易中的应用',
        description: '机器学习技术正在 revolutionizing 量化交易领域，为传统策略带来了新的可能性。',
        link: '/blog/machine-learning-quant',
        date: '2025-01-15',
        tags: ['技术分享', '机器学习', '量化策略', '深度学习']
      }
    ]
  },
  'market-analysis': {
    id: 'market-analysis',
    title: '📰 市场分析',
    description: '市场分析和观点',
    color: '#eb2f96',
    icon: '📰',
    articles: [
      {
        title: '欢迎来到Frank Quant',
        description: '欢迎来到我的加密货币量化交易研究平台！这里将记录我的量化交易学习、研究和实盘交易经验。',
        link: '/blog/welcome-2024',
        date: '2024-12-01',
        tags: ['市场分析', 'welcome', 'introduction', '量化交易']
      }
    ]
  }
};

function ArticleCard({article}) {
  return (
    <div className={styles.articleCard}>
      <div className={styles.articleMeta}>
        <span className={styles.articleDate}>{article.date}</span>
        <div className={styles.articleTags}>
          {article.tags.slice(0, 3).map((tag, idx) => (
            <span key={idx} className={styles.tag}>{tag}</span>
          ))}
        </div>
      </div>
      <h3 className={styles.articleTitle}>
        <Link to={article.link}>{article.title}</Link>
      </h3>
      <p className={styles.articleDescription}>{article.description}</p>
      <div className={styles.articleFooter}>
        <Link to={article.link} className={styles.readMore}>
          阅读全文 →
        </Link>
      </div>
    </div>
  );
}

export default function ThemePage() {
  const location = useLocation();
  // 从路径中提取 themeId，例如 /blog/theme/quant-strategy -> quant-strategy
  const themeId = location.pathname.split('/').pop();
  const theme = ThemeData[themeId];

  if (!theme) {
    return (
      <Layout title="主题不存在">
        <div className={styles.errorPage}>
          <h1>主题不存在</h1>
          <p>抱歉，您访问的主题不存在。</p>
          <Link to="/blog" className="button button--primary">
            返回博客首页
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title={theme.title}
      description={theme.description}>
      <main className={styles.themeMain}>
        <div className={styles.container}>
          <div className={styles.themeHeader}>
            <div className={styles.themeInfo}>
              <div className={styles.themeIcon} style={{backgroundColor: theme.color}}>
                {theme.icon}
              </div>
              <div>
                <h1>{theme.title}</h1>
                <p>{theme.description}</p>
                <span className={styles.articleCount}>
                  {theme.articles.length} 篇文章
                </span>
              </div>
            </div>
            <Link to="/blog" className={styles.backButton}>
              ← 返回博客首页
            </Link>
          </div>

          <section className={styles.articlesSection}>
            <div className={styles.articlesGrid}>
              {theme.articles.map((article, idx) => (
                <ArticleCard key={idx} article={article} />
              ))}
            </div>
          </section>

          <section className={styles.relatedThemes}>
            <h2>其他主题</h2>
            <div className={styles.themesList}>
              {Object.values(ThemeData)
                .filter(t => t.id !== themeId)
                .map((otherTheme, idx) => (
                  <Link 
                    key={idx} 
                    to={`/blog/theme/${otherTheme.id}`}
                    className={styles.themeLink}
                    style={{borderLeftColor: otherTheme.color}}
                  >
                    <span className={styles.themeLinkIcon}>{otherTheme.icon}</span>
                    <span className={styles.themeLinkTitle}>{otherTheme.title}</span>
                    <span className={styles.themeLinkCount}>{otherTheme.articles.length} 篇</span>
                  </Link>
                ))}
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}
