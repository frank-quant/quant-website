---
id: data-downloading
title: 数据下载
sidebar_label: 数据下载
description: Freqtrade 官方"Data Downloading"页面完整中文翻译，详细介绍如何下载和管理历史市场数据。
---

> 原文来源：[`https://www.freqtrade.io/en/stable/data-download/`](https://www.freqtrade.io/en/stable/data-download/)

# 数据下载

为了进行回测，您需要历史数据。本页解释如何获取这些数据。

## 数据下载命令

```bash
usage: freqtrade download-data [-h] [-v] [--logfile FILE] [-V] [-c PATH]
                               [-d PATH] [--userdir PATH]
                               [--pairs PAIRS [PAIRS ...]] [--pairs-file FILE]
                               [--days INT] [--timerange TIMERANGE]
                               [--dl-trades] [--exchange EXCHANGE]
                               [-t {1m,3m,5m,15m,30m,1h,2h,4h,6h,8h,12h,1d,3d,1w,2w,1M,1y} [{1m,3m,5m,15m,30m,1h,2h,4h,6h,8h,12h,1d,3d,1w,2w,1M,1y} ...]]
                               [--erase] [--erase-ui-only]
                               [--data-format-ohlcv {json,jsongz,feather,parquet}]
                               [--data-format-trades {json,jsongz,feather,parquet}]
                               [--trading-mode {spot,margin,futures}]
```

### 基本用法

```bash
# 下载默认交易对的数据
freqtrade download-data --exchange binance

# 下载特定交易对
freqtrade download-data --exchange binance --pairs BTC/USDT ETH/USDT

# 下载特定时间框架
freqtrade download-data --exchange binance --timeframes 1m 5m 1h 1d

# 下载指定天数的数据
freqtrade download-data --exchange binance --days 30
```

### 主要参数

- `--pairs PAIRS [PAIRS ...]` - 要下载的交易对空格分隔列表
- `--pairs-file FILE` - 从文件读取交易对列表
- `--days INT` - 下载的天数（从今天开始倒推）
- `--timerange TIMERANGE` - 指定要下载的时间范围
- `--dl-trades` - 下载交易数据而不是 OHLCV 数据
- `--exchange EXCHANGE` - 要使用的交易所
- `-t, --timeframes` - 要下载的时间框架
- `--erase` - 在下载前清除现有数据
- `--data-format-ohlcv` - OHLCV 数据的存储格式
- `--data-format-trades` - 交易数据的存储格式
- `--trading-mode` - 交易模式（现货/保证金/期货）

## 数据下载示例

### 基本下载示例

```bash
# 下载 Binance 的 BTC/USDT 和 ETH/USDT 最近 30 天的 5 分钟数据
freqtrade download-data \
  --exchange binance \
  --pairs BTC/USDT ETH/USDT \
  --timeframes 5m \
  --days 30
```

### 高级下载示例

```bash
# 下载多个时间框架的数据
freqtrade download-data \
  --exchange binance \
  --pairs BTC/USDT ETH/USDT ADA/USDT \
  --timeframes 1m 5m 15m 1h 4h 1d \
  --days 90 \
  --data-format-ohlcv feather
```

### 使用时间范围

```bash
# 下载特定时间范围的数据
freqtrade download-data \
  --exchange binance \
  --pairs BTC/USDT \
  --timeframes 5m \
  --timerange 20230101-20231231
```

### 从文件读取交易对

创建 `pairs.txt` 文件：
```
BTC/USDT
ETH/USDT
BNB/USDT
ADA/USDT
DOT/USDT
```

```bash
# 从文件读取交易对列表
freqtrade download-data \
  --exchange binance \
  --pairs-file pairs.txt \
  --timeframes 5m 1h \
  --days 30
```

## 支持的交易所

Freqtrade 支持多个交易所的数据下载：

### 主要交易所

- **Binance** - 全功能支持
- **Bybit** - 现货和期货
- **OKX** - 现货和期货
- **Gate.io** - 现货和期货
- **Kraken** - 现货
- **Bitfinex** - 现货
- **Huobi/HTX** - 现货和期货

### 检查支持的交易所

```bash
# 列出所有支持的交易所
freqtrade list-exchanges

# 列出支持的时间框架
freqtrade list-timeframes --exchange binance

# 列出可用的交易对
freqtrade list-pairs --exchange binance --quote USDT
```

## 数据格式

Freqtrade 支持多种数据存储格式：

### OHLCV 数据格式

- **json** - JSON 格式（可读但较大）
- **jsongz** - 压缩的 JSON 格式
- **feather** - Apache Arrow 格式（推荐，快速）
- **parquet** - Apache Parquet 格式（压缩好）

```bash
# 使用 feather 格式（推荐）
freqtrade download-data --data-format-ohlcv feather

# 使用 parquet 格式（节省空间）
freqtrade download-data --data-format-ohlcv parquet
```

### 交易数据格式

```bash
# 下载交易数据
freqtrade download-data --dl-trades --data-format-trades feather
```

## 数据管理

### 查看已下载的数据

```bash
# 列出所有已下载的数据
freqtrade list-data --data-format-ohlcv feather

# 查看特定交易对的数据
freqtrade list-data --pairs BTC/USDT --data-format-ohlcv feather
```

### 数据目录结构

```
user_data/data/
└── binance/
    ├── BTC_USDT-5m.feather
    ├── BTC_USDT-1h.feather
    ├── BTC_USDT-1d.feather
    ├── ETH_USDT-5m.feather
    └── futures/
        ├── BTC_USDT_USDT-5m-futures.feather
        └── BTC_USDT_USDT-funding_rate.feather
```

### 清理数据

```bash
# 清除所有数据并重新下载
freqtrade download-data --erase --exchange binance --pairs BTC/USDT

# 仅清除 UI 数据
freqtrade download-data --erase-ui-only
```

## 期货数据下载

### 下载期货数据

```bash
# 下载期货 OHLCV 数据
freqtrade download-data \
  --exchange binance \
  --trading-mode futures \
  --pairs BTC/USDT:USDT ETH/USDT:USDT \
  --timeframes 5m 1h

# 下载资金费率数据
freqtrade download-data \
  --exchange binance \
  --trading-mode futures \
  --pairs BTC/USDT:USDT \
  --timeframes 8h \
  --dl-trades
```

### 期货交易对格式

```bash
# 期货交易对使用 base/quote:settle 格式
freqtrade download-data \
  --exchange binance \
  --trading-mode futures \
  --pairs BTC/USDT:USDT ETH/USDT:USDT SOL/USDT:USDT
```

## 数据转换

### 格式转换

```bash
# 将 JSON 数据转换为 feather 格式
freqtrade convert-data \
  --format-from json \
  --format-to feather \
  --datadir user_data/data

# 将交易数据转换为 OHLCV
freqtrade trades-to-ohlcv \
  --exchange binance \
  --pairs BTC/USDT \
  --timeframes 1m 5m
```

### 数据验证

```bash
# 验证下载的数据
freqtrade list-data \
  --exchange binance \
  --data-format-ohlcv feather \
  --pairs BTC/USDT ETH/USDT
```

## 数据下载策略

### 1. 按需下载

```bash
# 只下载回测需要的数据
freqtrade download-data \
  --exchange binance \
  --pairs BTC/USDT ETH/USDT \
  --timeframes 5m \
  --days 365
```

### 2. 批量下载

```bash
# 下载大量数据用于多策略测试
freqtrade download-data \
  --exchange binance \
  --pairs-file top_20_pairs.txt \
  --timeframes 1m 5m 15m 1h 4h 1d \
  --days 730
```

### 3. 增量更新

```bash
# 定期更新数据（不使用 --erase）
freqtrade download-data \
  --exchange binance \
  --pairs BTC/USDT ETH/USDT \
  --timeframes 5m 1h \
  --days 7
```

## 自动化数据下载

### 使用 cron 定时下载

```bash
# 编辑 crontab
crontab -e

# 添加每日数据更新任务
0 1 * * * cd /path/to/freqtrade && source .venv/bin/activate && freqtrade download-data --exchange binance --pairs-file pairs.txt --timeframes 5m 1h --days 2
```

### 使用脚本自动下载

```bash
#!/bin/bash
# update_data.sh

cd /path/to/freqtrade
source .venv/bin/activate

freqtrade download-data \
  --exchange binance \
  --pairs BTC/USDT ETH/USDT BNB/USDT \
  --timeframes 1m 5m 1h 1d \
  --days 3

echo "数据更新完成: $(date)"
```

## 数据质量检查

### 检查数据完整性

```python
# Python 脚本检查数据质量
import pandas as pd
from pathlib import Path

def check_data_quality(pair, timeframe, exchange='binance'):
    file_path = Path(f"user_data/data/{exchange}/{pair.replace('/', '_')}-{timeframe}.feather")
    
    if not file_path.exists():
        print(f"数据文件不存在: {file_path}")
        return
    
    df = pd.read_feather(file_path)
    
    # 检查数据完整性
    print(f"交易对: {pair}, 时间框架: {timeframe}")
    print(f"数据行数: {len(df)}")
    print(f"数据范围: {df['date'].min()} 到 {df['date'].max()}")
    print(f"缺失值: {df.isnull().sum().sum()}")
    
    # 检查数据间隔
    time_diff = df['date'].diff().mode()[0]
    print(f"时间间隔: {time_diff}")
    
    return df

# 使用示例
check_data_quality('BTC/USDT', '5m')
```

## 故障排除

### 常见下载问题

1. **网络超时**
   ```bash
   # 使用较小的批次下载
   freqtrade download-data --days 10  # 而不是 --days 365
   ```

2. **API 限制**
   ```bash
   # 添加延迟避免限制
   freqtrade download-data --exchange binance --sleep 1
   ```

3. **磁盘空间不足**
   ```bash
   # 检查磁盘空间
   df -h user_data/data/
   
   # 使用压缩格式
   freqtrade download-data --data-format-ohlcv parquet
   ```

4. **交易对不存在**
   ```bash
   # 检查交易所支持的交易对
   freqtrade list-pairs --exchange binance --quote USDT
   ```

### 数据修复

```bash
# 重新下载损坏的数据
freqtrade download-data \
  --erase \
  --exchange binance \
  --pairs BTC/USDT \
  --timeframes 5m \
  --days 30
```

## 下一步

现在您已经下载了历史数据，可以开始回测您的策略。您的下一步是阅读"回测"文档。
