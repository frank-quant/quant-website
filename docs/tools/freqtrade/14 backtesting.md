---
id: backtesting
title: 回测
sidebar_label: 回测
description: Freqtrade 官方"Backtesting"页面完整中文翻译，详细介绍如何使用历史数据测试策略性能。
---

> 原文来源：[`https://www.freqtrade.io/en/stable/backtesting/`](https://www.freqtrade.io/en/stable/backtesting/)

# 回测

本页解释如何验证您的策略性能通过使用历史数据进行回测。

回测需要可用的历史数据。要了解如何获取您感兴趣的交易对和交易所的数据，请参阅文档中的数据下载部分。

## 回测命令参考

```bash
usage: freqtrade backtesting [-h] [-v] [--logfile FILE] [-V] [-c PATH]
                             [-d PATH] [--userdir PATH] [-s NAME]
                             [--strategy-path PATH]
                             [--recursive-strategy-search]
                             [--freqaimodel NAME] [--freqaimodel-path PATH]
                             [-i TIMEFRAME] [--timerange TIMERANGE]
                             [--data-format-ohlcv {json,jsongz,feather,parquet}]
                             [--max-open-trades INT]
                             [--stake-amount STAKE_AMOUNT] [--fee FLOAT]
                             [-p PAIRS [PAIRS ...]] [--eps]
                             [--enable-protections]
                             [--dry-run-wallet DRY_RUN_WALLET]
                             [--timeframe-detail TIMEFRAME_DETAIL]
                             [--strategy-list STRATEGY_LIST [STRATEGY_LIST ...]]
                             [--export {none,trades,signals}]
                             [--export-filename PATH]
                             [--breakdown {day,week,month,year} [{day,week,month,year} ...]]
                             [--cache {none,day,week,month}]
                             [--freqai-backtest-live-models]
```

### 主要参数

- `-i TIMEFRAME, --timeframe TIMEFRAME` - 指定时间框架（`1m`, `5m`, `30m`, `1h`, `1d`）
- `--timerange TIMERANGE` - 指定要使用的数据时间范围
- `--data-format-ohlcv` - 下载的蜡烛（OHLCV）数据的存储格式（默认：`feather`）
- `--max-open-trades INT` - 覆盖 `max_open_trades` 配置设置的值
- `--stake-amount STAKE_AMOUNT` - 覆盖 `stake_amount` 配置设置的值
- `--fee FLOAT` - 指定费用比例。将应用两次（在交易进入和退出时）
- `-p PAIRS [PAIRS ...], --pairs PAIRS [PAIRS ...]` - 限制命令仅适用于这些交易对。交易对以空格分隔
- `--eps, --enable-position-stacking` - 允许多次购买相同的交易对（位置叠加）
- `--enable-protections, --enableprotections` - 为回测启用保护。这将显著减慢回测速度，但会包括配置的保护措施
- `--dry-run-wallet DRY_RUN_WALLET, --starting-balance DRY_RUN_WALLET` - 起始余额，用于回测/超参数优化和干跑
- `--timeframe-detail TIMEFRAME_DETAIL` - 指定回测的详细时间框架（`1m`, `5m`, `30m`, `1h`, `1d`）
- `--strategy-list STRATEGY_LIST [STRATEGY_LIST ...]` - 指定要回测的策略列表
- `--export {none,trades,signals}` - 导出回测结果（none, trades, signals）
- `--export-filename PATH` - 指定导出文件的路径
- `--breakdown {day,week,month,year}` - 显示按天、周、月、年分解的回测结果
- `--cache {none,day,week,month}` - 加载不超过指定年龄的缓存回测结果（默认：day）
- `--freqai-backtest-live-models` - 使用现有模型运行回测

## 基本回测示例

### 简单回测

```bash
# 基本回测
freqtrade backtesting \
  --config user_data/config.json \
  --strategy SampleStrategy \
  --timerange 20230101-20231231
```

### 指定时间框架

```bash
# 在 5 分钟时间框架上回测
freqtrade backtesting \
  --config user_data/config.json \
  --strategy SampleStrategy \
  --timeframe 5m \
  --timerange 20230101-20231231
```

### 多交易对回测

```bash
# 回测特定交易对
freqtrade backtesting \
  --config user_data/config.json \
  --strategy SampleStrategy \
  --pairs BTC/USDT ETH/USDT BNB/USDT \
  --timerange 20230101-20231231
```

## 高级回测选项

### 详细时间框架

```bash
# 使用详细时间框架进行更精确的回测
freqtrade backtesting \
  --config user_data/config.json \
  --strategy SampleStrategy \
  --timeframe 5m \
  --timeframe-detail 1m \
  --timerange 20230101-20230201
```

:::note 详细时间框架
使用 `--timeframe-detail` 可以提高回测精度，但会显著增加计算时间和内存使用。
:::

### 启用保护

```bash
# 启用保护机制的回测
freqtrade backtesting \
  --config user_data/config.json \
  --strategy SampleStrategy \
  --enable-protections \
  --timerange 20230101-20231231
```

:::warning 性能影响
启用保护会显著减慢回测速度，但提供更真实的结果。
:::

### 多策略回测

```bash
# 同时回测多个策略
freqtrade backtesting \
  --config user_data/config.json \
  --strategy-list Strategy1 Strategy2 Strategy3 \
  --timerange 20230101-20231231
```

## 结果导出和分析

### 导出交易数据

```bash
# 导出交易详情
freqtrade backtesting \
  --config user_data/config.json \
  --strategy SampleStrategy \
  --timerange 20230101-20231231 \
  --export trades \
  --export-filename user_data/backtest_results/my_backtest.json
```

### 导出信号数据

```bash
# 导出入场和出场信号
freqtrade backtesting \
  --config user_data/config.json \
  --strategy SampleStrategy \
  --timerange 20230101-20231231 \
  --export signals \
  --export-filename user_data/backtest_results/signals.json
```

### 分解分析

```bash
# 按月分解结果
freqtrade backtesting \
  --config user_data/config.json \
  --strategy SampleStrategy \
  --timerange 20230101-20231231 \
  --breakdown month

# 按周分解结果
freqtrade backtesting \
  --config user_data/config.json \
  --strategy SampleStrategy \
  --timerange 20230101-20231231 \
  --breakdown week day
```

## 回测结果分析

### 查看回测结果

```bash
# 显示过去的回测结果
freqtrade backtesting-show

# 显示特定回测结果
freqtrade backtesting-show --backtest-filename user_data/backtest_results/backtest-result-2023-01-01_12-00-00.json
```

### 回测分析

```bash
# 分析回测结果
freqtrade backtesting-analysis \
  --config user_data/config.json \
  --analysis-groups 0 1 2 \
  --enter-reason-list rsi_oversold bb_lower \
  --exit-reason-list roi stop_loss
```

## 理解回测结果

### 主要指标

回测完成后，您将看到类似以下的结果：

```
============ BACKTESTING REPORT ============
|      Metric |                Value |
|-------------|----------------------|
|   Backtesting from |     2023-01-01 00:00:00 |
|   Backtesting to   |     2023-12-31 23:59:00 |
|   Max open trades  |                    3 |
|                    |                      |
|   Total/Daily Avg Trades |     85 / 0.23 |
|   Starting balance |              1000 USDT |
|   Final balance    |              1234.56 USDT |
|   Absolute profit  |              234.56 USDT |
|   Total profit %   |                23.46% |
|   CAGR %           |                25.12% |
|   Profit factor    |                  1.34 |
|   Trades per day   |                  0.23 |
|   Avg. daily profit % |              0.064% |
|   Avg. stake amount |               33.33 USDT |
|   Total trade volume |            2833.05 USDT |
|                    |                      |
|   Best Pair        |     ETH/USDT 45.67% |
|   Worst Pair       |     ADA/USDT -12.34% |
|   Best trade       |              12.34% |
|   Worst trade      |              -5.67% |
|   Best day         |              23.45% |
|   Worst day        |              -8.91% |
|   Days win/draw/lose |       123 / 45 / 67 |
|   Avg. Duration Winners |         4:12:00 |
|   Avg. Duration Loser |           2:34:00 |
|   Rejected Entry signals |               12 |
|                    |                      |
|   Min balance      |              987.65 USDT |
|   Max balance      |             1345.67 USDT |
|   Max % of account underwater |      -1.23% |
|   Absolute Drawdown (Account) |     -12.35 USDT |
|   Absolute Drawdown % |           -1.23% |
|   Max Drawdown (Account) |        -23.45 USDT |
|   Max Drawdown % |               -2.34% |
|   Max Drawdown Duration |        12:34:00 |
|   Max Drawdown Duration (Account) | 23:45:00 |
|                    |                      |
|   Sharpe Ratio     |                 1.23 |
|   Sortino Ratio    |                 1.45 |
|   Calmar Ratio     |                 1.12 |
```

### 关键指标解释

- **Total profit %** - 总利润百分比
- **CAGR %** - 复合年增长率
- **Profit factor** - 盈利交易总额 / 亏损交易总额
- **Sharpe Ratio** - 风险调整后收益
- **Max Drawdown** - 最大回撤
- **Win Rate** - 胜率

## 回测最佳实践

### 1. 使用足够的历史数据

```bash
# 至少使用 1 年的数据
freqtrade backtesting \
  --config user_data/config.json \
  --strategy SampleStrategy \
  --timerange 20220101-20231231
```

### 2. 测试不同市场条件

```bash
# 牛市期间
freqtrade backtesting --timerange 20210101-20211231

# 熊市期间  
freqtrade backtesting --timerange 20220101-20221231

# 震荡市期间
freqtrade backtesting --timerange 20230101-20231231
```

### 3. 使用现实的费用

```bash
# 设置实际的交易费用
freqtrade backtesting \
  --config user_data/config.json \
  --strategy SampleStrategy \
  --fee 0.001  # 0.1% 费用
```

### 4. 启用保护测试

```bash
# 测试保护机制
freqtrade backtesting \
  --config user_data/config.json \
  --strategy SampleStrategy \
  --enable-protections \
  --timerange 20230101-20231231
```

## 回测缓存

Freqtrade 会缓存回测结果以提高性能。

### 缓存设置

```bash
# 不使用缓存
freqtrade backtesting --cache none

# 使用日缓存（默认）
freqtrade backtesting --cache day

# 使用周缓存
freqtrade backtesting --cache week

# 使用月缓存
freqtrade backtesting --cache month
```

### 清除缓存

```bash
# 删除缓存文件
rm -rf user_data/backtest_results/.bt_data/
```

## 回测假设和限制

### 重要假设

:::warning 回测假设
回测基于以下假设，这些可能与实际交易不同：

1. **订单成交假设** - 假设所有限价单都会成交
2. **滑点忽略** - 不考虑市场滑点
3. **流动性假设** - 假设有足够的流动性
4. **时间精度** - 基于蜡烛时间，不是实际成交时间
5. **费用简化** - 使用固定费用率
:::

### 与实盘的差异

1. **订单成交**
   - 回测：假设所有订单都成交
   - 实盘：订单可能部分成交或不成交

2. **价格精度**
   - 回测：使用 OHLCV 数据
   - 实盘：使用实时 tick 数据

3. **网络延迟**
   - 回测：无延迟
   - 实盘：存在网络和处理延迟

4. **滑点**
   - 回测：不考虑滑点
   - 实盘：存在价格滑点

## 回测策略优化

### 参数测试

```bash
# 测试不同的投注金额
freqtrade backtesting --stake-amount 10
freqtrade backtesting --stake-amount 50
freqtrade backtesting --stake-amount 100

# 测试不同的最大开仓数
freqtrade backtesting --max-open-trades 1
freqtrade backtesting --max-open-trades 3
freqtrade backtesting --max-open-trades 5
```

### 时间范围分析

```bash
# 分析不同时间段
freqtrade backtesting --timerange 20230101-20230331  # Q1
freqtrade backtesting --timerange 20230401-20230630  # Q2
freqtrade backtesting --timerange 20230701-20230930  # Q3
freqtrade backtesting --timerange 20231001-20231231  # Q4
```

## 回测结果可视化

### 生成图表

```bash
# 生成利润图表
freqtrade plot-profit \
  --config user_data/config.json \
  --strategy SampleStrategy \
  --timerange 20230101-20231231

# 生成数据框图表
freqtrade plot-dataframe \
  --config user_data/config.json \
  --strategy SampleStrategy \
  --pairs BTC/USDT \
  --timerange 20230101-20230201
```

### Jupyter Notebook 分析

```python
# 在 Jupyter Notebook 中分析结果
import pandas as pd
import json

# 加载回测结果
with open('user_data/backtest_results/backtest-result-2023-01-01_12-00-00.json') as f:
    results = json.load(f)

# 转换为 DataFrame
trades_df = pd.DataFrame(results['strategy']['SampleStrategy']['trades'])

# 分析交易
print(f"总交易数: {len(trades_df)}")
print(f"胜率: {(trades_df['profit_ratio'] > 0).mean():.2%}")
print(f"平均利润: {trades_df['profit_ratio'].mean():.2%}")
print(f"最大单次利润: {trades_df['profit_ratio'].max():.2%}")
print(f"最大单次亏损: {trades_df['profit_ratio'].min():.2%}")
```

## 回测验证

### 前瞻偏差检查

```bash
# 检查前瞻偏差
freqtrade lookahead-analysis \
  --config user_data/config.json \
  --strategy SampleStrategy \
  --timerange 20230101-20230201

# 检查递归问题
freqtrade recursive-analysis \
  --config user_data/config.json \
  --strategy SampleStrategy \
  --timerange 20230101-20230201
```

### 稳健性测试

```bash
# 不同起始日期测试
freqtrade backtesting --timerange 20230101-20231231
freqtrade backtesting --timerange 20230115-20240114
freqtrade backtesting --timerange 20230201-20240131

# 不同交易对组合测试
freqtrade backtesting --pairs BTC/USDT ETH/USDT
freqtrade backtesting --pairs BTC/USDT ETH/USDT BNB/USDT ADA/USDT
freqtrade backtesting --pairs BTC/USDT ETH/USDT BNB/USDT ADA/USDT DOT/USDT
```

## 常见回测错误

### 1. 过度拟合

```python
# 错误：参数过度拟合特定时间段
minimal_roi = {
    "0": 0.12345,  # 过于精确的参数
    "23": 0.06789,
    "87": 0.01234
}

# 改进：使用合理的参数
minimal_roi = {
    "0": 0.10,
    "30": 0.05,
    "60": 0.02,
    "120": 0
}
```

### 2. 前瞻偏差

```python
# 错误：使用未来数据
def populate_indicators(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
    dataframe['future_high'] = dataframe['high'].shift(-1)  # 错误！
    return dataframe

# 正确：只使用历史数据
def populate_indicators(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
    dataframe['prev_high'] = dataframe['high'].shift(1)  # 正确
    return dataframe
```

### 3. 数据不足

```bash
# 错误：数据太少
freqtrade backtesting --timerange 20231201-20231231  # 只有 1 个月

# 改进：使用足够的数据
freqtrade backtesting --timerange 20230101-20231231  # 1 年数据
```

### 4. 忽略费用

```bash
# 错误：不设置费用
freqtrade backtesting --config user_data/config.json

# 改进：设置现实的费用
freqtrade backtesting --config user_data/config.json --fee 0.001
```

## 回测性能优化

### 1. 使用缓存

```bash
# 利用缓存加速重复回测
freqtrade backtesting --cache day  # 默认
```

### 2. 选择合适的数据格式

```bash
# 使用 feather 格式获得最佳性能
freqtrade backtesting --data-format-ohlcv feather
```

### 3. 限制数据量

```bash
# 使用较短的时间范围进行快速测试
freqtrade backtesting --timerange 20231101-20231130

# 使用较少的交易对
freqtrade backtesting --pairs BTC/USDT ETH/USDT
```

### 4. 并行处理

```bash
# 使用多个 CPU 核心（如果支持）
export NUMBA_NUM_THREADS=4
freqtrade backtesting --config user_data/config.json
```

## 回测后的步骤

### 1. 结果验证

- 检查胜率是否合理（通常 30-60%）
- 验证最大回撤是否可接受
- 确认 Sharpe 比率为正数

### 2. 干跑验证

```bash
# 在干跑模式下验证策略
freqtrade trade \
  --config user_data/config.json \
  --strategy SampleStrategy \
  --dry-run
```

### 3. 参数优化

如果回测结果不理想，考虑使用超参数优化：

```bash
freqtrade hyperopt \
  --config user_data/config.json \
  --strategy SampleStrategy \
  --hyperopt-loss SharpeHyperOptLoss \
  --spaces roi stoploss trailing
```

## 下一步

完成回测后，您可能想要优化策略参数。您的下一步是阅读"超参数优化"文档。
