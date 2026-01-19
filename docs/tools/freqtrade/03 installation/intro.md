---
id: intro
title: 安装概览
sidebar_label: 简介
description: Freqtrade 安装指南概览，包含多种操作系统的安装方式选择。
---

# 安装

本节包含 Freqtrade 的完整安装指南，涵盖多种操作系统和安装方式。

## 支持的平台

Freqtrade 支持以下平台的安装：

- **Linux/MacOS/Raspberry Pi**：推荐平台，支持完整功能
- **Windows**：支持但相对复杂，推荐使用 Docker 或 WSL2
- **Docker**：所有平台推荐的快速开始方式

## 安装方式选择

根据您的需求和技术水平，可以选择以下安装方式：

### 🐳 Docker（推荐新手）
- **优点**：快速开始，环境隔离，跨平台一致
- **适用于**：快速评估、生产环境、所有平台
- **文档**：参见"Docker 快速开始"

### 📜 脚本安装（推荐 Linux/MacOS）
- **优点**：自动化安装，处理依赖
- **适用于**：Linux、MacOS 用户
- **要求**：Python 3.11+、git

### 🔧 手动安装（高级用户）
- **优点**：完全控制安装过程
- **适用于**：有经验的开发者
- **要求**：熟悉 Python 环境管理

### 🐍 Conda 安装
- **优点**：包管理便捷，依赖处理好
- **适用于**：已使用 Anaconda/Miniconda 的用户
- **要求**：预装 Conda

## 选择您的平台

请根据您的操作系统选择对应的安装指南：

- [Linux/MacOS/Raspberry Pi 安装](linux-macos.md)
- [Windows 安装](windows.md)

## 通用要求

无论选择哪种安装方式，都需要满足以下基本要求：

:::warning 必要条件
- **Python 3.11** 或更高版本
- **Git**（用于克隆代码仓库）  
- **稳定的网络连接**（下载依赖包）
- **准确的系统时钟**（与 NTP 服务器同步）
:::

:::tip 推荐配置
- **2GB+ RAM**（运行机器人）
- **1GB+ 磁盘空间**（代码和数据）
- **2+ CPU 核心**（回测和优化）
:::

## 安装后步骤

成功安装 Freqtrade 后，您需要：

1. **初始化配置**：创建用户目录和配置文件
2. **下载数据**：获取历史市场数据用于回测
3. **创建策略**：编写或选择交易策略
4. **回测验证**：在历史数据上测试策略
5. **干跑测试**：使用模拟资金验证策略
6. **实盘部署**：谨慎地切换到真实交易

## 获取帮助

如果在安装过程中遇到问题：

- 查看对应平台的故障排除部分
- 访问 [Freqtrade Discord 社区](https://discord.gg/freqtrade)
- 查看 [GitHub Issues](https://github.com/freqtrade/freqtrade/issues)
- 阅读 [FAQ 文档](https://www.freqtrade.io/en/stable/faq/)

---

:::note 文档来源
本安装指南翻译自 Freqtrade 官方文档，并保持与最新版本同步。如有疑问，请参考英文原版文档。
:::
