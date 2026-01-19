import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">Crypto × Quant × AI</h1>
        <p className="hero__subtitle">记录我的加密货币量化研究、实盘交易复盘与大模型赋能经验</p>
        <div className={styles.buttons}>
          <Link className="button button--secondary button--lg" to="/docs/basics/intro">
            基本概念
          </Link>
          <Link className="button button--outline button--lg" to="/docs/tutorial/intro" style={{marginLeft: '10px'}}>
            入门教程
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  return (
    <Layout
      title="Frank Quant - 加密货币量化策略与实盘记录"
      description="Freqtrade 策略 · 回测复现实战 · 开源工具与教学">
      <HomepageHeader />
      <main>
        {/* 导航区块 */}
        <section className="container margin-vert--xl">
          <div className="row">
            <div className="col col--3">
              <div className="card">
                <div className="card__header"><h3>基本概念</h3></div>
                <div className="card__body">
                  <p>量化交易的核心理论与基础知识</p>
                  <Link to="/docs/basics/intro" className="button button--primary">进入</Link>
                </div>
              </div>
            </div>
            <div className="col col--3">
              <div className="card">
                <div className="card__header"><h3>入门教程</h3></div>
                <div className="card__body">
                  <p>系统化学习量化交易的第一步</p>
                  <Link to="/docs/tutorial/intro" className="button button--primary">进入</Link>
                </div>
              </div>
            </div>
            <div className="col col--3">
              <div className="card">
                <div className="card__header"><h3>策略分享</h3></div>
                <div className="card__body">
                  <p>实用量化策略案例与思路解析</p>
                  <Link to="/docs/strategy/intro" className="button button--primary">进入</Link>
                </div>
              </div>
            </div>
            <div className="col col--3">
              <div className="card">
                <div className="card__header"><h3>实用工具</h3></div>
                <div className="card__body">
                  <p>量化开发常用工具与平台指南</p>
                  <Link to="/docs/tools/intro" className="button button--primary">进入</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="row margin-top--lg">
            <div className="col col--3">
              <div className="card">
                <div className="card__header"><h3>量化图书馆</h3></div>
                <div className="card__body">
                  <p>精选量化书籍与读书笔记</p>
                  <Link to="/docs/books/intro" className="button button--primary">进入</Link>
                </div>
              </div>
            </div>
            <div className="col col--3">
              <div className="card">
                <div className="card__header"><h3>实盘记录</h3></div>
                <div className="card__body">
                  <p>真实交易日志与绩效分析</p>
                  <Link to="/docs/live-trading/intro" className="button button--primary">进入</Link>
                </div>
              </div>
            </div>
            <div className="col col--3">
              <div className="card">
                <div className="card__header"><h3>AI相关</h3></div>
                <div className="card__body">
                  <p>AI工具、自动化工作流与大模型应用</p>
                  <Link to="/docs/ai/intro" className="button button--primary">进入</Link>
                </div>
              </div>
            </div>
            <div className="col col--3">
              <div className="card">
                <div className="card__header"><h3>博客</h3></div>
                <div className="card__body">
                  <p>行业观点、经验分享与心路历程</p>
                  <Link to="/blog" className="button button--primary">进入</Link>
                </div>
              </div>
            </div>
            <div className="col col--3">
              <div className="card">
                <div className="card__header"><h3>关于</h3></div>
                <div className="card__body">
                  <p>Frank Quant 项目介绍与联系方式</p>
                  <Link to="/docs/about/intro" className="button button--primary">进入</Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
