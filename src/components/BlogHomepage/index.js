import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import useBaseUrl from '@docusaurus/useBaseUrl';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/basics/basics-overview">
            开始学习 - 5min ⏱️
          </Link>
        </div>
      </div>
    </header>
  );
}

function RecentBlogPosts() {
  const {siteConfig} = useDocusaurusContext();
  
  // 模拟最近的博客数据
  const recentPosts = [
    {
      title: 'GPT-5 一小时写的量化策略',
      description: '使用GPT-5在短短一小时内开发了一个完整的量化交易策略，展示了AI在量化交易中的强大潜力。',
      date: '2025-08-11',
      author: 'frank',
      tags: ['gpt5', '量化策略', '自动化'],
      url: '/blog/主题1/gpt5-quant-strategy',
      category: '主题1'
    },
    {
      title: '机器学习在量化交易中的应用',
      description: '机器学习技术正在 revolutionizing 量化交易领域，为传统策略带来了新的可能性。',
      date: '2025-01-15',
      author: 'frank',
      tags: ['机器学习', '量化交易', '深度学习'],
      url: '/blog/主题2/machine-learning-quant',
      category: '主题2'
    },
    {
      title: 'DeFi量化策略研究',
      description: '去中心化金融（DeFi）为量化交易带来了全新的机会和挑战。本文将深入探讨DeFi量化策略的设计和实施。',
      date: '2025-01-20',
      author: 'frank',
      tags: ['DeFi', '量化策略', '流动性挖矿'],
      url: '/blog/主题3/defi-quant-strategies',
      category: '主题3'
    },
    {
      title: 'Cursor开了会员用不了gpt5',
      description: '最近在使用Cursor时遇到了一个问题：虽然已经开通了会员，但是无法使用GPT-5功能。',
      date: '2025-08-11',
      author: 'frank',
      tags: ['cursor', 'gpt5', '会员'],
      url: '/blog/主题1/cursor-gpt5-issue',
      category: '主题1'
    },
    {
      title: '欢迎来到Frank Quant',
      description: '欢迎来到我的加密货币量化交易研究平台！这里将记录我的量化交易学习、研究和实盘交易经验。',
      date: '2024-12-01',
      author: 'frank',
      tags: ['欢迎', '介绍', '量化交易'],
      url: '/blog/主题1/welcome-2024',
      category: '主题1'
    }
  ];

  return (
    <section className={styles.recentPosts}>
      <div className="container">
        <div className="row">
          <div className="col col--12">
            <h2 className={styles.sectionTitle}>📝 最新博客</h2>
            <p className={styles.sectionDescription}>
              分享最新的量化交易研究、技术探索和实战经验
            </p>
          </div>
        </div>
        <div className="row">
          {recentPosts.map((post, idx) => (
            <div key={idx} className="col col--4 margin-bottom--lg">
              <div className={styles.blogCard}>
                <div className={styles.blogCardHeader}>
                  <span className={styles.category}>{post.category}</span>
                  <span className={styles.date}>{post.date}</span>
                </div>
                <div className={styles.blogCardContent}>
                  <h3 className={styles.blogTitle}>
                    <Link to={post.url}>{post.title}</Link>
                  </h3>
                  <p className={styles.blogDescription}>{post.description}</p>
                  <div className={styles.blogTags}>
                    {post.tags.map((tag, tagIdx) => (
                      <span key={tagIdx} className={styles.tag}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={styles.blogCardFooter}>
                  <span className={styles.author}>作者: {post.author}</span>
                  <Link to={post.url} className={styles.readMore}>
                    阅读更多 →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="row">
          <div className="col col--12 text--center">
            <Link className="button button--primary button--lg" to="/blog">
              查看所有博客
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="记录我的加密货币量化研究、实盘交易复盘与大模型赋能经验">
      <HomepageHeader />
      <main>
        <RecentBlogPosts />
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
