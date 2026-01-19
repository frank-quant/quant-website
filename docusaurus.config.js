// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Frank Quant',
  tagline: '记录我的加密货币量化研究、实盘交易复盘与大模型赋能经验',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Google Analytics
  plugins: [
    [
      '@docusaurus/plugin-google-analytics',
      {
        trackingID: 'G-XXXXXXXXXX', // 替换为您的Google Analytics ID
        anonymizeIP: true,
      },
    ],
  ],

  // Set the production url of your site here
  url: 'https://frank-quant.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'frank-quant', // Usually your GitHub org/user name.
  projectName: 'quant-website', // Usually your repo name.
  deploymentBranch: 'gh-pages',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  



  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/frank-quant/frank-quant/tree/main/',
        },
        blog: {
          showReadingTime: true,
          blogSidebarTitle: '全部博客文章',
          blogSidebarCount: 'ALL',
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/frank-quant/frank-quant/tree/main/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'Frank Quant',
        logo: {
          alt: 'Frank Quant Logo',
          src: 'img/logo.png',
        },
        items: [
          { type: 'docSidebar', sidebarId: 'basicsSidebar', position: 'left', label: '基本概念' },
          { type: 'docSidebar', sidebarId: 'tutorialSidebar', position: 'left', label: '入门教程' },
          { type: 'docSidebar', sidebarId: 'strategySidebar', position: 'left', label: '策略分享' },
          { type: 'docSidebar', sidebarId: 'toolsSidebar', position: 'left', label: '实用工具' },
          { type: 'docSidebar', sidebarId: 'booksSidebar', position: 'left', label: '量化图书馆' },
          { type: 'docSidebar', sidebarId: 'liveTradingSidebar', position: 'left', label: '实盘记录' },
          { type: 'docSidebar', sidebarId: 'aiSidebar', position: 'left', label: 'AI相关' },
          { to: '/blog', label: '博客', position: 'left' },
          { type: 'docSidebar', sidebarId: 'aboutSidebar', position: 'left', label: '关于' },
          { href: 'https://github.com/frank-quant', label: 'GitHub', position: 'right' },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: '内容导航',
            items: [
              { label: 'AI相关', to: '/docs/ai/intro' },
              { label: '基本概念', to: '/docs/basics/intro' },
              { label: '入门教程', to: '/docs/tutorial/intro' },
              { label: '策略分享', to: '/docs/strategy/intro' },
              { label: '实用工具', to: '/docs/tools/intro' },
              { label: '量化图书馆', to: '/docs/books/intro' },
              { label: '实盘记录', to: '/docs/live-trading/intro' },
              { label: '博客', to: '/blog' },
              { label: '关于', to: '/docs/about/intro' },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Frank Quant. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
