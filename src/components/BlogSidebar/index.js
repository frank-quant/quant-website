import React, {useState, useEffect} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';

function YearGroup({year, posts, isExpanded, onToggle}) {
  return (
    <div className={styles.yearGroup}>
      <button 
        className={styles.yearHeader}
        onClick={onToggle}
        aria-expanded={isExpanded}
      >
        <span className={styles.yearTitle}>{year}</span>
        <span className={styles.yearCount}>({posts.length})</span>
        <span className={clsx(styles.expandIcon, isExpanded && styles.expanded)}>
          ▼
        </span>
      </button>
      {isExpanded && (
        <div className={styles.yearPosts}>
          {posts.map(post => (
            <Link 
              key={post.metadata.permalink}
              to={post.metadata.permalink}
              className={styles.postLink}
            >
              <span className={styles.postTitle}>{post.metadata.title}</span>
              <span className={styles.postDate}>
                {new Date(post.metadata.date).toLocaleDateString('zh-CN', {
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function TagGroup({tags, isExpanded, onToggle}) {
  return (
    <div className={styles.tagGroup}>
      <button 
        className={styles.tagHeader}
        onClick={onToggle}
        aria-expanded={isExpanded}
      >
        <span className={styles.tagTitle}>标签</span>
        <span className={styles.tagCount}>({Object.keys(tags).length})</span>
        <span className={clsx(styles.expandIcon, isExpanded && styles.expanded)}>
          ▼
        </span>
      </button>
      {isExpanded && (
        <div className={styles.tagList}>
          {Object.entries(tags).map(([tagName, tagData]) => (
            <Link 
              key={tagName}
              to={tagData.permalink}
              className={styles.tagLink}
            >
              <span className={styles.tagName}>{tagData.label}</span>
              <span className={styles.tagCount}>({tagData.count})</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BlogSidebar() {
  const {siteConfig} = useDocusaurusContext();
  const [expandedYears, setExpandedYears] = useState(new Set());
  const [tagsExpanded, setTagsExpanded] = useState(true);
  const [yearGroups, setYearGroups] = useState({});
  const [tags, setTags] = useState({});

  useEffect(() => {
    // 模拟博客数据
    const mockPosts = [
      {
        metadata: {
          title: 'GPT-5 一小时写的量化策略',
          date: '2025-08-11',
          permalink: '/blog/GPT-5 一小时写的量化策略',
          tags: [
            {name: 'chatgpt', label: 'ChatGPT', permalink: '/tags/chatgpt'}, 
            {name: '量化策略', label: '量化策略', permalink: '/tags/量化策略'}
          ]
        }
      },
      {
        metadata: {
          title: 'Cursor开了会员用不了gpt5',
          date: '2025-08-11',
          permalink: '/blog/Cursor开了会员用不了gpt5',
          tags: [
            {name: 'chatgpt', label: 'ChatGPT', permalink: '/tags/chatgpt'}, 
            {name: '量化策略', label: '量化策略', permalink: '/tags/量化策略'}
          ]
        }
      },
      {
        metadata: {
          title: '欢迎来到 Frank Quant',
          date: '2024-12-01',
          permalink: '/blog/welcome',
          tags: [
            {name: 'welcome', label: '欢迎', permalink: '/tags/welcome'}, 
            {name: 'introduction', label: '介绍', permalink: '/tags/introduction'}
          ]
        }
      }
    ];

    // 按年份分组博客
    const groups = {};
    const tagCounts = {};

    mockPosts
      .sort((a, b) => new Date(b.metadata.date) - new Date(a.metadata.date))
      .forEach(post => {
        const year = new Date(post.metadata.date).getFullYear();
        if (!groups[year]) {
          groups[year] = [];
        }
        groups[year].push(post);

        // 统计标签
        if (post.metadata.tags) {
          post.metadata.tags.forEach(tag => {
            const tagName = typeof tag === 'string' ? tag : tag.name;
            const tagLabel = typeof tag === 'string' ? tag : tag.label;
            const tagPermalink = typeof tag === 'string' ? `/tags/${tag}` : tag.permalink;
            
            if (!tagCounts[tagName]) {
              tagCounts[tagName] = {
                label: tagLabel,
                permalink: tagPermalink,
                count: 0
              };
            }
            tagCounts[tagName].count++;
          });
        }
      });

    setYearGroups(groups);
    setTags(tagCounts);

    // 默认展开当前年份
    const currentYear = new Date().getFullYear();
    if (groups[currentYear]) {
      setExpandedYears(new Set([currentYear]));
    }
  }, []);

  const toggleYear = (year) => {
    const newExpanded = new Set(expandedYears);
    if (newExpanded.has(year)) {
      newExpanded.delete(year);
    } else {
      newExpanded.add(year);
    }
    setExpandedYears(newExpanded);
  };

  const toggleTags = () => {
    setTagsExpanded(!tagsExpanded);
  };

  const sortedYears = Object.keys(yearGroups).sort((a, b) => b - a);

  return (
    <aside className={styles.blogSidebar}>
      <div className={styles.sidebarHeader}>
        <h3 className={styles.sidebarTitle}>博客导航</h3>
      </div>
      
      <nav className={styles.sidebarNav}>
        {/* 按年份分组 */}
        <div className={styles.yearSection}>
          <h4 className={styles.sectionTitle}>按年份</h4>
          {sortedYears.map(year => (
            <YearGroup
              key={year}
              year={year}
              posts={yearGroups[year]}
              isExpanded={expandedYears.has(parseInt(year))}
              onToggle={() => toggleYear(parseInt(year))}
            />
          ))}
        </div>

        {/* 标签分组 */}
        <div className={styles.tagSection}>
          <TagGroup
            tags={tags}
            isExpanded={tagsExpanded}
            onToggle={toggleTags}
          />
        </div>
      </nav>
    </aside>
  );
}
