---
id: intro
title: Freqtrade 主页
sidebar_label: 01 Home主页
description: Freqtrade 官网 Home 页内容的中文翻译，包含简介、特性、支持的交易所、系统要求、支持渠道与入门指引。
---

> 原文来源：[`https://www.freqtrade.io/en/stable/`](https://www.freqtrade.io/en/stable/)

:::note 给中文学习者的小提示
本页面为面向中文读者的学习友好版本，保留原站的结构、标题层级、提示框与代码块等格式，便于对照阅读。
:::
![](../../../static/img/Pasted%20image%2020250909223047.png)
## 简介

Freqtrade 是用 Python 编写的免费开源加密交易机器人，支持主流交易所，并可通过 Telegram 或 WebUI 控制。它内置了回测、绘图、资金管理工具，并可使用机器学习对策略进行优化。

:::warning 免责声明
本软件仅用于教育目的。不要冒险使用你无法承受亏损的资金。使用本软件需自担风险。作者及所有相关方不对你的交易结果承担任何责任。

务必先以干跑（Dry-run）模式运行交易机器人，在充分了解其工作方式及潜在收益/亏损之前，不要投入真实资金。

我们强烈建议你具备基本的编码能力与 Python 知识。请阅读源码并理解该机器人实现的机制、算法与技术。
:::

![](../../../static/img/Pasted%20image%2020250909223111.png)

## 特性

- **开发你的策略**：使用 Python 和 pandas 编写策略。[策略仓库](https://github.com/freqtrade/freqtrade-strategies)中的示例策略可为你提供灵感。
- **下载市场数据**：下载你可能要交易的交易所和市场的历史数据。
- **回测**：在下载的历史数据上测试你的策略。
- **优化**：使用采用机器学习方法的超参数优化为你的策略找到最佳参数。你可以优化策略的买入、卖出、止盈（ROI）、止损和跟踪止损参数。
- **选择市场**：创建静态列表或使用基于成交量最高和/或价格的自动列表（回测期间不可用）。你也可以明确将不想交易的市场加入黑名单。
- **运行**：使用模拟资金测试你的策略（干跑模式）或使用真实资金部署（实盘交易模式）。
- **控制/监控**：使用 Telegram 或 WebUI（启动/停止机器人，显示盈亏、每日摘要、当前开放交易结果等）。
- **分析**：可以对回测数据或 Freqtrade 交易历史（SQL 数据库）进行进一步分析，包括自动化标准图表，以及将数据加载到交互式环境的方法。

## 支持的交易所市场

请阅读[交易所专用说明](https://www.freqtrade.io/en/stable/exchanges/)了解每个交易所可能需要的特殊配置。

* [Binance](https://www.freqtrade.io/en/stable/exchanges/#binance)
* [BingX](https://www.freqtrade.io/en/stable/exchanges/#bingx)
* [Bitmart](https://www.freqtrade.io/en/stable/exchanges/#bitmart)
* [Bybit](https://www.freqtrade.io/en/stable/exchanges/#bybit)
* [Gate.io](https://www.freqtrade.io/en/stable/exchanges/#gateio)
* [HTX](https://www.freqtrade.io/en/stable/exchanges/#htx)
* [Hyperliquid](https://www.freqtrade.io/en/stable/exchanges/#hyperliquid)（去中心化交易所，DEX）
* [Kraken](https://www.freqtrade.io/en/stable/exchanges/#kraken)
* [OKX](https://www.freqtrade.io/en/stable/exchanges/#okx)
* [MyOKX](https://www.freqtrade.io/en/stable/exchanges/#okx)（OKX EEA）
* 以及更多可能通过 [ccxt](https://github.com/ccxt/ccxt) 支持的交易所。_（我们不能保证它们都能正常工作）_

### 支持的期货交易所（实验性）

* [Binance](https://www.freqtrade.io/en/stable/exchanges/#binance)
* [Bybit](https://www.freqtrade.io/en/stable/exchanges/#bybit)
* [Gate.io](https://www.freqtrade.io/en/stable/exchanges/#gateio)
* [Hyperliquid](https://www.freqtrade.io/en/stable/exchanges/#hyperliquid)（去中心化交易所，DEX）
* [OKX](https://www.freqtrade.io/en/stable/exchanges/#okx)

在开始之前，请务必阅读[交易所专用说明](https://www.freqtrade.io/en/stable/exchanges/)以及[杠杆交易文档](https://www.freqtrade.io/en/stable/leverage/)。

### 社区测试确认可用

被社区确认可用的交易所：

- Bitvavo
- Kucoin（库币）

## 社区展示

本节将重点介绍社区成员的一些项目。

:::note 注意
以下项目大部分不由 freqtrade 维护，因此使用前请自行谨慎评估。
:::

* [示例 freqtrade 策略](https://github.com/freqtrade/freqtrade-strategies)
* [FrequentHippo](https://github.com/hippocritical/frequenthippo) - 干跑/实盘运行和回测统计（by hippocritical）。
* [在线交易对列表生成器](https://www.freqtrade.io/en/stable/includes/pairlist/) (by Blood4rc)。
* [Freqtrade 回测项目](https://github.com/Blood4rc/freqtrade-backtesting-project) (by Blood4rc)。
* [Freqtrade 分析 notebook](https://github.com/froggleston/freqtrade_analysis_notebook) (by Froggleston)。
* [Freqtrade TUI](https://github.com/froggleston/freqtrade-tui) (by Froggleston)。
* [Bot Academy](https://www.botacademy.com.au/) (by stash86) - 关于加密机器人项目的博客。

## 系统要求

### 硬件要求

要运行此机器人，我们建议你使用至少具备以下配置的 Linux 云实例：

* 2GB RAM
* 1GB 磁盘空间
* 2vCPU

### 软件要求

* [Docker](https://docs.docker.com/get-docker/)（推荐）

或者

* Python 3.11+
* pip (pip3)
* git
* [TA-Lib](https://github.com/TA-Lib/ta-lib-python#dependencies)
* virtualenv（推荐）

## 支持

### 帮助 / Discord

对于文档未涵盖的任何问题，或想进一步了解机器人信息，或者只是想与志同道合的人交流，我们鼓励你加入 [Freqtrade discord 服务器](https://discord.gg/p7nuUNVfP7)。

## 准备开始？

请从阅读使用 [docker 的安装指南](https://www.freqtrade.io/en/stable/docker_quickstart/)（推荐），或[无需 docker 的安装指南](https://www.freqtrade.io/en/stable/installation/)开始。

---

以上内容翻译自 Freqtrade 官网主页，原文地址：[https://www.freqtrade.io/en/stable/](https://www.freqtrade.io/en/stable/)


